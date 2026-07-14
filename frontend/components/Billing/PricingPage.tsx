import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../Button';
import { useCurrentPlan, useCheckout } from '../../hooks/useBilling';

const FREE_FEATURES = [
  'Up to 1 course',
  'Unlimited students',
  'Unlimited sessions',
  'Basic attendance tracking',
  'Presently branding',
];

const PRO_FEATURES = [
  'Unlimited courses',
  'Advanced analytics & insights',
  'CSV/PDF export',
  'AI-powered insights',
  'No Presently branding',
  'Priority support',
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { data: currentPlan, isLoading: planLoading } = useCurrentPlan();
  const checkout = useCheckout();

  const isPro = currentPlan?.plan?.code === 'lecturer_pro_monthly';

  const handleUpgrade = async () => {
    try {
      const result = await checkout.mutateAsync('lecturer_pro_monthly');
      window.location.href = result.authorization_url;
    } catch {
      // error toast handled by api client interceptor
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-textMuted hover:text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mt-4 text-lg text-textMuted">
            Start with the Free plan and upgrade anytime as your needs grow.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Free Plan */}
          <div className="relative flex flex-col rounded-2xl border border-outline/20 bg-surface p-8">
            <h2 className="font-headline text-2xl font-semibold text-text">Free</h2>
            <p className="mt-2 text-sm text-textMuted">For getting started</p>
            <p className="mt-6">
              <span className="font-headline text-5xl font-bold text-text">₦0</span>
              <span className="text-sm text-textMuted">/forever</span>
            </p>
            <ul className="mt-8 flex-1 space-y-4">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-textMuted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sungold" />
                  {f}
                </li>
              ))}
            </ul>
            {!isPro ? (
              <Button
                disabled
                className="mt-8 w-full cursor-not-allowed opacity-50"
                variant="outline"
              >
                Current plan
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-8 w-full"
                variant="outline"
              >
                Back to dashboard
              </Button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col rounded-2xl border-2 border-sungold/50 bg-surface p-8 shadow-lg shadow-sungold/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sungold px-4 py-1 text-xs font-semibold text-presently-black">
                <Sparkles className="h-3 w-3" />
                Most popular
              </span>
            </div>
            <h2 className="font-headline text-2xl font-semibold text-text">
              Lecturer Pro
            </h2>
            <p className="mt-2 text-sm text-textMuted">
              For professional lecturers
            </p>
            <p className="mt-6">
              <span className="font-headline text-5xl font-bold text-text">₦3,000</span>
              <span className="text-sm text-textMuted">/month</span>
            </p>
            <p className="mt-2 text-sm text-textMuted">
              Or ₦30,000/year (save 2 months)
            </p>
            <ul className="mt-8 flex-1 space-y-4">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sungold" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button
                disabled
                className="mt-8 w-full cursor-not-allowed"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Active plan
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={checkout.isPending}
                className="mt-8 w-full"
              >
                {checkout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
