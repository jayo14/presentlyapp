import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/api/auth';
import { toast } from 'sonner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing authentication...');
  const [errorMessage, setErrorMessage] = useState('');
  const processingStarted = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setMessage(`Authentication error: ${error}`);
      setErrorMessage(error);
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
      
      const redirectUri = window.location.origin + '/auth/callback';
      console.log('[Google OAuth] Callback Details:');
      console.log('  Code:', code.substring(0, 20) + '...');
      console.log('  Redirect URI:', redirectUri);
      console.log('  Backend endpoint: /api/auth/google-callback/');
      console.log('  Exchanging for tokens...');
      
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(
          () => reject(new Error('Backend request timeout after 30 seconds. Please check if backend is running and configured correctly.')),
          30000
        )
      );

      const callbackPromise = authApi.googleCallback(code, redirectUri);
      
      const response = await Promise.race([callbackPromise, timeoutPromise]) as any;

      console.log('[Google OAuth] Response received:', response);

      if (response && response.success) {
        setMessage('Authentication successful! Redirecting...');
        toast.success('Login Successful', { description: 'Welcome back!' });

        // Check if user needs onboarding
        const requiresOnboarding = response.requires_onboarding || !response.user?.onboarding_complete;
        console.log('[Google OAuth] Requires onboarding:', requiresOnboarding);

        if (requiresOnboarding) {
          console.log('[Google OAuth] Redirecting to onboarding...');
          setTimeout(() => navigate('/onboarding', { replace: true }), 500);
        } else {
          console.log('[Google OAuth] Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard', { replace: true }), 500);
        }
      } else {
        throw new Error(response?.message || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('[Google OAuth] Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code,
        fullError: err
      });
      
      const apiError = err.response?.data?.error || 
                       err.response?.data?.detail ||
                       err.response?.data?.message ||
                       err.message || 
                       'Failed to complete Google authentication';
      
      setMessage(`Authentication failed: ${apiError}`);
      setErrorMessage(apiError);
      toast.error('Login Failed', {
        description: apiError,
        duration: 5000
      });
      
      console.error('[Google OAuth] Login failed, user can click Return to Login button');
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
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            <p className="font-semibold">Error Details:</p>
            <p className="mt-1 break-words">{errorMessage}</p>
            <p className="mt-3 text-xs text-zinc-400">Check browser console for full logs</p>
          </div>
        )}
        <p className="mt-2 text-sm text-zinc-400">This should only take a moment...</p>
        {errorMessage && (
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-6 px-4 py-2 bg-[#FFD700] text-black rounded-lg font-medium hover:bg-yellow-400 transition"
          >
            Return to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
