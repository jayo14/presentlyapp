import React from 'react';
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

  // TODO: Replace with actual Novu NotificationInbox component once package is properly installed
  return (
    <div className="relative">
      <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {/* Badge for unread count - placeholder */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
      </button>
    </div>
  );
};

export default NovuInbox;