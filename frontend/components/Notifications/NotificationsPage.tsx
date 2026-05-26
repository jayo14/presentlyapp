import React, { useState, useEffect } from 'react';
import {
  Bell, Clock, RefreshCw, ChevronRight, Trash2, CheckCircle2
} from 'lucide-react';
import { Button } from '../Button';
import { notificationsApi, Notification as ApiNotification } from '../../services/api/notifications';
import { toast } from 'sonner';
import { SEO } from '../SEO';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { ModernCard } from '../ModernCard';
import { Badge } from '../../src/components/ui/badge';
import { cn } from '../../src/components/ui/utils';

type TabType = 'all' | 'unread' | 'important';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'important') return n.importance === 'high';
    return true;
  });

  return (
    <DashboardPage
      title="Alerts & Activity"
      description="Stay updated with system announcements, session invites, and account security alerts."
      seoTitle="Notifications | Presently"
      action={
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-8" onClick={markAllAsRead}>
             Mark all as read
           </Button>
           <Button variant="secondary" className="h-14 px-8" onClick={loadNotifications}>
             <RefreshCw size={18} className={cn("mr-2", loading && "animate-spin")} /> Refresh
           </Button>
        </div>
      }
    >
      <div className="space-y-12 lg:space-y-24">
        {/* Tab Navigation */}
        <div className="flex bg-surface-highest/20 p-2 rounded-[2rem] w-fit border border-outline/30">
           {(['all', 'unread', 'important'] as TabType[]).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-10 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all",
                 activeTab === tab
                  ? "bg-white text-presently-black shadow-premium"
                  : "text-on-surface-variant hover:text-on-surface"
               )}
             >
               {tab}
             </button>
           ))}
        </div>

        <div className="max-w-5xl space-y-4">
           {loading && notifications.length === 0 ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />
             ))
           ) : (
             filteredNotifications.map((n) => (
               <ModernCard key={n.id} padding="none" className={cn(
                 "group border border-outline/30 transition-all hover:border-sungold/30 hover:bg-sungold/[0.01]",
                 !n.is_read && "border-l-4 border-l-sungold bg-sungold/[0.02]"
               )}>
                  <div className="flex items-center gap-8 p-8">
                     <div className={cn(
                       "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                       !n.is_read ? "bg-sungold text-presently-black" : "bg-surface-highest/40 text-on-surface-variant"
                     )}>
                        <Bell size={24} weight={!n.is_read ? "bold" : "regular"} />
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="font-bold text-presently-black text-lg">{n.title}</h4>
                           {!n.is_read && <div className="w-2 h-2 bg-sungold rounded-full" />}
                        </div>
                        <p className="text-on-surface-variant font-medium text-sm line-clamp-1">{n.message}</p>
                     </div>

                     <div className="flex items-center gap-8 shrink-0">
                        <div className="text-right">
                           <div className="flex items-center gap-2 justify-end">
                              <Clock size={12} className="text-on-surface-variant/40" />
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest tabular-nums">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                           <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40 mt-1">
                             {new Date(n.created_at).toLocaleDateString()}
                           </p>
                        </div>
                        <button className="p-3 rounded-xl hover:bg-soft-coral/10 text-on-surface-variant/20 hover:text-soft-coral transition-all opacity-0 group-hover:opacity-100">
                           <Trash2 size={18} />
                        </button>
                        <ChevronRight size={20} className="text-outline transition-transform group-hover:translate-x-1" />
                     </div>
                  </div>
               </ModernCard>
             ))
           )}

           {!loading && filteredNotifications.length === 0 && (
             <div className="py-32 text-center bg-surface-highest/10 rounded-[3rem] border-2 border-dashed border-outline/30">
                <CheckCircle2 className="w-20 h-20 text-outline mx-auto mb-6 opacity-20" />
                <h4 className="font-display text-2xl font-bold text-presently-black">Clear Inbox</h4>
                <p className="text-on-surface-variant font-medium mt-2">You're all caught up with the Presently network.</p>
             </div>
           )}
        </div>
      </div>
    </DashboardPage>
  );
};

export default NotificationsPage;
