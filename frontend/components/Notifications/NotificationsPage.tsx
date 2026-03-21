import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, Bell, Clock, Info, AlertTriangle, CheckCircle2, Calendar, 
  Loader2, Play, FileText, RefreshCw, ChevronRight, Circle, Trash2, Check, X
} from 'lucide-react';
import { Button } from '../Button';
import { notificationsApi, Notification as ApiNotification } from '../../services/api/notifications';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { SEO } from '../SEO';

type TabType = 'all' | 'unread' | 'important' | 'system';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
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

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
      // Assuming API has a clear all method
      await notificationsApi.clearAll?.();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      toast.error('No notifications selected');
      return;
    }
    
    if (!confirm(`Delete ${selectedNotifications.length} notification(s)?`)) return;
    
    try {
      // Delete selected notifications
      await Promise.all(
        selectedNotifications.map(id => notificationsApi.delete?.(id))
      );
      setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      setBulkMode(false);
      toast.success(`${selectedNotifications.length} notification(s) deleted`);
    } catch (err) {
      toast.error('Failed to delete notifications');
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <AlertTriangle className="text-red-500" size={24} />;
      case 'ATTENDANCE': return <Play className="text-primary" size={24} />;
      case 'CLASS_REMINDER': return <Calendar className="text-primary" size={24} />;
      case 'ANNOUNCEMENT': return <FileText className="text-primary" size={24} />;
      case 'SYSTEM': return <RefreshCw className="text-primary" size={24} />;
      default: return <Bell className="text-primary" size={24} />;
    }
  };

  const getIconBg = (type: string) => {
    return type === 'ALERT' ? 'bg-red-500/10 dark:bg-red-500/20' : 'bg-primary/10 dark:bg-primary/20';
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
    if (activeTab === 'system') return notif.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mobile Layout (matching the dark theme design)
  const mobileLayout = (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Notifications</h1>
          <button 
            onClick={() => navigate('/dashboard/settings#notifications')}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Notification Settings"
          >
            <Settings size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex gap-6 px-4 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'important', label: 'Important' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Notifications List */}
      <div className="p-4 space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="bg-card rounded-xl p-4 flex items-start gap-3"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(notification.type)} shrink-0`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-primary-foreground text-on-primary-fixedase leading-tight">
                    {notification.title}
                  </h3>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {formatTimeAgo(notification.created_at)}
                </p>
                {notification.message && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>
                )}
              </div>

              {notification.type === 'ALERT' && (
                <ChevronRight size={20} className="text-muted-foreground shrink-0 mt-1" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop Layout (unchanged)
  const desktopLayout = (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4 pb-4 border-b border-border px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Bell size={28} className="text-primary" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-text-secondary">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard/settings#notifications')}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
          aria-label="Notification Settings"
        >
          <Settings size={24} className="text-text-secondary hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'important', label: 'Important', count: notifications.filter(n => n.type === 'ALERT').length },
            { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'SYSTEM').length },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface dark:bg-zinc-900 text-text-secondary hover:bg-inputccent hover:text-muted-foregroundccent-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20' 
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          {bulkMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="text-primary hover:underline text-sm font-medium"
              >
                {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-text-secondary text-sm">
                {selectedNotifications.length} selected
              </span>
            </>
          )}
          {!bulkMode && (
            <button
              onClick={() => setBulkMode(true)}
              className="text-primary hover:underline text-sm font-medium"
            >
              Select
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {bulkMode && selectedNotifications.length > 0 ? (
            <>
              <Button
                onClick={handleBulkDelete}
                variant="secondary"
                size="sm"
                className="text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
              <Button
                onClick={() => {
                  setBulkMode(false);
                  setSelectedNotifications([]);
                }}
                variant="secondary"
                size="sm"
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={markAllAsRead}
                variant="secondary"
                size="sm"
                disabled={unreadCount === 0}
              >
                <Check size={16} className="mr-1" />
                Mark all read
              </Button>
              <Button
                onClick={clearAll}
                variant="secondary"
                size="sm"
                disabled={notifications.length === 0}
                className="text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} className="mr-1" />
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 px-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-surface dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
                !notification.is_read ? 'border-l-4 border-l-primary' : ''
              } ${
                bulkMode ? 'hover:bg-inputccent hover:text-muted-foregroundccent-foreground' : 'hover:shadow-md'
              }`}
              onClick={() => bulkMode && handleSelectNotification(notification.id)}
            >
              {bulkMode && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="w-5 h-5 rounded border-border border-border text-primary focus:ring-primary"
                  />
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(notification.type)} shrink-0`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary text-on-primary-fixedase leading-tight">
                    {notification.title}
                  </h3>
                  <span className="text-text-secondary text-xs whitespace-nowrap">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                </div>
                {notification.message && (
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                )}
                {/* Action buttons if needed */}
                {notification.type === 'ATTENDANCE' && (
                  <button className="text-primary text-sm font-medium hover:underline mt-1">
                    View Session →
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              {!bulkMode && (
                <div className="ml-2 shrink-0">
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Bell size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No notifications</h3>
            <p className="text-text-secondary">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Notifications | Dashboard"
        description="View all your Presently notifications, attendance alerts and system messages."
        noIndex
      />
      <ResponsiveContainer
        mobileChildren={mobileLayout}
      >
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};