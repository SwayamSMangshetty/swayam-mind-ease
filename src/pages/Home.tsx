import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, Frown, Meh, Angry, BookOpen, MessageCircle, BarChart3, Settings } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MoodEntry } from '../types';
import { moodValues, generatePath, generateFilledPath, ChartDataPoint } from '../utils/chartUtils';
import { useToast } from '../contexts/ToastContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [moodData, setMoodData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingMood, setSavingMood] = useState(false);

  const moodOptions = [
    { icon: Smile, label: 'Happy', value: 'happy', color: 'text-green-500 dark:text-green-400' },
    { icon: Frown, label: 'Sad', value: 'sad', color: 'text-blue-500 dark:text-blue-400' },
    { icon: Meh, label: 'Neutral', value: 'neutral', color: 'text-gray-500 dark:text-gray-400' },
    { icon: Angry, label: 'Angry', value: 'angry', color: 'text-red-500 dark:text-red-400' },
  ];

  const quickActions = [
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: BarChart3, label: 'Progress', path: '/trends' },
  ];

  const fetchRecentMoods = async () => {
    if (!isSupabaseConfigured || !user) {
      console.warn('Supabase is not configured. Skipping mood data fetch.');
      return;
    }

    try {
      setLoading(true);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Generate last 7 days with real data
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        
        // Find all mood entries for this day
        const dayEntries = data?.filter(entry => {
          const entryDate = new Date(entry.created_at);
          return entryDate.toDateString() === date.toDateString();
        }) || [];
        
        let value: number | null = null;
        if (dayEntries.length > 0) {
          // Calculate average mood for the day if multiple entries exist
          const sum = dayEntries.reduce((acc, entry) => acc + (moodValues[entry.mood] || 6), 0);
          value = sum / dayEntries.length;
        }
        
        chartData.push({
          day: dayName,
          label: dayName,
          value: value
        });
      }
      
      setMoodData(chartData);
    } catch (err) {
      console.error('Failed to fetch mood data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMoods();
    }
  }, [user]);

  const handleMoodSelect = async (mood: string) => {
    if (!isSupabaseConfigured || !user) {
      showError(
        'Database Not Connected',
        'Please click "Connect to Supabase" button in the top right to set up your database.'
      );
      return;
    }

    if (savingMood) return;

    try {
      setSavingMood(true);
      
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood: mood as 'happy' | 'sad' | 'neutral' | 'angry',
          notes: ''
        });

      if (error) throw error;

      // Refresh mood data after saving
      await fetchRecentMoods();
      
      // Show success toast
      showSuccess(
        'Mood Saved!',
        `Your ${mood} mood has been recorded successfully.`
      );
    } catch (err) {
      console.error('Failed to save mood:', err);
      showError(
        'Failed to Save Mood',
        'There was an issue saving your mood. Please try again.'
      );
    } finally {
      setSavingMood(false);
    }
  };

  return (
    <div className="bg-app transition-colors duration-200">
      {/* Header - Full Width */}
      <header className="bg-gradient-to-r from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20 py-6 sticky top-0 z-40 transition-all duration-200 shadow-sm border-b border-white/20 dark:border-gray-700/30">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute top-0 right-0 w-32 h-32 opacity-10 dark:opacity-5" viewBox="0 0 100 100">
            <circle cx="50" cy="20" r="20" fill="currentColor" className="text-purple-400"/>
            <path d="M30 60 Q50 40 70 60 Q50 80 30 60" fill="currentColor" className="text-blue-400"/>
          </svg>
        </div>
        
        <div className="relative px-4 max-w-7xl mx-auto">
          {/* Top Row: Logo/Name and Settings */}
          <div className="flex justify-between items-center mb-4">
            {/* Logo & App Name */}
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6 11 8 11s8-5.75 8-11c0-4.42-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6 0 2.97-3.54 6.86-6 9.47C9.54 16.86 6 12.97 6 10c0-3.31 2.69-6 6-6z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              
              {/* App Name */}
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent transition-all duration-200">
                MindEase
              </h1>
            </div>
            
            {/* Settings Button */}
            <button 
              onClick={() => navigate('/profile')}
              className="p-3 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg backdrop-blur-sm border border-white/50 dark:border-gray-600/50"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Greeting Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">
              👋 Hey {user?.user_metadata?.name?.split(' ')[0] || 'there'},
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium transition-colors duration-200">
              How are you feeling today?
            </p>
          </div>
        </div>
      </header>
      
      {/* Content with padding */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Mood Selection */}
        <div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 max-w-4xl mx-auto">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className="flex items-center gap-2 p-3 bg-app-light rounded-lg border border-app-muted hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-sm hover:bg-primary/10"
                  disabled={savingMood}
                >
                  <Icon size={20} className={`${mood.color} flex-shrink-0`} />
                  <span className="text-app font-medium text-sm truncate transition-colors duration-200">
                    {savingMood ? 'Saving...' : mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini Mood Graph */}
        <div>
          <div 
            className="bg-app-light rounded-lg p-4 border border-app-muted cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm hover:bg-primary/10 max-w-4xl mx-auto"
            onClick={() => navigate('/trends')}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-app transition-colors duration-200">Recent Mood Trends</h3>
              <span className="text-xs text-app-muted transition-colors duration-200">Last 7 days</span>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>
            
            {/* SVG Chart - Responsive */}
            {moodData.length > 0 && (
            <div className="relative w-full">
              <div className="w-full overflow-hidden">
                <svg 
                  viewBox="0 0 320 60" 
                  className="w-full h-12 sm:h-16"
                  preserveAspectRatio="none"
                >
                  {/* Filled area */}
                  <path
                    d={generateFilledPath(moodData, 320, 60)}
                    fill="var(--primary)"
                    fillOpacity="0.1"
                    stroke="none"
                  />
                  {/* Line */}
                  <path
                    d={generatePath(moodData, 320, 60)}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              {/* Day labels */}
              <div className="flex justify-between mt-2 px-1">
                {moodData.map((data, index) => (
                  <span key={index} className="text-xs text-app-muted flex-1 text-center transition-colors duration-200">
                    {data.day}
                  </span>
                ))}
              </div>
            </div>
            )}
            
            {moodData.length === 0 && !loading && (
              <div className="text-center py-4">
                <p className="text-app-muted text-sm">No mood data available. Start tracking your mood above!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-app mb-4 text-center transition-colors duration-200">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3 p-4 bg-app-light rounded-lg border border-app-muted hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm hover:bg-primary/10"
                >
                  <Icon size={20} className="text-app-muted flex-shrink-0 transition-colors duration-200" />
                  <span className="text-app font-medium text-sm transition-colors duration-200">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Home;