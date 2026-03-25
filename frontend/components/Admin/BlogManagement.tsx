import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Tag as TagIcon, 
  Users, 
  Settings,
  ArrowLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  adminGetAllPosts, 
  adminGetPostBySlug,
  getAllCategories, 
  getAllTags, 
  getAllSubscribers,
  createPost,
  updatePost,
  deletePost,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  unsubscribeUser
} from '../../src/lib/blog';

import type { Post, Category, Tag, NewsletterSubscriber, PaginatedResponse } from '../../src/types/blog';

import { BlogOverview } from './blog/BlogOverview';
import { PostList } from './blog/PostList';
import { PostEditor } from './blog/PostEditor';
import { CategoryManager } from './blog/CategoryManager';
import { TagManager } from './blog/TagManager';
import { SubscriberManager } from './blog/SubscriberManager';

type ViewType = 'overview' | 'posts' | 'categories' | 'tags' | 'subscribers' | 'editor';

export const BlogManagement: React.FC = () => {
  const [view, setView] = useState<ViewType>('overview');
  const [prevView, setPrevView] = useState<ViewType>('overview');
  const [loading, setLoading] = useState(true);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Stats for overview
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categoriesCount: 0,
    tagsCount: 0,
    subscribersCount: '0',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [postsRes, categoriesData, tagsData, subscribersRes] = await Promise.all([
        adminGetAllPosts({ page: 1 }),
        getAllCategories(),
        getAllTags(),
        getAllSubscribers(1)
      ]);

      setPosts(postsRes.results);
      setTotalPosts(postsRes.count);
      setCategories(categoriesData);
      setTags(tagsData);
      setSubscribers(subscribersRes.results);
      setTotalSubscribers(subscribersRes.count);

      // Calculate stats
      setStats({
        totalPosts: postsRes.count,
        publishedPosts: postsRes.results.filter(p => p.status === 'published').length, // This is partial since it's just page 1
        draftPosts: postsRes.results.filter(p => p.status === 'draft').length,
        categoriesCount: categoriesData.length,
        tagsCount: tagsData.length,
        subscribersCount: subscribersRes.count > 1000 ? `${(subscribersRes.count / 1000).toFixed(1)}k` : subscribersRes.count.toString(),
      });
    } catch (err) {
      console.error('Failed to load blog data:', err);
      toast.error('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPosts = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const res = await adminGetAllPosts({ page, search });
      setPosts(res.results);
      setTotalPosts(res.count);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = async (post: Post) => {
    setLoading(true);
    try {
      const fullPost = await adminGetPostBySlug(post.slug);
      setEditingPost(fullPost);
      setView('editor');
    } catch (err) {
      toast.error('Failed to load full post details. Using preview data.');
      setEditingPost(post);
      setView('editor');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePost = async (post: Post) => {
    setLoading(true);
    try {
      const fullPost = await adminGetPostBySlug(post.slug);
      setEditingPost({ ...fullPost, id: undefined, slug: `${fullPost.slug}-copy` });
      setView('editor');
    } catch (err) {
      toast.error('Failed to duplicate post');
    } finally {
      setLoading(false);
    }
  };

  const buildPostPayload = (data: Partial<Post>) => {
    return {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image: data.cover_image || '',
      author_name: data.author_name,
      author_avatar: data.author_avatar || '',
      status: data.status,
      is_featured: data.is_featured ?? false,
      reading_time: data.reading_time ?? 5,
      seo_title: data.seo_title || '',
      seo_description: data.seo_description || '',
      category_id: data.category?.id ?? null,
      tag_ids: (data.tags || []).map((tag) => tag.id).filter((id): id is number => typeof id === 'number'),
    };
  };

  const handleSavePost = async (data: Partial<Post>) => {
    setLoading(true);
    try {
      const payload = buildPostPayload(data);
      if (editingPost) {
        await updatePost(editingPost.slug, payload);
        toast.success('Post updated successfully');
      } else {
        await createPost(payload);
        toast.success('Post created successfully');
      }
      setView('posts');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(slug);
      toast.success('Post deleted');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  // Category Actions
  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      await createCategory(data);
      toast.success('Category created');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async (slug: string, data: Partial<Category>) => {
    try {
      await updateCategory(slug, data);
      toast.success('Category updated');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(slug);
      toast.success('Category deleted');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // Tag Actions
  const handleCreateTag = async (data: Partial<Tag>) => {
    try {
      await createTag(data);
      toast.success('Tag created');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to create tag');
    }
  };

  const handleUpdateTag = async (slug: string, data: Partial<Tag>) => {
    try {
      await updateTag(slug, data);
      toast.success('Tag updated');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to update tag');
    }
  };

  const handleDeleteTag = async (slug: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await deleteTag(slug);
      toast.success('Tag deleted');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to delete tag');
    }
  };

  const handleUnsubscribe = async (id: number) => {
    if (!confirm('Unsubscribe this user?')) return;
    try {
      await unsubscribeUser(id);
      toast.success('User unsubscribed');
      loadInitialData();
    } catch (err) {
      toast.error('Failed to unsubscribe user');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'tags', label: 'Tags', icon: TagIcon },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
  ];

  if (view === 'editor') {
    return (
      <PostEditor 
        post={editingPost}
        categories={categories}
        tags={tags}
        onSave={(data) => handleSavePost({ ...data, status: 'draft' })}
        onPublish={(data) => handleSavePost({ ...data, status: 'published' })}
        onCancel={() => setView('posts')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-[#FBFBFC]">
      {/* Admin Blog Navigation */}
      <div className="flex items-center justify-between border-b border-outline/10 bg-white/40 backdrop-blur-xl px-12 py-6 sticky top-0 z-40">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
               <FileText size={20} />
             </div>
             <div>
                <h1 className="text-xl font-headline font-black text-text tracking-tight">Editorial</h1>
                <p className="text-[10px] uppercase font-bold text-textMuted tracking-widest opacity-60">Admin CMS v2.0</p>
             </div>
          </div>
          <nav className="flex items-center gap-1 p-1.5 bg-surfaceHigh/40 rounded-2xl">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPrevView(view); setView(item.id as ViewType); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                  view === item.id 
                    ? 'bg-white shadow-xl shadow-primary/5 text-primary' 
                    : 'text-textMuted hover:text-text hover:bg-white/40'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
           {view !== 'overview' && (
             <button 
               onClick={() => setView('overview')}
               className="p-3 bg-white border border-outline/10 rounded-xl text-textMuted hover:text-primary transition-all hover:shadow-lg shadow-primary/5 group"
             >
               <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
             </button>
           )}
           <button 
              onClick={() => { setEditingPost(null); setView('editor'); }}
              className="px-8 py-3.5 bg-text text-white rounded-full font-black text-xs shadow-2xl hover:scale-102 transition-transform active:scale-95 flex items-center gap-2"
           >
             <Plus size={18} />
             Create New
           </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="px-12 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <Loader2 size={48} className="text-primary animate-spin" />
                <div className="absolute inset-0 m-auto w-2 h-2 bg-primary rounded-full"></div>
             </div>
             <p className="text-sm font-black text-textMuted uppercase tracking-widest animate-pulse">Loading Editorial Data...</p>
          </div>
        ) : (
          <>
            {view === 'overview' && (
              <BlogOverview 
                stats={stats}
                recentPosts={posts.slice(0, 5)}
                onViewAllPosts={() => setView('posts')}
                onNewPost={() => { setEditingPost(null); setView('editor'); }}
                onEditPost={(post) => { void handleEditPost(post); }}
                onManageCategories={() => setView('categories')}
                onViewSubscribers={() => setView('subscribers')}
              />
            )}
            
            {view === 'posts' && (
              <PostList 
                posts={posts}
                totalPosts={totalPosts}
                currentPage={currentPage}
                onNewPost={() => { setEditingPost(null); setView('editor'); }}
                onEditPost={(post) => { void handleEditPost(post); }}
                onDeletePost={handleDeletePost}
                onPreviewPost={(slug) => window.open(`/blog/${slug}`, '_blank')}
                onDuplicatePost={(post) => { void handleDuplicatePost(post); }}
                onSearch={(term) => handleFetchPosts(1, term)}
                onFilterStatus={(status) => console.log('filter', status)}
                onFilterCategory={(id) => console.log('filter cat', id)}
                onSort={(sort) => console.log('sort', sort)}
                onPageChange={(page) => handleFetchPosts(page)}
              />
            )}

            {view === 'categories' && (
              <CategoryManager 
                categories={categories}
                onCreate={handleCreateCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />
            )}

            {view === 'tags' && (
              <TagManager 
                tags={tags}
                onCreate={handleCreateTag}
                onUpdate={handleUpdateTag}
                onDelete={handleDeleteTag}
              />
            )}

            {view === 'subscribers' && (
              <SubscriberManager 
                subscribers={subscribers}
                totalSubscribers={totalSubscribers}
                currentPage={currentPage}
                onUnsubscribe={handleUnsubscribe}
                onSearch={(term) => console.log('search sub', term)}
                onPageChange={(page) => console.log('page sub', page)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
