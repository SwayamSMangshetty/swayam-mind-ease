import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MeditationGuide } from '../types';

const Meditate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meditationGuides, setMeditationGuides] = useState<MeditationGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeditationGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meditation_guides')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMeditationGuides(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meditation guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeditationGuides();
  }, []);

  // Categorize meditations based on duration
  const featuredMeditations = meditationGuides.filter(guide => {
    const duration = parseInt(guide.duration);
    return duration >= 10; // 10+ minutes for featured
  });

  const quickReliefMeditations = meditationGuides.filter(guide => {
    const duration = parseInt(guide.duration);
    return duration < 10; // Less than 10 minutes for quick relief
  });

  // Background colors for variety
  const bgColors = [
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-purple-100 dark:bg-purple-900/30',
    'bg-green-100 dark:bg-green-900/30',
    'bg-indigo-100 dark:bg-indigo-900/30',
    'bg-rose-100 dark:bg-rose-900/30',
    'bg-teal-100 dark:bg-teal-900/30',
    'bg-violet-100 dark:bg-violet-900/30',
    'bg-amber-100 dark:bg-amber-900/30'
  ];

  const handleMeditationClick = (meditation: MeditationGuide) => {
    if (!user) return;
    
    console.log('Starting meditation:', meditation.title);
    
    // Save meditation session to database
    const saveMeditationSession = async () => {
      try {
        const { error } = await supabase
          .from('meditation_sessions')
          .insert({
            user_id: user.id,
            duration: parseInt(meditation.duration) || 0,
            type: 'guided',
            completed: false
          });
        
        if (error) throw error;
        console.log('Meditation session saved');
      } catch (err) {
        console.error('Failed to save meditation session:', err);
      }
    };
    
    saveMeditationSession();
    alert(`Starting ${meditation.title} - ${meditation.duration}`);
  };

  const MeditationCard = ({ meditation, size = 'normal', colorIndex }: { 
    meditation: MeditationGuide, 
    size?: 'normal' | 'large',
    colorIndex: number 
  }) => (
    <button
      onClick={() => handleMeditationClick(meditation)}
      className={`relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 w-full ${
        size === 'large' ? 'aspect-[4/3]' : 'aspect-square'
      } ${bgColors[colorIndex % bgColors.length]} group`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={meditation.image_url || 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400'} 
          alt={meditation.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-200"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Play Button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/95 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:scale-110 active:scale-90 border border-white/20">
          <Play size={16} className="text-gray-700 ml-0.5 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="text-white font-bold text-left mb-1 text-sm sm:text-base truncate drop-shadow-lg">{meditation.title}</h3>
        <p className="text-white/90 text-xs sm:text-sm text-left font-medium drop-shadow-md">{meditation.duration}</p>
      </div>
    </button>
  );

  return (
    <div className="bg-app min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="bg-app-light px-4 sm:px-6 py-3 sm:py-4 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="flex justify-center items-center w-full">
          <h1 className="text-xl font-bold text-app transition-colors duration-200">Meditate</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6 pb-20">
        <div className="w-full space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {loading && (
            <div className="text-center py-8 bg-app-light rounded-lg border border-app-muted mx-auto max-w-md p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-app-muted mt-2">Loading meditations...</p>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger rounded-lg p-4 mx-auto max-w-md">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Featured Section */}
          {!loading && featuredMeditations.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-app mb-4 sm:mb-6 transition-colors duration-200">Featured</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredMeditations.map((meditation, index) => (
                <MeditationCard key={meditation.id} meditation={meditation} colorIndex={index} />
              ))}
            </div>
          </div>
          )}

          {/* Quick Relief Section */}
          {!loading && quickReliefMeditations.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-app mb-4 sm:mb-6 transition-colors duration-200">Quick Relief</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {quickReliefMeditations.map((meditation, index) => (
                <MeditationCard key={meditation.id} meditation={meditation} colorIndex={index + featuredMeditations.length} />
              ))}
            </div>
          </div>
          )}

          {/* Empty State */}
          {!loading && meditationGuides.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[50vh]">
              <div className="bg-app-light rounded-2xl p-8 border border-app-muted shadow-sm max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-app mb-3">No Meditations Available</h3>
              <p className="text-app-muted text-center max-w-md">
                We're working on adding meditation guides to help you find peace and clarity. 
                Check back soon for guided meditations, breathing exercises, and mindfulness sessions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-app-light border border-app-muted text-app rounded-lg hover:bg-app-dark transition-colors duration-200 font-medium"
                >
                  Go Back
                </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meditate;