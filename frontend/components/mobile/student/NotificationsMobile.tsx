import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft,
  DotsThree,
  CheckCircle,
  Clock,
  Warning,
  Assignment,
  Calendar,
  Circle
} from '@phosphor-icons/react';

export const NotificationsMobile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const notifications = [
    {
      id: 1,
      title: 'Attendance marked successfully',
      desc: 'Mathematics 101 • 10:30 AM',
      time: 'Today',
      icon: CheckCircle,
      unread: true,
      type: 'success'
    },
    {
      id: 2,
      title: 'Session ending soon',
      desc: 'CS Lab • 09:45 AM',
      time: 'Today',
      icon: Clock,
      unread: true,
      type: 'info'
    },
    {
      id: 3,
      title: 'Attendance Warning',
      desc: 'Physics - Attendance below 75%',
      time: 'Yesterday',
      icon: Warning,
      unread: false,
      type: 'warning'
    },
    {
      id: 4,
      title: 'New Assignment Posted',
      desc: 'World History • Yesterday',
      time: 'Yesterday',
      icon: Assignment,
      unread: false,
      type: 'info'
    },
    {
      id: 5,
      title: 'Holiday Announcement',
      desc: 'Oct 12th is a University Holiday',
      time: 'Last Week',
      icon: Calendar,
      unread: false,
      type: 'neutral'
    }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white min-h-screen">
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden border-x border-gray-200 dark:border-gray-800 pb-24">
        {/* TopAppBar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-start"
          >
            <CaretLeft size={24} />
          </button>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Notifications</h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex items-center justify-center rounded-xl h-12 bg-transparent text-gray-900 dark:text-white">
              <DotsThree size={24} weight="bold" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="pb-1">
          <div className="flex border-b border-gray-200 dark:border-[#6a5d2f] px-4 gap-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'all' ? 'border-b-primary text-gray-900 dark:text-white' : 'border-b-transparent text-gray-500 dark:text-[#ccbf8e]'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">All</p>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'unread' ? 'border-b-primary text-gray-900 dark:text-white' : 'border-b-transparent text-gray-500 dark:text-[#ccbf8e]'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Unread</p>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {['Today', 'Yesterday', 'Last Week'].map((group) => {
            const groupNotifications = notifications.filter(n => n.time === group && (activeTab === 'all' || n.unread));
            if (groupNotifications.length === 0) return null;

            return (
              <React.Fragment key={group}>
                <div className="px-4 pt-6 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#ccbf8e]">{group}</h3>
                </div>
                {groupNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-[80px] py-3 justify-between hover:bg-gray-100 dark:hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center rounded-xl shrink-0 size-12 ${
                        n.type === 'neutral'
                          ? 'bg-gray-100 dark:bg-[#322d1a] text-gray-400 dark:text-[#6a5d2f]'
                          : 'bg-primary/10 dark:bg-[#4a4121] text-primary'
                      }`}>
                        <n.icon size={24} weight={n.unread ? 'fill' : 'regular'} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className={`text-base font-medium leading-normal line-clamp-1 ${n.type === 'neutral' ? 'text-gray-400 dark:text-[#ccbf8e]' : 'text-gray-900 dark:text-white'}`}>
                          {n.title}
                        </p>
                        <p className={`text-sm font-normal leading-normal line-clamp-2 ${n.type === 'neutral' ? 'text-gray-400/80 dark:text-[#ccbf8e]/60' : 'text-gray-500 dark:text-[#ccbf8e]'}`}>
                          {n.desc}
                        </p>
                      </div>
                    </div>
                    {n.unread && (
                      <div className="shrink-0">
                        <div className="text-primary flex size-7 items-center justify-center">
                          <Circle size={10} weight="fill" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
