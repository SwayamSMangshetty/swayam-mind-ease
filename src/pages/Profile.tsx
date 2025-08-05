import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, User, Bell, Info, Palette, LogOut, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import EditProfileModal from '../components/Profile/EditProfileModal';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { showInfo, showSuccess, showError } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    bio: '',
    avatar_url: ''
  });

  // Load profile data on component mount
  React.useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfileData({
            name: data.name || user?.user_metadata?.name || '',
            email: data.email || user?.email || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    
    loadProfileData();
  }, [user]);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      showSuccess('Notifications Enabled', 'You will now receive mood reminders and wellness tips.');
    } else {
      showInfo('Notifications Disabled', 'Mood reminders and wellness tips have been turned off.');
    }
  };

  const handleAppInfoClick = () => {
    showInfo(
      'About MindEase',
      'Version 1.0.0 - A comprehensive mental wellbeing platform designed specifically for students.'
    );
  };

  const handleProfileEdit = () => {
    setShowEditModal(true);
  };

  const handleProfileSave = () => {
    // Reload profile data after save
    window.location.reload();
  };

  const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    setShowThemeDropdown(false);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };
  return (
    <div className="min-h-screen bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-app-light px-4 py-3 border-b border-app-muted sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center w-full max-w-4xl mx-auto">
          <button
            onClick={handleBackToHome}
            className="mr-3 p-1 hover:bg-app-dark rounded-full transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-app-muted" />
          </button>
          <h1 className="text-lg font-semibold text-app transition-colors duration-200">Settings</h1>
        </div>
      </div>

      <div className="p-4 pb-8">
        <div className="w-full space-y-6 max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary/20 shadow-lg transition-colors duration-200">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={48} className="text-secondary" />
                  </div>
                )}
              </div>
              <button
                onClick={handleProfileEdit}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
              >
                <Edit size={14} className="text-white" />
              </button>
            </div>
            
            <div className="text-center max-w-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-app transition-colors duration-200">
                  {profileData.name || 'User'}
                </h2>
                <button
                  onClick={handleProfileEdit}
                  className="p-1 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
                >
                  <Edit size={16} className="text-app-muted" />
                </button>
              </div>
              <p className="text-sm text-app-muted transition-colors duration-200 mb-2">
                {profileData.email}
              </p>
              {profileData.bio && (
                <p className="text-sm text-app-muted transition-colors duration-200 leading-relaxed">
                  {profileData.bio}
                </p>
              )}
              {!profileData.bio && (
                <button
                  onClick={handleProfileEdit}
                  className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Add a bio
                </button>
              )}
            </div>
          </div>

          {/* Edit Profile Button */}
          <div>
            <button
              onClick={handleProfileEdit}
              className="w-full flex items-center justify-between p-4 bg-app-light rounded-xl border border-app-muted hover:border-primary/50 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Edit size={18} className="text-primary" />
                </div>
                <span className="text-app font-medium text-sm transition-colors duration-200">Edit Profile</span>
              </div>
              <ChevronRight size={18} className="text-app-muted" />
            </button>
          </div>

          {/* Personalization Section */}
          <div>
            <h3 className="text-lg font-bold text-app mb-4 transition-colors duration-200">Personalization</h3>
            
            <div className="relative">
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="w-full flex items-center justify-between p-4 bg-app-light rounded-xl border border-app-muted hover:border-primary/50 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-dark rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Palette size={18} className="text-app-muted" />
                  </div>
                  <span className="text-app font-medium text-sm transition-colors duration-200">Theme</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-app-muted text-sm capitalize transition-colors duration-200">{theme}</span>
                  <ChevronDown size={18} className={`text-app-muted transition-transform duration-200 ${showThemeDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Theme Dropdown */}
              {showThemeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-app-light rounded-xl border border-app-muted shadow-lg z-50 overflow-hidden transition-all duration-200 shadow-xl">
                  <button
                    onClick={() => handleThemeSelect('light')}
                    className={`w-full px-4 py-3 text-left hover:bg-app-dark transition-all duration-200 active:scale-[0.98] text-sm ${
                      theme === 'light' ? 'bg-primary/10 text-primary' : 'text-app'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeSelect('dark')}
                    className={`w-full px-4 py-3 text-left hover:bg-app-dark transition-all duration-200 active:scale-[0.98] text-sm ${
                      theme === 'dark' ? 'bg-primary/10 text-primary' : 'text-app'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <h3 className="text-lg font-bold text-app mb-4 transition-colors duration-200">Settings</h3>
            
            <div className="space-y-3">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-app-light rounded-xl border border-app-muted transition-colors duration-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-dark rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Bell size={18} className="text-app-muted" />
                  </div>
                  <span className="text-app font-medium text-sm transition-colors duration-200">Notifications</span>
                </div>
                
                <button
                  onClick={handleNotificationToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    notificationsEnabled ? 'bg-primary' : 'bg-app-dark'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* App Info */}
              <button
                onClick={handleAppInfoClick}
                className="w-full flex items-center justify-between p-4 bg-app-light rounded-xl border border-app-muted hover:border-primary/50 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-app-dark rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Info size={18} className="text-app-muted" />
                  </div>
                  <span className="text-app font-medium text-sm transition-colors duration-200">App Info</span>
                </div>
                <ChevronRight size={18} className="text-app-muted" />
              </button>
            </div>
          </div>

        {/* Sign Out Section */}
        <div>
          <h3 className="text-lg font-bold text-app mb-4 transition-colors duration-200">Account</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 bg-app-light rounded-xl border border-app-muted hover:border-danger/50 hover:shadow-md transition-all duration-200 active:scale-[0.98] shadow-sm hover:bg-danger/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <LogOut size={18} className="text-danger" />
                </div>
                <span className="text-danger font-medium text-sm transition-colors duration-200">Sign Out</span>
              </div>
              <ChevronRight size={18} className="text-danger" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Backdrop for dropdown */}
      {showThemeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowThemeDropdown(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default Profile;