import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the required URL parameters for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Set the session with the tokens from the URL
    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    setSession();
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password update failed');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4 transition-colors duration-200">
        <div className="w-full max-w-md text-center">
          <div className="bg-app-light rounded-2xl p-8 shadow-lg border border-app-muted transition-colors duration-200">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-app mb-2 transition-colors duration-200">
              Password Updated Successfully!
            </h2>
            <p className="text-app-muted mb-6 transition-colors duration-200">
              Your password has been updated. You will be redirected to the sign in page in a few seconds.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-app mb-2 transition-colors duration-200">Reset Password</h1>
          <p className="text-app-muted transition-colors duration-200">Enter your new password below</p>
        </div>

        {/* Form */}
        <div className="bg-app-light rounded-2xl p-6 shadow-lg border border-app-muted transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-muted hover:text-app transition-colors duration-200"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-app-muted mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Confirm new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-muted hover:text-app transition-colors duration-200"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;