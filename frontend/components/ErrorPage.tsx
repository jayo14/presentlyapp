import React from 'react';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import { Button } from './Button';

const ErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div className="text-center max-w-lg">
        <ShieldOff className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-red-400 mb-2">Oops! Something went wrong.</h1>
        <p className="text-lg text-zinc-400 mb-6">
          We're sorry for the inconvenience. Our team has been automatically notified and we're working hard to resolve the issue.
        </p>
        <p className="text-sm text-zinc-500 mb-8">
          Please try refreshing the page or come back in a little while.
        </p>
        <Button onClick={() => window.location.reload()} size="lg">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Refresh Page
        </Button>
      </div>
      <footer className="absolute bottom-4 text-xs text-zinc-600">
        Error Code: UNEXPECTED_CLIENT_ERROR
      </footer>
    </div>
  );
};

export default ErrorPage;
