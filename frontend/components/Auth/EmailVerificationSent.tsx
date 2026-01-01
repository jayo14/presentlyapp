import React from 'react';
import { Logo } from '../Logo';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useSendVerificationOTP } from '../../hooks/useAuth';

export const EmailVerificationSent: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const sendVerificationMutation = useSendVerificationOTP();

  const handleResend = () => {
    if (user?.email) {
      sendVerificationMutation.mutate(user.email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-4 relative">
      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-8 text-2xl" />
          <h2 className="text-3xl font-bold text-white mb-3">Check your inbox</h2>
          <p className="text-zinc-400 text-sm">
            We've sent a verification link to
          </p>
          <p className="text-white font-medium mt-2 text-lg">{user?.email}</p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl space-y-6">
            <Button 
              onClick={handleResend}
              variant="secondary"
              className="w-full"
              size="sm"
              isLoading={sendVerificationMutation.isPending}
            >
              {sendVerificationMutation.isSuccess ? (
                <>
                  <CheckCircle size={14} className="mr-2" />
                  Email Sent!
                </>
              ) : 'Resend Verification Email' }
            </Button>
        </div>
      </div>
    </div>
  );
};
