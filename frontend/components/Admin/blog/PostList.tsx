import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Copy,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { Button } from '../../Button';
import type { Post } from '../../../src/types/blog';

interface PostListProps {
  posts: Post[];
  totalPosts: number;
  onNewPost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (slug: string) => void;
  onPreviewPost: (slug: string) => void;
  onDuplicatePost: (post: Post) => void;
  onSearch: (term: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterCategory: (categoryId: string) => void;
  onSort: (sort: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  totalPosts,
  onNewPost,
  onEditPost,
  onDeletePost,
  onPreviewPost,
  onDuplicatePost,
  onSearch,
  onFilterStatus,
  onFilterCategory,
  onSort,
  onPageChange,
  currentPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map(p => p.id!).filter(id => id !== undefined));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Header Row */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-5xl font-headline font-black text-text tracking-tight">Posts</h2>
          <span className="px-3 py-1 bg-surfaceHigh text-textMuted text-xs font-bold rounded-full mt-2 uppercase tracking-widest">{totalPosts} posts</span>
        </div>
        <Button 
          onClick={onNewPost}
          className="bg-gradient-to-r from-primary to-primary/80 text-background px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          <Plus size={20} />
          New Post
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-6 rounded-[2rem] shadow-sm border border-outline">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-surfaceHigh/40 border-none rounded-full pl-12 pr-4 py-3 focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all"
              placeholder="Search posts..."
            />
          </div>
          <select 
            onChange={(e) => onFilterStatus(e.target.value)}
            className="bg-surfaceHigh/40 border-none rounded-full px-6 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 cursor-pointer text-text hover:bg-surfaceHigh transition-colors"
          >
            <option value="">Status: All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select 
            onChange={(e) => onSort(e.target.value)}
            className="bg-surfaceHigh/40 border-none rounded-full px-6 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 cursor-pointer text-text hover:bg-surfaceHigh transition-colors"
          >
            <option value="-created_at">Sort: Newest</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-outline">
        <button className="pb-4 text-sm font-black border-b-2 border-primary text-text">All ({totalPosts})</button>
        <button className="pb-4 text-sm font-bold text-textMuted/60 hover:text-text transition-colors">Published</button>
        <button className="pb-4 text-sm font-bold text-textMuted/60 hover:text-text transition-colors">Drafts</button>
        <button className="pb-4 text-sm font-bold text-textMuted/60 hover:text-text transition-colors">Scheduled</button>
      </div>

      {/* Posts Table */}
      <div className="bg-surface rounded-[2rem] overflow-hidden shadow-sm border border-outline transition-all">
        <table className="w-full text-left">
          <thead className="bg-surfaceHigh/30">
            <tr className="h-14">
              <th className="pl-8 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === posts.length && posts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-outline/20 text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                />
              </th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60">Cover</th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60">Title & Excerpt</th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60">Author</th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60 text-center">Category</th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60">Status</th>
              <th className="px-4 text-[11px] uppercase tracking-widest font-black text-textMuted/60">Views</th>
              <th className="pr-8 text-[11px] uppercase tracking-widest font-black text-textMuted/60 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {posts.map((post) => (
              <tr 
                key={post.id} 
                className="group h-16 hover:bg-surfaceHigh/40 transition-colors relative cursor-default"
              >
                <td className="pl-8 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(post.id!)}
                    onChange={() => toggleSelect(post.id!)}
                    className="rounded border-outline/20 text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                  />
                </td>
                <td className="px-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-outline bg-surfaceHigh">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-surfaceHigh to-surface" />
                    )}
                  </div>
                </td>
                <td className="px-4 max-w-xs">
                  <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <p className="text-[11px] text-textMuted truncate font-medium">{post.excerpt}</p>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surfaceHigh border border-outline flex items-center justify-center text-[10px] font-black text-textMuted">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        post.author_name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-bold text-text">{post.author_name}</span>
                  </div>
                </td>
                <td className="px-4 text-center">
                  <span className="px-2.5 py-1 bg-surfaceHigh text-[9px] font-black text-textMuted rounded-full uppercase tracking-tighter border border-outline">
                    {post.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${post.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.3)]'}`}></span>
                    {post.status}
                  </div>
                </td>
                <td className="px-4 text-xs font-black text-text tracking-tight">{(post.views || 0).toLocaleString()}</td>
                <td className="pr-8 text-right relative">
                  <span className="text-[11px] text-textMuted font-black uppercase tracking-wider">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : 'Draft'}
                  </span>
                  
                  {/* Row Actions (Visible on Hover) */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-surfaceHigh/90 backdrop-blur pb-1 pt-1 pl-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 shadow-xl border border-outline px-2">
                    <button 
                      onClick={() => onEditPost(post)}
                      className="p-2 hover:bg-white rounded-lg text-textMuted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onPreviewPost(post.slug)}
                      className="p-2 hover:bg-white rounded-lg text-textMuted hover:text-blue-500 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onDuplicatePost(post)}
                      className="p-2 hover:bg-white rounded-lg text-textMuted hover:text-tertiary transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="w-px h-6 bg-outline/10 mx-1" />
                    <button 
                      onClick={() => onDeletePost(post.slug)}
                      className="p-2 hover:bg-white rounded-lg text-textMuted hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <p className="text-textMuted font-bold italic">No posts found matching your criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Bar (Floating) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[600px] bg-text shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-background rounded-full px-8 py-5 flex items-center justify-between z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight">{selectedIds.length} posts selected</span>
              <span className="text-[10px] text-background/50 font-bold uppercase tracking-widest">Multi-edit mode</span>
            </div>
            <div className="h-8 w-[1px] bg-white/20"></div>
            <div className="flex gap-3">
               <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black transition-colors border border-outline">Publish</button>
               <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black transition-colors border border-outline">Unpublish</button>
              <button className="bg-error hover:bg-error/80 px-4 py-2 rounded-xl text-xs font-black transition-colors shadow-lg shadow-error/20">Delete</button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="p-2 text-background/40 hover:text-background transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Pagination Bottom */}
      <div className="flex items-center justify-between mt-8 text-sm">
        <p className="text-textMuted font-bold tracking-tight italic">
          Showing <span className="text-text font-black not-italic">{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalPosts)}</span> of {totalPosts} posts
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-outline text-textMuted hover:bg-surfaceHigh transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          {[...Array(Math.ceil(totalPosts / 10))].map((_, i) => (
            <button 
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-11 h-11 flex items-center justify-center rounded-full text-sm font-black transition-all ${
                currentPage === i + 1 ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-110' : 'text-text hover:bg-surfaceHigh'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            disabled={currentPage >= Math.ceil(totalPosts / 10)}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-outline text-textMuted hover:bg-surfaceHigh transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
