import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Bell, Clock, Info, AlertTriangle, CheckCircle2, Calendar, Loader2, Play, FileText, RefreshCw, ChevronRight, Circle } from 'lucide-react';
import { Button } from '../Button';
import { notificationsApi, Notification as ApiNotification } from '../../services/api/notifications';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type TabType = 'all' | 'unread' | 'important';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const navigate = useNavigate();

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
      case 'ALERT': return <AlertTriangle className="text-red-500" size={28} />;
      case 'ATTENDANCE': return <Play className="text-primary" size={28} />;
      case 'CLASS_REMINDER': return <Calendar className="text-primary" size={28} />;
      case 'ANNOUNCEMENT': return <FileText className="text-primary" size={28} />;
      case 'SYSTEM': return <RefreshCw className="text-primary" size={28} />;
      default: return <Bell className="text-primary" size={28} />;
    }
  };

  const getIconBg = (type: string) => {
    return type === 'ALERT' ? 'bg-red-500/10' : 'bg-primary/10';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.is_read;
    if (activeTab === 'important') return notif.type === 'ALERT';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4 pb-3 border-b border-zinc-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Settings size={24} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        <button onClick={() => setActiveTab('all')} className="flex flex-col items-center">
          <span className={`text-base font-bold mb-2 ${activeTab === 'all' ? 'text-primary' : 'text-text-muted'}`}>
            All
          </span>
          {activeTab === 'all' && (
            <div className="w-full h-1 bg-primary rounded-full" />
          )}
        </button>
        
        <button onClick={() => setActiveTab('unread')} className="flex flex-col items-center">
          <span className={`text-base font-bold mb-2 ${activeTab === 'unread' ? 'text-primary' : 'text-text-muted'}`}>
            Unread
          </span>
          {activeTab === 'unread' && (
            <div className="w-full h-1 bg-primary rounded-full" />
          )}
        </button>

        <button onClick={() => setActiveTab('important')} className="flex flex-col items-center">
          <span className={`text-base font-bold mb-2 ${activeTab === 'important' ? 'text-primary' : 'text-text-muted'}`}>
            Important
          </span>
          {activeTab === 'important' && (
            <div className="w-full h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="bg-surface rounded-3xl p-5 flex items-center gap-4 hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getIconBg(notification.type)} shrink-0`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base leading-tight mb-1">
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className="text-text-secondary text-xs leading-relaxed mb-2">
                    {notification.message}
                  </p>
                )}
                <span className="text-text-muted text-xs">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </div>

              {/* Status Indicator */}
              <div className="ml-3 shrink-0">
                {!notification.is_read ? (
                  <Circle size={12} className="text-primary fill-primary" />
                ) : notification.type === 'ALERT' ? (
                  <ChevronRight size={20} className="text-text-muted" />
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
            <Bell size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white">No notifications</h3>
            <p className="text-zinc-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};