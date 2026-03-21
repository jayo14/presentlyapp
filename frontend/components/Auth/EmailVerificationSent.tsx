import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft, ExternalLink, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useSendVerificationOTP } from '../../hooks/useAuth';
import { toast } from 'sonner';

const VERIFICATION_POLL_INTERVAL = 10000;
const RESEND_COOLDOWN_SECONDS = 60;

export const EmailVerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, refetch: refetchUser } = useCurrentUser();
  const sendVerificationMutation = useSendVerificationOTP();

  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;
    const pollInterval = setInterval(async () => {
      try {
        const result = await refetchUser();
        if (result.data?.is_verified) {
          setIsPolling(false);
          toast.success('Email verified successfully!');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } catch (error) {
        console.debug('Polling error:', error);
      }
    }, VERIFICATION_POLL_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [isPolling, refetchUser, navigate]);

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
        onError: () => toast.error('Failed to send verification email'),
      });
    }
  };

  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    if (domain.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' };
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live'))
      return { name: 'Outlook', url: 'https://outlook.live.com' };
    if (domain.includes('yahoo')) return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
    if (domain.includes('icloud') || domain.includes('me.com'))
      return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
    return null;
  };

  const emailProvider = user?.email ? getEmailProvider(user.email) : null;

  const formatLastSentTime = (date: Date | null) =>
    date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-primary-foreground flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-300 hover:text-primary-foreground transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center flex flex-col items-center">
          <Logo className="justify-center mb-8 text-2xl" />

          <div className="mb-6 p-6 rounded-full bg-[#FFD700]/10">
            <Mail size={48} color="#FFD700" />
          </div>

          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Verify your Email</h2>
          <p className="text-[#a1a1aa] text-on-primary-fixedase leading-relaxed max-w-xl mb-4">
            We've sent a verification link to your university email address.
            Please click the link to confirm your account and access Presently.
          </p>
          <p className="text-[#FFD700] font-semibold text-lg">{user?.email}</p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-6 md:p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Primary Action */}
            {emailProvider ? (
              <button
                onClick={() => window.open(emailProvider.url, '_blank')}
                className="w-full h-12 bg-[#FFD700] text-[#09090b] rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#FFE44D] transition-all"
              >
                <Mail size={18} />
                Open {emailProvider.name}
                <ExternalLink size={16} />
              </button>
            ) : (
              <div className="w-full h-12 bg-[#FFD700]/50 text-[#09090b] rounded-full font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-60">
                <Mail size={18} />
                Check Inbox
              </div>
            )}

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || sendVerificationMutation.isPending}
              className="w-full h-12 bg-[#27272a] border border-[#3f3f46] text-primary-foreground rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#3f3f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendVerificationMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : sendVerificationMutation.isSuccess && resendCooldown === 0 ? (
                <>
                  <CheckCircle size={18} />
                  Email Sent!
                </>
              ) : resendCooldown > 0 ? (
                `Resend Email (${resendCooldown}s)`
              ) : (
                'Resend Verification Email'
              )}
            </button>

            {lastSentTime && (
              <p className="text-[#a1a1aa] text-sm text-center">
                Last sent: {formatLastSentTime(lastSentTime)}
              </p>
            )}

            {isPolling && (
              <div className="flex items-center justify-center gap-2 text-[#a1a1aa] text-sm pt-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Checking verification status...</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#27272a]">
              <div className="flex items-center justify-center gap-2 text-[#a1a1aa] text-sm">
                <HelpCircle size={16} />
                <span>Having trouble?</span>
                <button
                  onClick={() => (window.location.href = 'mailto:support@presently.app')}
                  className="text-[#FFD700] font-medium hover:underline"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[#a1a1aa] text-sm">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};
