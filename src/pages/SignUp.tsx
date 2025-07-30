import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
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

    const result = await signUp(email, password, name);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Sign up failed');
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
              Account Created Successfully!
            </h2>
            <p className="text-app-muted mb-6 transition-colors duration-200">
              Please check your email for a verification link to complete your registration.
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-app mb-2 transition-colors duration-200">Create Account</h1>
          <p className="text-app-muted transition-colors duration-200">Join MindEase to start your wellness journey</p>
        </div>

        {/* Form */}
        <div className="bg-app-light rounded-2xl p-6 shadow-lg border border-app-muted transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Create a password"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Confirm your password"
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-app-muted text-sm transition-colors duration-200">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;