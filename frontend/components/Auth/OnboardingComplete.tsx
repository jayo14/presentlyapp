import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { LoadingScreen } from '../LoadingScreen';
import { Button } from '../Button';
import { ConfettiAnimation } from '../ConfettiAnimation';
import { 
  PartyPopper, 
  Sparkles, 
  TrendingUp, 
  Download, 
  BookOpen, 
  Calendar,
  ArrowRight 
} from 'lucide-react';
import { UserRole } from '../../types';

// Constants
const AUTO_REDIRECT_SECONDS = 10; // Auto-redirect countdown duration

interface OnboardingCompleteProps {
  userName?: string;
  userRole?: UserRole;
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ 
  userName = 'there',
  userRole = UserRole.STUDENT 
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      // Small delay to show the loading screen before navigating
      const timer = setTimeout(() => navigate('/dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [countdown, autoRedirect, navigate]);

  if (autoRedirect && countdown === 0) {
    return <LoadingScreen message="Redirecting to dashboard" />;
  }

  const handleSkipToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTakeTour = () => {
    // Store flag for showing tour
    localStorage.setItem('showDashboardTour', 'true');
    navigate('/dashboard');
  };

  const handleCancelRedirect = () => {
    setAutoRedirect(false);
  };

  // Check if PWA is installable
  const isPWAInstallable = () => {
    // This would be set by the service worker registration
    return !window.matchMedia('(display-mode: standalone)').matches;
  };

  const quickTips = [
    {
      icon: Calendar,
      title: 'Create your first session',
      desc: userRole === UserRole.LECTURER 
        ? 'Start taking attendance with QR codes or GPS verification'
        : 'Check in to attendance sessions for your classes',
      action: userRole === UserRole.LECTURER ? '/dashboard/create-session' : null
    },
    {
      icon: Download,
      title: 'Download the PWA',
      desc: 'Install Presently on your device for offline access and faster loading',
      action: null,
      show: isPWAInstallable()
    },
    {
      icon: BookOpen,
      title: 'Learn the basics',
      desc: 'Take a quick tour to see how everything works',
      action: 'tour'
    }
  ];

  if (autoRedirect && countdown === 0) {
    return <LoadingScreen message="Finalizing your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <ConfettiAnimation count={50} duration={4000} />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-surfaceLow/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo className="text-3xl" />
        </div>

        {/* Success Card */}
        <div className="bg-surface text-text border border-outline rounded-3xl shadow-2xl p-8 md:p-12 text-center mb-8">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="bg-primary/10 p-6 rounded-full">
                <PartyPopper size={64} className="text-primary" />
              </div>
              <Sparkles 
                size={24} 
                className="text-muted-foregroundccent absolute -top-2 -right-2 animate-bounce" 
              />
            </div>
          </div>

          {/* Header */}
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            You're all set, {userName}! 🎉
          </h1>

          {/* Message */}
          <p className="text-lg text-textMuted mb-8 max-w-2xl mx-auto leading-relaxed">
            Your profile is ready. Welcome to a seamless attendance experience with Presently.
          </p>

          {/* Quick Tips Card */}
          <div className="bg-surfaceLow/50 border border-outline rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="font-headline text-lg font-semibold text-primary">Quick Tips to Get Started</h3>
            </div>
            
            <div className="space-y-4">
              {quickTips.filter(tip => tip.show !== false).map((tip, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                    <tip.icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary text-sm mb-1">{tip.title}</p>
                    <p className="text-textMuted text-xs leading-relaxed">{tip.desc}</p>
                  </div>
                  {tip.action && (
                    <ArrowRight size={18} className="text-textMuted flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={handleSkipToDashboard}
              variant="primary"
              size="lg"
              className="flex-1 md:flex-none"
            >
              Go to Dashboard
              <ArrowRight size={18} className="ml-2" />
            </Button>
            
            <Button
              onClick={handleTakeTour}
              variant="secondary"
              size="lg"
              className="flex-1 md:flex-none"
            >
              <BookOpen size={18} className="mr-2" />
              Take a Tour
            </Button>
          </div>

          {/* Auto-redirect Countdown */}
          {autoRedirect && countdown > 0 && (
            <div className="mt-6 text-textMuted text-sm">
              <p>Entering dashboard in {countdown}s...</p>
              <button 
                onClick={handleCancelRedirect}
                className="text-primary hover:underline mt-1 font-medium"
              >
                Cancel auto-entry
              </button>
            </div>
          )}
        </div>

        {/* Profile Preview Card */}
        <div className="bg-surface/50 backdrop-blur-sm border border-outline rounded-2xl p-6 text-center">
          <p className="text-textMuted text-sm mb-2">Your Role</p>
          <p className="text-primary font-semibold text-lg capitalize">
            {userRole.replace('_', ' ')}
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-textMuted text-sm">
            Need help getting started?{' '}
            <button 
              onClick={() => window.location.href = 'mailto:support@getpresently.com.ng'}
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
