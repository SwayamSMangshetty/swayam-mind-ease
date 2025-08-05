import React, { useState } from 'react';
import { X, User, Mail, FileText, Camera, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface EditProfileModalProps {
  onClose: () => void;
  onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Initialize form state with current user data
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    bio: '',
    avatar_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load existing profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // Not found error is OK
          console.error('Error loading profile:', error);
          return;
        }
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    
    loadProfile();
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Bio validation (optional but with limits)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;
    
    setLoading(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          bio: formData.bio.trim(),
          avatar_url: formData.avatar_url.trim(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      // Update auth metadata (for name changes)
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formData.name.trim() }
      });
      
      if (authError) throw authError;
      
      showSuccess(
        'Profile Updated',
        'Your profile has been successfully updated.'
      );
      
      onSave();
      onClose();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      showError(
        'Update Failed',
        'There was an error updating your profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-muted">
          <h2 className="text-xl font-bold text-app">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-app-dark rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-app-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary/20 shadow-lg">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={32} className="text-secondary" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors duration-200">
                  <Camera size={12} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-app-muted mt-2">Click camera to change photo</p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm ${
                    errors.name ? 'ring-2 ring-danger' : ''
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-danger text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm ${
                    errors.email ? 'ring-2 ring-danger' : ''
                  }`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-danger text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                Bio <span className="text-app-muted font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-app-muted" size={18} />
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm resize-none h-20 ${
                    errors.bio ? 'ring-2 ring-danger' : ''
                  }`}
                  placeholder="Tell us a bit about yourself..."
                  disabled={loading}
                  maxLength={500}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? (
                  <p className="text-danger text-xs">{errors.bio}</p>
                ) : (
                  <div />
                )}
                <p className="text-xs text-app-muted">{formData.bio.length}/500</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-app-muted">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-app-dark text-app rounded-lg hover:bg-app-dark/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;