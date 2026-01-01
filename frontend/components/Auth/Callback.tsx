import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setMessage('Authentication successful! Redirecting...');
        if (!user.onboarding_complete) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setMessage('Authentication failed. Redirecting to login...');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-lg text-foreground font-medium">{message}</p>
        <p className="mt-2 text-sm text-zinc-400">This should only take a moment...</p>
      </div>
    </div>
  );
};
