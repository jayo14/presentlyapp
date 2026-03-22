import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Tag as TagIcon,
  Users,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getAllPosts, getAllCategories, getAllTags } from '../../src/lib/blog';
import type { Post, Category, Tag } from '../../src/types/blog';
import { Button } from '../Button';

export const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'subscribers'>('posts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allPosts, allCategories, allTags] = await Promise.all([
        getAllPosts(),
        getAllCategories(),
        getAllTags()
      ]);
      setPosts(allPosts);
      setCategories(allCategories);
      setTags(allTags);
    } catch (err) {
      console.error('Failed to fetch blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-black text-text tracking-tight">Blog management</h2>
          <p className="text-textMuted">Publish, edit, and organize your platform's editorial content.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-outline/20">
             <Filter size={18} className="mr-2" />
             Filters
           </Button>
           <Button className="rounded-xl bg-primary text-white shadow-xl shadow-primary/20">
             <Plus size={18} className="mr-2" />
             Create post
           </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total posts', value: posts.length, icon: FileText, color: 'text-primary' },
          { label: 'Categories', value: categories.length, icon: TagIcon, color: 'text-blue-500' },
          { label: 'Active tags', value: tags.length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Subscribers', value: '2.5k', icon: Users, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[1.5rem] border border-outline/10 bg-surface/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className={stat.color} />
              <ChevronRight size={16} className="text-textMuted/40" />
            </div>
            <p className="text-2xl font-black text-text tracking-tight">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-textMuted/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs / Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-surfaceHigh/40 rounded-2xl w-fit">
        {(['posts', 'categories', 'subscribers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
              activeTab === tab ? 'bg-surface shadow-md text-primary' : 'text-textMuted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-[2rem] border border-outline/10 bg-surface/40 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="w-full h-11 pl-12 pr-4 rounded-xl border border-outline/20 bg-surfaceHigh/20 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <button className="h-11 px-4 rounded-xl border border-outline/20 text-sm font-bold text-textMuted hover:bg-surfaceHigh transition-colors">Export CSV</button>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textMuted animate-pulse">Gathering stories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surfaceHigh/30 border-b border-outline/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-textMuted/60">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-textMuted/60">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-textMuted/60">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-textMuted/60">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-textMuted/60">Date</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {filteredPosts.map((post) => (
                  <tr key={post.slug} className="group hover:bg-primary/5 transition-colors duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-surfaceHigh flex-shrink-0 border border-outline/10">
                          {post.cover_image ? (
                            <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-surfaceHigh to-surface" />
                          )}
                        </div>
                        <div>
                           <p className="font-bold text-text mb-0.5 group-hover:text-primary transition-colors">{post.title}</p>
                           <p className="text-xs text-textMuted line-clamp-1">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-surfaceHigh flex items-center justify-center text-[10px] font-bold text-textMuted border border-outline/10">
                           {post.author_name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-text">{post.author_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-2.5 py-1 rounded-lg bg-surfaceHigh text-[11px] font-bold text-textMuted border border-outline/10">
                         {post.category?.name || 'Uncategorized'}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                         <div className={`h-2 w-2 rounded-full ${post.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`} />
                         <span className="text-xs font-bold uppercase tracking-wider text-textMuted capitalize">{post.status || 'Draft'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-sm font-medium text-text">{new Date(post.published_at || '').toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                          <span className="text-[10px] text-textMuted uppercase font-bold tracking-widest">{post.reading_time}m read</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-surfaceHigh text-textMuted hover:text-primary" title="Edit Post">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-surfaceHigh text-textMuted hover:text-blue-500" title="View live">
                            <ExternalLink size={16} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-surfaceHigh text-red-500/60 hover:text-red-500" title="Delete">
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="p-20 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-surfaceHigh/50 mb-6">
               <FileText size={32} className="text-textMuted/40" />
            </div>
            <h4 className="text-xl font-black text-text mb-2">No posts found</h4>
            <p className="text-textMuted max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};
