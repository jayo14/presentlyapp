import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnreadCount } from '../hooks/useNotifications';

const NotificationInbox: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useUnreadCount();
  const unreadCount = data?.unread_count ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard/notifications')}
      className="relative p-2 rounded-lg border border-outline bg-surface hover:bg-surfaceHigh transition-colors"
      aria-label="Open notifications"
    >
      <Bell size={18} className="text-textMuted" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary-fixed text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationInbox;