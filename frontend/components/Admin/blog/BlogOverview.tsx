import React from 'react';
import { 
  FileText, 
  FolderOpen, 
  Tag as TagIcon, 
  Users, 
  TrendingUp, 
  Edit3, 
  Search,
  ExternalLink,
  ChevronRight,
  Plus,
  LayoutDashboard,
  Clock,
  SearchCode
} from 'lucide-react';
import { Button } from '../../Button';
import type { Post, Category, Tag } from '../../../src/types/blog';

interface BlogOverviewProps {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    categoriesCount: number;
    tagsCount: number;
    subscribersCount: string;
  };
  recentPosts: Post[];
  onViewAllPosts: () => void;
  onNewPost: () => void;
  onEditPost: (post: Post) => void;
  onManageCategories: () => void;
  onViewSubscribers: () => void;
}

export const BlogOverview: React.FC<BlogOverviewProps> = ({
  stats,
  recentPosts,
  onViewAllPosts,
  onNewPost,
  onEditPost,
  onManageCategories,
  onViewSubscribers
}) => {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <h2 className="text-5xl font-headline font-black text-text mb-2 tracking-tight">Blog Management</h2>
        <p className="text-textMuted text-lg max-w-2xl">Publish, edit, and organize your platform's editorial content.</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-surface p-6 rounded-[1.5rem] border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surfaceHigh rounded-lg">
              <FileText size={24} className="text-textMuted" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-headline font-black text-text block mb-1">{stats.totalPosts}</span>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-1">
              Total Posts <span className="lowercase normal-case opacity-60">({stats.publishedPosts} published · {stats.draftPosts} drafts)</span>
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-surface p-6 rounded-[1.5rem] border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surfaceHigh rounded-lg">
              <FolderOpen size={24} className="text-textMuted" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-headline font-black text-text block mb-1">{stats.categoriesCount}</span>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Organized Topics</p>
          </div>
        </div>

        {/* Active Tags */}
        <div className="bg-surface p-6 rounded-[1.5rem] border border-outline shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surfaceHigh rounded-lg">
              <TagIcon size={24} className="text-textMuted" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-headline font-black text-text block mb-1">{stats.tagsCount}</span>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Active Tags</p>
          </div>
        </div>

        {/* Subscribers */}
        <div className="bg-surface p-6 rounded-[1.5rem] border border-outline shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surfaceHigh rounded-lg">
              <Users size={24} className="text-textMuted" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
            </div>
          </div>
          <div>
            <span className="text-4xl font-headline font-black text-text block mb-1">{stats.subscribersCount}</span>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Newsletter list</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={onNewPost}
          className="bg-gradient-to-br from-primary to-primary/80 text-background px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Plus size={18} />
          New Post
        </Button>
        <Button 
          variant="outline" 
          onClick={onManageCategories}
          className="border-outline/20 text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-surfaceHigh transition-colors"
        >
          Manage Categories
        </Button>
        <Button 
          variant="outline" 
          onClick={onViewSubscribers}
          className="border-outline/20 text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-surfaceHigh transition-colors"
        >
          View Subscribers
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Posts Table */}
        <div className="lg:col-span-8 bg-surface rounded-[2rem] shadow-sm border border-outline overflow-hidden">
          <div className="p-8 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-headline font-black text-text">Recent Posts</h3>
              <p className="text-sm text-textMuted">Update and monitor your latest editorial pieces.</p>
            </div>
            <button 
              onClick={onViewAllPosts}
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceHigh/30">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-textMuted/60">Post Detail</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-textMuted/60">Category</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-textMuted/60">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-textMuted/60 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {recentPosts.map((post, i) => (
                  <tr key={post.id || i} className="group hover:bg-surfaceHigh/40 transition-colors cursor-pointer" onClick={() => onEditPost(post)}>
                    <td className="px-8 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surfaceHigh border border-outline">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-surfaceHigh to-surface" />
                        )}
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-text leading-snug group-hover:text-primary transition-colors">{post.title}</p>
                        <p className="text-xs text-textMuted truncate">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-textMuted">
                      <span className="px-2.5 py-1 rounded-full bg-surfaceHigh/60 uppercase tracking-tighter">
                        {post.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className={post.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right text-xs text-textMuted font-bold uppercase tracking-tighter">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Content Health */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface p-8 rounded-[2rem] border border-outline shadow-sm">
            <h3 className="text-2xl font-headline font-black text-text mb-8 tracking-tight">Content Health</h3>
            <ul className="space-y-8">
              {/* Metric 1 */}
              <li className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Posts this month</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-2xl font-headline font-black leading-none">{stats.publishedPosts}</span>
                      {/* Inline Micro Sparkline */}
                      <div className="flex items-end gap-[2px] h-4 mb-0.5">
                        <div className="w-1.5 h-2 bg-primary/20 rounded-sm"></div>
                        <div className="w-1.5 h-3 bg-primary/20 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-primary/20 rounded-sm"></div>
                        <div className="w-1.5 h-4 bg-primary rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              {/* Metric 2 */}
              <li className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Drafts waiting</p>
                    <p className="text-2xl font-headline font-black leading-none mt-1">{stats.draftPosts}</p>
                  </div>
                </div>
                <button onClick={onViewAllPosts} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline self-center">Finish writing →</button>
              </li>
              {/* Metric 3 */}
              <li className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <SearchCode size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Missing SEO desc</p>
                    <p className="text-2xl font-headline font-black leading-none mt-1">3</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline self-center">Fix SEO →</button>
              </li>
              {/* Metric 4 */}
              <li className="flex items-start justify-between border-t border-outline pt-8">
                <div className="flex gap-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-1">Most viewed</p>
                    <p className="text-sm font-bold text-text line-clamp-1">{recentPosts[0]?.title || 'N/A'}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">{recentPosts[0]?.views || 0} views</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          {/* Small Promotional/Help Card */}
          <div className="bg-primary p-8 rounded-[2rem] text-background relative overflow-hidden shadow-lg shadow-primary/20">
            <div className="relative z-10">
              <h4 className="font-headline text-2xl font-black mb-2 tracking-tight">Editorial Tip</h4>
              <p className="text-sm opacity-90 leading-relaxed mb-6 font-medium">Posts with more than 3 internal links tend to rank 24% higher in local search results.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest py-3 px-6 bg-white/10 hover:bg-white/20 border border-outline rounded-xl transition-colors">Learn more</button>
            </div>
            <TrendingUp size={120} className="absolute -bottom-8 -right-8 text-background/5 select-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
