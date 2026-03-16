import React from 'react';
import { Inbox } from '@novu/react';
import { useCurrentUser } from '../hooks/useAuth';

const NovuInbox: React.FC = () => {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const subscriberId = currentUser.id;
  const applicationIdentifier = import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER;

  if (!applicationIdentifier) {
    console.error('VITE_NOVU_APPLICATION_IDENTIFIER is not set');
    return null;
  }

  return (
    <Inbox
      subscriberId={subscriberId}
      applicationIdentifier={applicationIdentifier}
      appearance={{
        colorPrimary: '#FFCA0D',
        colorBackground: '#FFFFFF',
        colorForeground: '#111827',
        colorNeutral: '#E5E7EB',
        fontFamily: 'Outfit, Lexend, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        borderRadius: '0.5rem',
        variables: {
          colorBackground: {
            light: '#FFFFFF',
            dark: '#18181b',
          },
          colorForeground: {
            light: '#111827',
            dark: '#F4F4F5',
          },
          colorNeutral: {
            light: '#E5E7EB',
            dark: '#27272a',
          },
        },
      }}
    />
  );
};

export default NovuInbox;