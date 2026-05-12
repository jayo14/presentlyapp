import React from 'react';
import { AlertTriangle, RefreshCcw, House } from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Separator } from '../src/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-outline bg-surface shadow-xl p-8 md:p-10 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-error" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-2">
          Something Went Wrong
        </h1>
        <p className="text-textMuted text-sm md:text-base leading-relaxed">
          The page crashed unexpectedly. You can refresh this page, or go back to your dashboard safely.
        </p>

        <Separator className="my-6 bg-outline" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()} size="lg" className="w-full sm:w-auto">
            <RefreshCcw size={16} />
            Refresh Page
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto">
            <House size={16} />
            Go to Dashboard
          </Button>
        </div>

        <p className="mt-6 text-[11px] tracking-wide uppercase text-textMuted">
          Error Code: Unexpected Client Error
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
