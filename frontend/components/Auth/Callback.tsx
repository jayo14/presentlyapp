import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing authentication...');
  const processingStarted = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setMessage(`Authentication error: ${error}`);
      toast.error('Authentication Failed', { description: error });
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (code && !processingStarted.current) {
      processingStarted.current = true;
      handleCallback(code);
    } else if (!code && !processingStarted.current) {
      setMessage('No authentication code found. Redirecting...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
  }, [location, navigate]);

  const handleCallback = async (code: string) => {
    try {
      setMessage('Exchanging code for tokens...');
      const response = await authApi.googleCallback(code, window.location.origin + '/auth/callback');

      if (response.success) {
        setMessage('Authentication successful! Redirecting...');
        toast.success('Login Successful', { description: 'Welcome back!' });

        if (response.requires_onboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Callback error:', err);
      setMessage('Authentication failed. Redirecting to login...');
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete Google authentication';
      toast.error('Login Failed', {
        description: errorMessage
      });
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 text-white">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium">{message}</p>
        <p className="mt-2 text-sm text-zinc-400">This should only take a moment...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
