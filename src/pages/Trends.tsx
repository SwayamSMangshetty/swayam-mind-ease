import React, { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Smile, Sun, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { moodValues, generatePath, generateFilledPath, ChartDataPoint, calculateInsights, generateRolling7DayData } from '../utils/chartUtils';

const Trends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [moodData, setMoodData] = useState<ChartDataPoint[]>([]);
  const [insights, setInsights] = useState({
    mostFrequentMood: '',
    moodEntriesCount: 0,
    journalEntriesCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSpecificInsights = async (period: string) => {
    if (!user) return;

    try {
      const now = new Date();
      let startDate: Date;
      let periodLabel = '';
      
      if (period === 'Week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        periodLabel = 'week';
      } else if (period === 'Month') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        periodLabel = 'month';
      } else { // Year
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        periodLabel = 'year';
      }

      // Get mood entries for the period
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (moodError) throw moodError;

      // Get journal entries for the period
      const { data: journalData, error: journalError } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (journalError) throw journalError;

      // Calculate most frequent mood
      const moodCounts: { [key: string]: number } = {};
      moodData?.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      let mostFrequentMood = 'None';
      let maxCount = 0;
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentMood = mood.charAt(0).toUpperCase() + mood.slice(1);
        }
      });

      setInsights({
        mostFrequentMood: `Most frequent mood this ${periodLabel}: ${mostFrequentMood}`,
        moodEntriesCount: moodData?.length || 0,
        journalEntriesCount: journalData?.length || 0
      });
    } catch (err) {
      console.error('Failed to calculate insights:', err);
      setInsights({
        mostFrequentMood: 'Unable to calculate',
        moodEntriesCount: 0,
        journalEntriesCount: 0
      });
    }
  };
  const fetchMoodTrends = async (period: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      let startDate: Date;
      let labels: string[] = [];
      
      // Calculate date range and labels based on period
      if (period === 'Week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'Month') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else { // Year
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      }
      
      // Fetch mood entries from database
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Process data based on period
      const processedData: ChartDataPoint[] = [];
      
      if (period === 'Week') {
        // Use rolling 7-day data
        const rollingData = generateRolling7DayData(data || []);
        processedData.push(...rollingData);
      } else if (period === 'Month') {
        // Group by weeks
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        for (let week = 0; week < 4; week++) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (28 - week * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const weekEntries = data?.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return entryDate >= weekStart && entryDate <= weekEnd;
          }) || [];
          
          let value: number | null = null;
          if (weekEntries.length > 0) {
            const sum = weekEntries.reduce((acc, entry) => acc + (moodValues[entry.mood] || 6), 0);
            value = sum / weekEntries.length;
          }
          
          processedData.push({
            label: labels[week],
            value: value !== null ? value : 6,
            day: labels[week]
          });
        }
      } else { // Year
        // Group by months
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(now.getFullYear(), month, 1);
          const monthEnd = new Date(now.getFullYear(), month + 1, 0);
          
          const monthEntries = data?.filter(entry => {
            const entryDate = new Date(entry.created_at);
            return entryDate >= monthStart && entryDate <= monthEnd;
          }) || [];
          
          let value: number | null = null;
          if (monthEntries.length > 0) {
            const sum = monthEntries.reduce((acc, entry) => acc + (moodValues[entry.mood] || 6), 0);
            value = sum / monthEntries.length;
          }
          
          processedData.push({
            label: labels[month],
            value: value !== null ? value : 6,
            day: labels[month]
          });
        }
      }
      
      setMoodData(processedData);
      await calculateSpecificInsights(period);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mood trends');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchMoodTrends(selectedPeriod);
    }
  }, [selectedPeriod, user]);

  const periods = ['Week', 'Month', 'Year'];

  const chartHeight = 120;

  // Calculate average mood for display
  const validMoodData = moodData.filter(item => item.value !== null);
  const averageMood = validMoodData.length > 0 
    ? validMoodData.reduce((sum, item) => sum + item.value!, 0) / validMoodData.length 
    : 0;

  const getTimeframe = (period: string) => {
    switch (period) {
      case 'Week': return 'Last 7 days';
      case 'Month': return 'Last 30 days';
      case 'Year': return 'Last 12 months';
      default: return '';
    }
  };

  return (
    <div className="bg-app transition-colors duration-200 min-h-screen">
      {/* Header */}
      <div className="bg-app-light px-4 py-3 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="flex justify-center items-center w-full">
          <h1 className="text-xl font-bold text-app transition-colors duration-200">Trends</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loading */}
          {loading && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-app-muted mt-2">Loading mood trends...</p>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-danger/10 border border-danger rounded-lg p-4 mx-auto max-w-md">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Mood Score */}
          {!loading && (
          <div className="text-center">
            <h2 className="text-lg font-bold text-app mb-1 transition-colors duration-200">Mood</h2>
            <div className="text-4xl font-extrabold text-primary mb-2 transition-colors duration-200">
              {averageMood > 0 ? averageMood.toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm text-app-muted transition-colors duration-200">{getTimeframe(selectedPeriod)}</p>
          </div>
          )}

          {/* Chart */}
          {!loading && moodData.length > 0 && (
          <div>
            <div className="relative">
              {selectedPeriod === 'Year' ? (
                // Year view - mobile scrollable, desktop responsive
                <div className="w-full">
                  {/* Mobile: Scrollable chart */}
                  <div className="sm:hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <div className="min-w-[600px]">
                        <svg 
                          viewBox="0 0 600 120" 
                          className="w-full"
                          style={{ height: `${chartHeight}px` }}
                          preserveAspectRatio="none"
                        >
                          {/* Filled area */}
                          <path
                            d={generateFilledPath(moodData, 600, 120)}
                            fill="var(--primary)"
                            fillOpacity="0.1"
                            stroke="none"
                          />
                          {/* Line */}
                          <path
                            d={generatePath(moodData, 600, 120)}
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        
                        {/* Labels - fixed width for mobile */}
                        <div className="flex justify-between mt-3 px-2">
                          {moodData.map((point, index) => (
                            <div 
                              key={index} 
                              className="text-xs text-app-muted font-medium text-center transition-colors duration-200 flex-shrink-0"
                              style={{ width: `${600 / moodData.length}px` }}
                            >
                              {point.day || point.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Responsive grid */}
                  <div className="hidden sm:block">
                    <svg 
                      viewBox="0 0 800 120" 
                      className="w-full"
                      style={{ height: `${chartHeight}px` }}
                      preserveAspectRatio="none"
                    >
                      {/* Filled area */}
                      <path
                        d={generateFilledPath(moodData, 800, 120)}
                        fill="var(--primary)"
                        fillOpacity="0.1"
                        stroke="none"
                      />
                      {/* Line */}
                      <path
                        d={generatePath(moodData, 800, 120)}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    
                    {/* Labels - responsive grid for desktop */}
                    <div className="grid grid-cols-12 gap-1 mt-3">
                      {moodData.map((point, index) => (
                        <div 
                          key={index} 
                          className="text-xs text-app-muted font-medium text-center transition-colors duration-200"
                        >
                          {point.day || point.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Week and Month views - responsive
                <div className="w-full">
                  <svg 
                    viewBox="0 0 320 120" 
                    className="w-full"
                    style={{ height: `${chartHeight}px` }}
                    preserveAspectRatio="none"
                  >
                    {/* Filled area */}
                    <path
                      d={generateFilledPath(moodData, 320, 120)}
                      fill="var(--primary)"
                      fillOpacity="0.1"
                      stroke="none"
                    />
                    {/* Line */}
                    <path
                      d={generatePath(moodData, 320, 120)}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Labels */}
                  <div className="flex justify-between mt-3">
                    {moodData.map((point, index) => (
                      <span 
                        key={index} 
                        className="text-xs text-app-muted font-medium flex-1 text-center transition-colors duration-200"
                      >
                        {point.day || point.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
          
          {/* Empty State */}
          {!loading && moodData.length === 0 && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <p className="text-app-muted">No mood data available for this period.</p>
            </div>
          )}
          
          {/* No Data Available */}
          {!loading && validMoodData.length === 0 && moodData.length > 0 && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <p className="text-app-muted">No mood entries found for this period. Start tracking your mood to see trends!</p>
            </div>
          )}

          {/* Period Selector */}
          <div>
            <div className="bg-app-dark rounded-full p-1 flex transition-colors duration-200 shadow-sm">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  disabled={loading}
                  className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedPeriod === period
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-app-muted hover:text-app disabled:opacity-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Insights */}
          {!loading && insights.mostFrequentMood && (
          <div>
            <h3 className="text-xl font-bold text-app mb-4 transition-colors duration-200">Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Most Frequent Mood */}
              <div className="flex items-start gap-3 p-4 bg-app-light rounded-lg border border-app-muted transition-colors duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <Smile size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-app mb-1 text-sm transition-colors duration-200">Most Frequent</h4>
                  <p className="text-app-muted text-xs transition-colors duration-200">{insights.mostFrequentMood}</p>
                </div>
              </div>

              {/* Mood Entries Count */}
              <div className="flex items-start gap-3 p-4 bg-app-light rounded-lg border border-app-muted transition-colors duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <Sun size={18} className="text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-app mb-1 text-sm transition-colors duration-200">Mood Entries</h4>
                  <p className="text-app-muted text-xs transition-colors duration-200">Mood entries this {selectedPeriod.toLowerCase()}: {insights.moodEntriesCount}</p>
                </div>
              </div>

              {/* Journal Entries Count */}
              <div className="flex items-start gap-3 p-4 bg-app-light rounded-lg border border-app-muted transition-colors duration-200 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <Cloud size={18} className="text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-app mb-1 text-sm transition-colors duration-200">Journal Entries</h4>
                  <p className="text-app-muted text-xs transition-colors duration-200">Journal entries this {selectedPeriod.toLowerCase()}: {insights.journalEntriesCount}</p>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trends;