import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, Frown, Meh, Angry, BookOpen, MessageCircle, BarChart3, Settings, Heart } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MoodEntry } from '../types';
import { moodValues, generatePath, generateFilledPath, ChartDataPoint } from '../utils/chartUtils';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      alert('Database connection not configured. Please click "Connect to Supabase" button in the top right to set up your database.');
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
      
      // Show success feedback
      alert(`Mood "${mood}" saved successfully!`);
    } catch (err) {
      console.error('Failed to save mood:', err);
      alert('Failed to save mood. Please try again.');
    } finally {
      setSavingMood(false);
    }
  };

  return (
    <div className="bg-app transition-colors duration-200">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-1/3 w-24 h-24 bg-secondary/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative px-4 py-5">
          {/* Top Row: Logo + Name and Settings */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {/* MindEase Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-sm">
                <Heart size={18} className="text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-app transition-colors duration-200">MindEase</h1>
            </div>
            
            {/* Enhanced Settings Button */}
            <button 
              onClick={() => navigate('/profile')}
              className="p-2.5 bg-app-light/80 backdrop-blur-sm text-app-muted hover:text-app hover:bg-app-light border border-app-muted/50 rounded-full transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            >
              <Settings size={20} />
            </button>
          </div>
          
          {/* Personalized Greeting */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-app mb-2 transition-colors duration-200">
              👋 Hey {user?.user_metadata?.name?.split(' ')[0] || 'there'}
            </h2>
            <p className="text-base sm:text-lg text-app-muted font-medium transition-colors duration-200">How are you feeling today?</p>
          </div>

          {/* Mood Selection - Integrated into Header */}
          <div className="bg-app-light/60 backdrop-blur-sm rounded-2xl p-4 border border-app-muted/30 shadow-sm">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 max-w-2xl mx-auto">
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className="flex items-center gap-2 p-3 bg-app-light/80 backdrop-blur-sm rounded-xl border border-app-muted/50 hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-sm hover:bg-primary/5"
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
        </div>
      </div>
      
      {/* Content with reduced top padding */}
      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Mini Mood Graph */}
          <div>
            <div 
              className="bg-app-light rounded-xl p-5 border border-app-muted cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 active:scale-[0.99] shadow-sm hover:bg-primary/5 max-w-4xl mx-auto"
              onClick={() => navigate('/trends')}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-app transition-colors duration-200">Recent Mood Trends</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-app-muted transition-colors duration-200">Last 7 days</span>
                  {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  )}
                </div>
              </div>
              
              {/* SVG Chart - Enhanced */}
              {moodData.length > 0 && (
              <div className="relative w-full">
                <div className="w-full overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4">
                  <svg 
                    viewBox="0 0 320 60" 
                    className="w-full h-14 sm:h-16"
                    preserveAspectRatio="none"
                  >
                    {/* Enhanced filled area */}
                    <path
                      d={generateFilledPath(moodData, 320, 60)}
                      fill="url(#moodGradient)"
                      fillOpacity="0.3"
                      stroke="none"
                    />
                    {/* Enhanced line */}
                    <path
                      d={generatePath(moodData, 320, 60)}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0 2px 4px rgba(124, 58, 237, 0.2))"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Day labels */}
                <div className="flex justify-between mt-3 px-1">
                  {moodData.map((data, index) => (
                    <span key={index} className="text-xs font-medium text-app-muted flex-1 text-center transition-colors duration-200">
                      {data.day}
                    </span>
                  ))}
                </div>
              </div>
              )}
              
              {moodData.length === 0 && !loading && (
                <div className="text-center py-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <p className="text-app-muted text-sm font-medium">Start tracking your mood to see beautiful trends!</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-app mb-5 text-center transition-colors duration-200">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="group flex items-center gap-4 p-5 bg-app-light rounded-xl border border-app-muted hover:border-primary hover:shadow-lg transition-all duration-200 active:scale-[0.98] shadow-sm hover:bg-primary/5"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="text-app font-semibold text-base block transition-colors duration-200">{action.label}</span>
                      <span className="text-app-muted text-sm">
                        {action.label === 'Journal' && 'Capture your thoughts'}
                        {action.label === 'Chat' && 'Talk with MindEase AI'}
                        {action.label === 'Progress' && 'View your trends'}
                      </span>
                    </div>
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