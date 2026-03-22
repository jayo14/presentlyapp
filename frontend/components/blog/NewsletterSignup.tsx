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
    <div className="rounded-2xl border border-zinc-800 bg-[#121A2B] p-5">
      <h3 className="font-headline text-2xl font-bold text-white">Get New Posts First</h3>
      <p className="mt-1 text-sm text-zinc-300">Weekly updates on attendance, EdTech, and Nigerian university operations.</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@school.edu.ng"
          className="h-11 flex-1 rounded-lg border border-zinc-700 bg-[#0D1117] px-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#00FF94] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-lg bg-[#00FF94] px-5 text-sm font-semibold text-[#0D1117] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
        >
          {success ? "You're in" : loading ? 'Joining...' : 'Notify me'}
        </button>
      </form>

      {success && <p className="mt-2 text-sm text-[#00FF94]">You're in 🎉</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};
