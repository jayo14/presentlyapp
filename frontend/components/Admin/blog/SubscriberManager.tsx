import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  UserPlus, 
  Download, 
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus
} from 'lucide-react';
import { Button } from '../../Button';
import type { NewsletterSubscriber } from '../../../src/types/blog';

interface SubscriberManagerProps {
  subscribers: NewsletterSubscriber[];
  totalSubscribers: number;
  onUnsubscribe: (id: number) => void;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const SubscriberManager: React.FC<SubscriberManagerProps> = ({
  subscribers,
  totalSubscribers,
  onUnsubscribe,
  onSearch,
  onPageChange,
  currentPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-12 pb-24 relative animate-in fade-in duration-700">
      {/* Header Row */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-headline font-black text-text tracking-tight">Subscribers</h2>
          <p className="text-textMuted text-lg mt-2 font-medium">Monitor your community growth and newsletter engagement.</p>
        </div>
        <div className="flex gap-4 mb-1">
          <Button variant="outline" className="px-8 py-3 rounded-full font-bold border-outline/20 hover:bg-surfaceHigh transition-colors flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </Button>
          <Button className="bg-text text-white px-8 py-3 rounded-full font-black flex items-center gap-2 shadow-2xl hover:scale-102 transition-transform">
            <Send size={18} />
            Mass Update
          </Button>
        </div>
      </div>

      {/* Stats Dashboard for Subscribers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Growth Metric */}
        <div className="bg-surface p-8 rounded-[2.5rem] border border-outline/10 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">Total Community</p>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white duration-500">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-headline font-black text-text leading-none">{totalSubscribers.toLocaleString()}</span>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-black pb-1 bg-emerald-50 px-2 rounded-lg mb-1">
                <TrendingUp size={12} />
                +12%
              </div>
            </div>
            <div className="w-full h-1 bg-outline/5 rounded-full overflow-hidden">
               <div className="w-[85%] h-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Engagement Metric */}
        <div className="bg-surface p-8 rounded-[2.5rem] border border-outline/10 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">Open Rate</p>
              <div className="p-2 bg-primary/5 rounded-xl text-primary transition-colors group-hover:bg-primary group-hover:text-white duration-500">
                <Activity size={20} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-headline font-black text-text leading-none">64.2</span>
              <span className="text-2xl font-headline font-black text-text/40 pb-0.5">%</span>
            </div>
            <p className="text-[11px] font-bold text-textMuted tracking-tight opacity-60 italic">Above industry average (22%)</p>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-surface p-8 rounded-[2.5rem] border border-outline/10 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">Status: Active</p>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white duration-500">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-headline font-black text-text leading-none">{subscribers.filter(s => s.is_active).length}</span>
              <span className="text-sm font-black text-textMuted pb-1.5 uppercase tracking-widest">Active</span>
            </div>
            <p className="text-[11px] font-bold text-textMuted tracking-tight opacity-60 italic">Members receiving updates</p>
          </div>
        </div>

        {/* Churn Rate (Unsubscribed) */}
        <div className="bg-surface p-8 rounded-[2.5rem] border border-outline/10 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-textMuted/60">Status: Inactive</p>
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white duration-500">
                <XCircle size={20} />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-headline font-black text-text leading-none">{subscribers.filter(s => !s.is_active).length}</span>
              <div className="flex items-center gap-1 text-rose-600 text-xs font-black pb-1 bg-rose-50 px-2 rounded-lg mb-1">
                <TrendingDown size={12} />
                -2%
              </div>
            </div>
            <p className="text-[11px] font-bold text-rose-600 tracking-tight opacity-80 uppercase tracking-widest font-black">Churn Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content: Table & Filter */}
      <div className="bg-surface rounded-[3rem] shadow-sm border border-outline/5 overflow-hidden transition-all duration-700">
        {/* Table Header / Action Bar */}
        <div className="p-10 flex flex-wrap items-center justify-between gap-8 border-b border-outline/5">
           <div className="relative flex-1 min-w-[400px]">
             <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-textMuted" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={handleSearch}
               className="w-full bg-surfaceHigh/40 border-none rounded-full pl-16 pr-8 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text" 
               placeholder="Search by email..." 
             />
           </div>
           <div className="flex gap-4">
              <button className="px-8 py-4 bg-surfaceHigh/60 rounded-full text-xs font-black text-text hover:bg-surfaceHigh transition-colors flex items-center gap-2 border border-outline/10"><Filter size={16} /> Filter</button>
              <button className="px-8 py-4 bg-surfaceHigh/60 rounded-full text-xs font-black text-text hover:bg-surfaceHigh transition-colors flex items-center gap-2 border border-outline/10"><Calendar size={16} /> Date Range</button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-medium">
            <thead className="bg-surfaceHigh/20">
              <tr className="h-16">
                <th className="pl-12 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40">Name / Avatar</th>
                <th className="px-8 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40">Email Address</th>
                <th className="px-8 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40 text-center">Status</th>
                <th className="px-8 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40">Join Date</th>
                <th className="px-8 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40">Source</th>
                <th className="pr-12 text-[11px] font-black uppercase tracking-[0.2em] text-textMuted/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {subscribers.map((subscriber, i) => (
                <tr key={subscriber.id || i} className="group hover:bg-primary/5 transition-all duration-300 h-24">
                  <td className="pl-12">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gradient-to-br from-surfaceHigh to-surface rounded-2xl flex items-center justify-center font-black text-text shadow-sm border border-outline/10 group-hover:scale-110 transition-transform duration-500">
                          {subscriber.email.slice(0, 1).toUpperCase()}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-text">Anonymous Member</span>
                          <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic opacity-50">#SUB_00{subscriber.id}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8">
                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer">
                      <Mail size={14} className="text-textMuted group-hover:text-primary transition-colors opacity-40 shrink-0" />
                      <span className="text-sm font-bold truncate max-w-[240px] leading-none">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-8 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${subscriber.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${subscriber.is_active ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-600'}`}></div>
                       {subscriber.is_active ? 'Verified' : 'Unsubscribed'}
                    </div>
                  </td>
                  <td className="px-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-text mb-0.5">{new Date(subscriber.subscribed_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-textMuted uppercase tracking-widest italic opacity-40"><Clock size={10} /> {new Date(subscriber.subscribed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8">
                    <span className="px-4 py-2 bg-surfaceHigh text-[10px] font-black text-textMuted rounded-xl uppercase tracking-widest border border-outline/5 transition-all group-hover:border-primary/20">
                      {subscriber.source || 'Website'}
                    </span>
                  </td>
                  <td className="pr-12 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100">
                      <button className="p-3 bg-white rounded-xl text-textMuted hover:text-primary shadow-sm hover:shadow-md transition-all">
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={() => onUnsubscribe(subscriber.id)}
                        className="p-3 bg-white rounded-xl text-textMuted hover:text-error shadow-sm hover:shadow-md transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr className="h-64">
                   <td colSpan={6} className="text-center py-32 space-y-4">
                      <Users size={64} className="mx-auto text-textMuted/20" />
                      <p className="text-textMuted font-bold italic text-lg leading-relaxed">No subscribers found.<br/><span className="text-sm font-medium">Try broadening your search criteria.</span></p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="p-10 bg-surfaceHigh/10 flex items-center justify-between">
           <p className="text-sm font-bold text-textMuted uppercase tracking-widest opacity-40">Page {currentPage} of {Math.ceil(totalSubscribers / 10) || 1}</p>
           <div className="flex gap-2">
             <button 
               disabled={currentPage === 1}
               onClick={() => onPageChange(currentPage - 1)}
               className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-outline/10 text-xs font-black text-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surfaceHigh transition-colors"
             >
               <ChevronLeft size={16} /> Previous
             </button>
             <button 
               disabled={currentPage >= Math.ceil(totalSubscribers / 10)}
               onClick={() => onPageChange(currentPage + 1)}
               className="flex items-center gap-2 px-8 py-3 rounded-full bg-text text-white text-xs font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-text/90 transition-colors"
             >
               Next <ChevronRight size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
