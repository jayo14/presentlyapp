import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '../Button';
import { billingApi } from '../../services/api/billing';

export default function CheckoutCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'polling' | 'success' | 'failed'>('polling');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts > 30) {
      setStatus('failed');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const plan = await billingApi.getCurrentPlan();
        if (plan?.status === 'ACTIVE' || plan?.plan?.code === 'lecturer_pro_monthly') {
          setStatus('success');
          return;
        }
      } catch {
        // ignore poll errors, keep trying
      }
      setAttempts((a) => a + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [attempts]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {status === 'polling' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-sungold" />
            <h2 className="mt-6 font-headline text-xl font-semibold text-text">
              Verifying your payment…
            </h2>
            <p className="mt-2 text-sm text-textMuted">
              Please wait while we confirm your transaction.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 font-headline text-xl font-semibold text-text">
              Payment successful!
            </h2>
            <p className="mt-2 text-sm text-textMuted">
              Your Lecturer Pro plan is now active.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="mt-8">
              Go to dashboard
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 font-headline text-xl font-semibold text-text">
              Still confirming…
            </h2>
            <p className="mt-2 text-sm text-textMuted">
              It's taking longer than usual. Check your dashboard in a moment.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="mt-8">
              Go to dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
