import React, { useState } from 'react';

import { subscribeToNewsletter } from '../../src/lib/blog';

interface NewsletterSignupProps {
  source: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ source }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    const result = await subscribeToNewsletter(email.trim(), source);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Unable to subscribe right now.');
      return;
    }

    setSuccess(true);
    setEmail('');
  };

  return (
    <div className="rounded-[2rem] border border-outline/10 bg-surface/40 backdrop-blur-md p-8 sm:p-12 relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
      
      <div className="relative z-10 max-w-2xl">
        <h3 className="font-headline text-3xl font-black text-text tracking-tight">Stay ahead of the curve</h3>
        <p className="mt-4 text-lg text-textMuted leading-relaxed">
          Weekly insights on attendance, EdTech trends, and building resilient systems for Nigerian institutions.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="w-full h-14 rounded-2xl border border-outline/20 bg-surface px-6 text-base text-text placeholder:text-textMuted transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-14 rounded-2xl bg-primary px-8 text-base font-bold text-on-primary-fixed hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-xl shadow-primary/20"
          >
            {success ? "You're subscribed!" : loading ? 'Joining...' : 'Join 2,000+ readers'}
          </button>
        </form>

        {success && <p className="mt-4 text-sm font-medium text-primary">Verification email sent! Check your inbox 🎉</p>}
        {error && <p className="mt-4 text-sm font-medium text-red-400">{error}</p>}
      </div>
    </div>
  );
};
