import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { staffApi } from '../../services/api/staff';

type PageState = 'form' | 'loading' | 'success' | 'error';

export const AcceptInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState('error');
      setErrorMessage('No invitation token found. Please use the link from your invitation email.');
      return;
    }
    // Basic sanity check: tokens are URL-safe base64 strings (alphanumeric + - and _)
    if (token.length < 20 || !/^[\w-]+$/.test(token)) {
      setPageState('error');
      setErrorMessage('Invalid invitation token format. Please use the original link from your invitation email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password too short', { description: 'Password must be at least 8 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { description: 'Please make sure both passwords are identical.' });
      return;
    }

    try {
      setPageState('loading');
      await staffApi.acceptInvitation({ token, password });
      setPageState('success');
      toast.success('Invitation accepted!', { description: 'Your staff account is ready. Redirecting…' });
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again or request a new invitation.';
      setPageState('error');
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4">
      <SEO title="Accept Staff Invitation | Presently" description="Accept your staff invitation and set a password to get started." />

      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <span className="font-headline text-3xl font-bold text-primary">Presently</span>
          <p className="text-textMuted mt-1 text-sm">Staff Invitation</p>
        </div>

        <div className="skeuo-card p-6 md:p-8 shadow-2xl">
          {pageState === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-textMuted">Setting up your account…</p>
            </div>
          )}

          {pageState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <h2 className="font-headline text-2xl font-bold text-text">You're all set!</h2>
              <p className="text-textMuted text-sm">Your staff account has been activated. Redirecting you to the dashboard…</p>
            </div>
          )}

          {pageState === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <XCircle className="w-12 h-12 text-red-500" />
              <h2 className="font-headline text-2xl font-bold text-text">Invalid Invitation</h2>
              <p className="text-sm text-red-500">{errorMessage}</p>
              <p className="text-textMuted text-xs">Please contact your administrator for a new invitation link.</p>
            </div>
          )}

          {pageState === 'form' && (
            <>
              <div className="mb-6 text-center">
                <h1 className="font-headline text-2xl font-bold text-text mb-2">Accept Staff Invitation</h1>
                <p className="text-textMuted text-sm">Set a password to activate your staff account.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-text/80 mb-2 tracking-wide">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 pl-11 pr-11 bg-surfaceLow border border-outline rounded-2xl text-text placeholder:text-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors z-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-text/80 mb-2 tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted z-10" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-14 pl-11 pr-11 bg-surfaceLow border border-outline rounded-2xl text-text placeholder:text-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors z-10"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="skeuo-button-gold w-full h-14 text-lg font-bold flex items-center justify-center gap-2 mt-2"
                >
                  Activate Account
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
