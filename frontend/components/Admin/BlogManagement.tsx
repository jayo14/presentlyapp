import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Tag as TagIcon, 
  Users, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  adminGetAllPosts, 
  getAllCategories, 
  getAllTags, 
  getAllSubscribers,
} from '../../src/lib/blog';

import type { Post, Category, Tag, NewsletterSubscriber } from '../../src/types/blog';

import { BlogOverview } from './blog/BlogOverview';
import { PostList } from './blog/PostList';
import { PostEditor } from './blog/PostEditor';
import { CategoryManager } from './blog/CategoryManager';
import { TagManager } from './blog/TagManager';
import { SubscriberManager } from './blog/SubscriberManager';
import { DashboardPage } from '../../src/components/layout-primitives/DashboardPage';
import { Button } from '../Button';
import { cn } from '../../src/components/ui/utils';

type ViewType = 'overview' | 'posts' | 'categories' | 'tags' | 'subscribers' | 'editor';

export const BlogManagement: React.FC = () => {
  const [view, setView] = useState<ViewType>('overview');
  const [prevView, setPrevView] = useState<ViewType>('overview');
  const [loading, setLoading] = useState(true);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, catsRes, tagsRes, subsRes] = await Promise.all([
        adminGetAllPosts(1, 10),
        getAllCategories(),
        getAllTags(),
        getAllSubscribers()
      ]);

      setPosts(postsRes.results);
      setCategories(catsRes);
      setTags(tagsRes);
      setSubscribers(subsRes);
    } catch (err) {
      toast.error('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigateToEditor = (post: Post | null = null) => {
    setEditingPost(post);
    setPrevView(view);
    setView('editor');
  };

  const handleBack = () => {
    setView(prevView);
    setEditingPost(null);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'posts', label: 'All Posts', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'tags', label: 'Tags', icon: TagIcon },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-on-surface-variant">
        <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
        <span className="font-bold uppercase tracking-widest text-xs">Accessing Editorial CMS...</span>
      </div>
    );
  }

  return (
    <DashboardPage
      title={view === 'editor' ? (editingPost ? 'Edit Article' : 'Compose Post') : 'Institutional Blog'}
      description={view === 'editor' ? 'Craft compelling narratives for the university community.' : 'Manage public communication, newsletters, and announcements.'}
      seoTitle="Blog CMS | Presently Admin"
      action={
        view === 'editor' ? (
          <Button variant="outline" onClick={handleBack} className="h-14 px-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Discard
          </Button>
        ) : (
          <Button size="lg" className="h-16 px-8 shadow-gold" onClick={() => navigateToEditor()}>
            <Plus className="w-5 h-5 mr-2" /> New Post
          </Button>
        )
      }
    >
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Sub-navigation */}
        {view !== 'editor' && (
          <aside className="w-full lg:w-72 shrink-0">
             <nav className="flex flex-col gap-2 sticky top-24">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as ViewType)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl transition-all group",
                      view === item.id
                        ? "bg-sungold text-presently-black shadow-gold font-bold"
                        : "text-on-surface-variant hover:bg-surface-highest/40 hover:translate-x-1"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} className={view === item.id ? "text-presently-black" : "text-on-surface-variant group-hover:text-on-surface"} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {view === item.id && <ChevronRight size={14} />}
                  </button>
                ))}
             </nav>
          </aside>
        )}

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0">
          {view === 'overview' && (
            <BlogOverview
              posts={posts}
              categories={categories}
              subscribers={subscribers}
              onViewAllPosts={() => setView('posts')}
              onNewPost={() => navigateToEditor()}
            />
          )}
          {view === 'posts' && (
            <PostList
              posts={posts}
              onEdit={navigateToEditor}
              onRefresh={fetchData}
            />
          )}
          {view === 'categories' && (
            <CategoryManager
              categories={categories}
              onRefresh={fetchData}
            />
          )}
          {view === 'tags' && (
            <TagManager
              tags={tags}
              onRefresh={fetchData}
            />
          )}
          {view === 'subscribers' && (
            <SubscriberManager
              subscribers={subscribers}
              onRefresh={fetchData}
            />
          )}
          {view === 'editor' && (
            <PostEditor
              post={editingPost}
              categories={categories}
              tags={tags}
              onSave={() => {
                fetchData();
                handleBack();
              }}
              onCancel={handleBack}
            />
          )}
        </main>
      </div>
    </DashboardPage>
  );
};

export default BlogManagement;
