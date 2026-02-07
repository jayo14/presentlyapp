import React, { useState, useEffect } from 'react';
import { Bell, Clock, Info, AlertTriangle, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import { notificationsApi, Notification as ApiNotification } from '../../services/api/notifications';
import { toast } from 'sonner';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'ATTENDANCE': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'CLASS_REMINDER': return <Calendar className="text-primary" size={20} />;
      case 'ANNOUNCEMENT': return <Info className="text-blue-500" size={20} />;
      case 'SYSTEM': 
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-400">Stay updated with your classes and account activity.</p>
        </div>
        <Button variant="secondary" onClick={markAllAsRead}>Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl border transition-all ${
                notification.is_read 
                  ? 'bg-zinc-900/50 border-zinc-800' 
                  : 'bg-zinc-900 border-zinc-700 shadow-md shadow-black/20'
              }`}
            >
              <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-full h-fit ${notification.is_read ? 'bg-zinc-800' : 'bg-zinc-800 ring-1 ring-zinc-700'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${notification.is_read ? 'text-zinc-300' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Bell size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white">No notifications</h3>
            <p className="text-zinc-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};