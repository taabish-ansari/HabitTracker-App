import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [code, setCode] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState('request');
  const [newPassword, setNewPassword] = useState('');
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const resp = await api.post('/auth/login', { email, password });
      if (resp.status === 200 && resp.data?.session) {
        // set supabase client session so the app knows the user
        await supabase.auth.setSession({
          access_token: resp.data.session.access_token,
          refresh_token: resp.data.session.refresh_token,
        });
        navigate('/dashboard');
        return;
      }
      // handled below
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || 'Login failed. Please try again.';
      if (status === 403 && msg === 'verification_required') {
        setVerificationMode(true);
        setMessage('A 4-digit verification code was sent to your email. Enter it below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/verify', { email, code });
      // try login again
      const resp = await api.post('/auth/login', { email, password });
      if (resp.status === 200 && resp.data?.session) {
        await supabase.auth.setSession({
          access_token: resp.data.session.access_token,
          refresh_token: resp.data.session.refresh_token,
        });
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setForgotStep('reset');
      setMessage('A 4-digit reset code was sent to your email.');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to send reset code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setForgotMode(false);
      setForgotStep('request');
      setCode('');
      setNewPassword('');
      setPassword('');
      setMessage('Password reset successful. Please login with your new password.');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to reset password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotMode = () => {
    setForgotMode((prev) => !prev);
    setForgotStep('request');
    setCode('');
    setNewPassword('');
    setError('');
    setMessage('');
    setVerificationMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">HabitTracker</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Gamify Your Daily Habits</p>

        {error && <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded mb-4">{message}</div>}

        <form
          onSubmit={forgotMode ? (forgotStep === 'request' ? handleForgotPasswordRequest : handleResetPassword) : (verificationMode ? handleVerify : handleSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="your@email.com"
            />
          </div>

          {!forgotMode && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          )}

          {forgotMode && forgotStep === 'reset' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reset Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
            </>
          )}

          {verificationMode && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="1234"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : forgotMode
                ? (forgotStep === 'request' ? 'Send Reset Code' : 'Reset Password')
                : (verificationMode ? 'Verify Code' : 'Login')}
          </button>
        </form>

        <p className="text-center mt-3">
          <button
            type="button"
            onClick={toggleForgotMode}
            className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
          >
            {forgotMode ? 'Back to Login' : 'Forgot password?'}
          </button>
        </p>

        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
