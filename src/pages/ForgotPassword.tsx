import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Password reset failed');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4 transition-colors duration-200">
        <div className="w-full max-w-md">
          <div className="bg-app-light rounded-2xl p-8 shadow-lg border border-app-muted transition-colors duration-200 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-app mb-2 transition-colors duration-200">
              Check Your Email
            </h2>
            <p className="text-app-muted mb-6 transition-colors duration-200">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email and follow the instructions to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Back to Sign In
            </Link>
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
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-app mb-2 transition-colors duration-200">Forgot Password?</h1>
          <p className="text-app-muted transition-colors duration-200">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <div className="bg-app-light rounded-2xl p-6 shadow-lg border border-app-muted transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-app mb-2 transition-colors duration-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-app-dark text-app placeholder-app-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-primary transition-all duration-200 shadow-sm"
                  placeholder="Enter your email address"
                  disabled={loading}
                  required
                />
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
                  Sending reset link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;