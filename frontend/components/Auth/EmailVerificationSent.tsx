import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft, CheckCircle, ExternalLink, HelpCircle, Loader } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useSendVerificationOTP } from '../../hooks/useAuth';
import { toast } from 'sonner';

// Constants
const VERIFICATION_POLL_INTERVAL = 10000; // 10 seconds
const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds

export const EmailVerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, refetch: refetchUser } = useCurrentUser();
  const sendVerificationMutation = useSendVerificationOTP();
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Start polling for verification status every 10 seconds
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await refetchUser();
        if (result.data?.is_verified) {
          setIsPolling(false);
          toast.success('Email verified successfully!');
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.debug('Polling error:', error);
      }
    }, VERIFICATION_POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [isPolling, refetchUser, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    if (user?.email) {
      sendVerificationMutation.mutate(user.email, {
        onSuccess: () => {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
          setLastSentTime(new Date());
          toast.success('Verification email sent!');
        },
        onError: () => {
          toast.error('Failed to send verification email');
        }
      });
    }
  };

  // Detect common email providers and create deep links
  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;

    if (domain.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' };
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
      return { name: 'Outlook', url: 'https://outlook.live.com' };
    }
    if (domain.includes('yahoo')) return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
    if (domain.includes('icloud') || domain.includes('me.com')) {
      return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
    }
    return null;
  };

  const emailProvider = user?.email ? getEmailProvider(user.email) : null;

  const formatLastSentTime = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
      {/* Header - Hidden on mobile */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-8 left-8 text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors mobile:hidden"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-8 text-2xl" />
          
          {/* Mail Icon with animation */}
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-full">
              <Mail size={48} className="text-primary" />
            </div>
          </div>

          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Verify your Email
          </h2>
          
          {/* Message */}
          <p className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto mb-4">
            We've sent a verification link to your university email address. 
            Please click the link to confirm your account and access Presently.
          </p>
          
          {/* Email Display */}
          <p className="text-primary font-semibold text-lg">{user?.email}</p>
        </div>

        <div className="bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-lg space-y-4">
          {/* Primary Action - Check Inbox / Open Mail App */}
          {emailProvider ? (
            <Button 
              onClick={() => window.open(emailProvider.url, '_blank')}
              variant="primary"
              className="w-full"
              size="lg"
            >
              <Mail size={18} className="mr-2" />
              Open {emailProvider.name}
              <ExternalLink size={16} className="ml-2" />
            </Button>
          ) : (
            <Button 
              variant="primary"
              className="w-full"
              size="lg"
              disabled
            >
              <Mail size={18} className="mr-2" />
              Check Inbox
            </Button>
          )}

          {/* Secondary Action - Resend Email */}
          <Button 
            onClick={handleResend}
            variant="secondary"
            className="w-full"
            size="lg"
            disabled={resendCooldown > 0}
            isLoading={sendVerificationMutation.isPending}
          >
            {sendVerificationMutation.isSuccess && resendCooldown === 0 ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Email Sent!
              </>
            ) : resendCooldown > 0 ? (
              `Resend Email (${resendCooldown}s)`
            ) : (
              'Resend Verification Email'
            )}
          </Button>

          {/* Status Indicator */}
          {lastSentTime && (
            <p className="text-text-secondary text-sm text-center">
              Last sent: {formatLastSentTime(lastSentTime)}
            </p>
          )}

          {/* Polling Indicator */}
          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm pt-2">
              <Loader size={14} className="animate-spin" />
              <span>Checking verification status...</span>
            </div>
          )}

          {/* Support Section */}
          <div className="pt-4 border-t border-border dark:border-zinc-800">
            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
              <HelpCircle size={16} />
              <span>Having trouble?</span>
              <button 
                onClick={() => window.location.href = 'mailto:support@presently.app'}
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
};
