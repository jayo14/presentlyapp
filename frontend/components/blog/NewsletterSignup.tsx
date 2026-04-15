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
    <div className="rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] border border-outline/10 bg-surface/30 backdrop-blur-2xl p-6 sm:p-12 md:p-16 lg:p-20 relative overflow-hidden group">
      {/* Decorative Premium Blobs */}
      <div className="pointer-events-none absolute -right-20 sm:-right-16 -top-20 sm:-top-16 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full bg-primary/20 blur-[80px] sm:blur-[100px] transition-transform duration-1000 group-hover:scale-110" />
      <div className="pointer-events-none absolute -left-20 sm:-left-16 -bottom-20 sm:-bottom-16 h-[300px] sm:h-[400px] w-[300px] sm:w-[400px] rounded-full bg-primary/10 blur-[80px] sm:blur-[100px] transition-transform duration-1000 group-hover:scale-110" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary mb-6 sm:mb-8 border border-primary/20">
          Exclusive Insights
        </span>
        <h3 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-text tracking-tight mb-6 sm:mb-8 leading-[1.1]">
          Stay ahead of the <span className="text-primary italic">curve</span>
        </h3>
        <p className="text-base sm:text-lg lg:text-xl text-textMuted leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto">
          Weekly deep-dives on EdTech trends, university modernization, and building resilient digital systems in Nigeria.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 sm:flex-row max-w-xl mx-auto items-stretch">
          <div className="flex-1 relative">
            <label htmlFor="newsletter-email" className="sr-only">
              Enter your professional email to subscribe
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your professional email"
              aria-label="Enter your professional email address to subscribe"
              className="w-full h-12 sm:h-16 rounded-xl sm:rounded-2xl border border-outline/20 bg-surface/60 px-4 sm:px-6 text-sm sm:text-base text-text placeholder:text-textMuted transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Subscribe to newsletter"
            className="h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-primary px-6 sm:px-10 text-sm sm:text-base font-black text-background hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-lg sm:shadow-2xl shadow-primary/30 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            {success ? "You're subscribed!" : loading ? 'Joining...' : 'Subscribe Now'}
          </button>
        </form>

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-textMuted/60">
           <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div 
                  key={i}
                  aria-hidden="true"
                  className="h-8 sm:h-10 w-8 sm:w-10 rounded-full border-3 sm:border-4 border-surface bg-surfaceHigh flex items-center justify-center text-[9px] sm:text-[11px] font-black text-text/40"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <p className="text-xs sm:text-sm font-bold tracking-tight text-textMuted">Join <span className="text-text">2,500+</span> educators & institution admins</p>
        </div>

        {success && <p className="mt-6 sm:mt-8 text-xs sm:text-sm font-black text-primary animate-bounce">Verification link sent! Check your inbox 🎉</p>}
        {error && <p className="mt-6 sm:mt-8 text-xs sm:text-sm font-black text-red-500">{error}</p>}
      </div>
    </div>
  );
};
