import React, { useState, useEffect } from 'react';
import {
  Plus,
  LayoutDashboard,
  FileText,
  Layers,
  Tag as TagIcon,
  Users,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

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

import type { Post, Category, Tag, NewsletterSubscriber } from '../../src/types/blog';

import { BlogOverview } from './blog/BlogOverview';
import { PostList } from './blog/PostList';
import { PostEditor } from './blog/PostEditor';
import { CategoryManager } from './blog/CategoryManager';
import { TagManager } from './blog/TagManager';
import { SubscriberManager } from './blog/SubscriberManager';

// ─── Derive view from URL path ────────────────────────────────────────────────
// /dashboard/blog          → overview
// /dashboard/blog/posts    → posts
// /dashboard/blog/new      → editor
// /dashboard/blog/categories → categories
// /dashboard/blog/tags     → tags
// /dashboard/blog/subscribers → subscribers

type ViewType = 'overview' | 'posts' | 'categories' | 'tags' | 'subscribers' | 'editor';

function pathToView(pathname: string): ViewType {
  if (pathname.endsWith('/new')) return 'editor';
  if (pathname.endsWith('/posts')) return 'posts';
  if (pathname.endsWith('/categories')) return 'categories';
  if (pathname.endsWith('/tags')) return 'tags';
  if (pathname.endsWith('/subscribers')) return 'subscribers';
  return 'overview';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const view: ViewType = pathToView(location.pathname);

  const goTo = (v: ViewType) => {
    const base = '/dashboard/blog';
    const map: Record<ViewType, string> = {
      overview: base,
      posts: `${base}/posts`,
      categories: `${base}/categories`,
      tags: `${base}/tags`,
      subscribers: `${base}/subscribers`,
      editor: `${base}/new`,
    };
    navigate(map[v]);
  };

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categoriesCount: 0,
    tagsCount: 0,
    subscribersCount: '0',
  });

  useEffect(() => { loadInitialData(); }, []);

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
      setStats({
        totalPosts: postsRes.count,
        publishedPosts: postsRes.results.filter(p => p.status === 'published').length,
        draftPosts: postsRes.results.filter(p => p.status === 'draft').length,
        categoriesCount: categoriesData.length,
        tagsCount: tagsData.length,
        subscribersCount: subscribersRes.count > 1000
          ? `${(subscribersRes.count / 1000).toFixed(1)}k`
          : subscribersRes.count.toString(),
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
    } catch { toast.error('Failed to fetch posts'); }
    finally { setLoading(false); }
  };

  const handleEditPost = async (post: Post) => {
    setLoading(true);
    try {
      const fullPost = await adminGetPostBySlug(post.slug);
      setEditingPost(fullPost);
      goTo('editor');
    } catch {
      toast.error('Failed to load post details. Using preview data.');
      setEditingPost(post);
      goTo('editor');
    } finally { setLoading(false); }
  };

  const handleDuplicatePost = async (post: Post) => {
    setLoading(true);
    try {
      const fullPost = await adminGetPostBySlug(post.slug);
      setEditingPost({ ...fullPost, id: undefined, slug: `${fullPost.slug}-copy` });
      goTo('editor');
    } catch { toast.error('Failed to duplicate post'); }
    finally { setLoading(false); }
  };

  const buildPostPayload = (data: Partial<Post>) => ({
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
    tag_ids: (data.tags || []).map(t => t.id).filter((id): id is number => typeof id === 'number'),
  });

  const handleSavePost = async (data: Partial<Post>) => {
    setLoading(true);
    try {
      const payload = buildPostPayload(data);
      if (editingPost?.slug) {
        await updatePost(editingPost.slug, payload);
        toast.success('Post updated');
      } else {
        await createPost(payload);
        toast.success('Post created');
      }
      setEditingPost(null);
      goTo('posts');
      loadInitialData();
    } catch { toast.error('Failed to save post'); }
    finally { setLoading(false); }
  };

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    try { await deletePost(slug); toast.success('Post deleted'); loadInitialData(); }
    catch { toast.error('Failed to delete post'); }
  };

  const handleCreateCategory = async (data: Partial<Category>) => {
    try { await createCategory(data); toast.success('Category created'); loadInitialData(); }
    catch { toast.error('Failed to create category'); }
  };
  const handleUpdateCategory = async (slug: string, data: Partial<Category>) => {
    try { await updateCategory(slug, data); toast.success('Category updated'); loadInitialData(); }
    catch { toast.error('Failed to update category'); }
  };
  const handleDeleteCategory = async (slug: string) => {
    if (!confirm('Delete this category?')) return;
    try { await deleteCategory(slug); toast.success('Category deleted'); loadInitialData(); }
    catch { toast.error('Failed to delete category'); }
  };

  const handleCreateTag = async (data: Partial<Tag>) => {
    try { await createTag(data); toast.success('Tag created'); loadInitialData(); }
    catch { toast.error('Failed to create tag'); }
  };
  const handleUpdateTag = async (slug: string, data: Partial<Tag>) => {
    try { await updateTag(slug, data); toast.success('Tag updated'); loadInitialData(); }
    catch { toast.error('Failed to update tag'); }
  };
  const handleDeleteTag = async (slug: string) => {
    if (!confirm('Delete this tag?')) return;
    try { await deleteTag(slug); toast.success('Tag deleted'); loadInitialData(); }
    catch { toast.error('Failed to delete tag'); }
  };

  const handleUnsubscribe = async (id: number) => {
    if (!confirm('Unsubscribe this user?')) return;
    try { await unsubscribeUser(id); toast.success('User unsubscribed'); loadInitialData(); }
    catch { toast.error('Failed to unsubscribe user'); }
  };

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
    { id: 'posts',        label: 'Posts',         icon: FileText },
    { id: 'categories',   label: 'Categories',    icon: Layers },
    { id: 'tags',         label: 'Tags',          icon: TagIcon },
    { id: 'subscribers',  label: 'Subscribers',   icon: Users },
  ];

  // ── Editor full-page view ──────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <PostEditor
        post={editingPost}
        categories={categories}
        tags={tags}
        onSave={(data) => handleSavePost({ ...data, status: 'draft' })}
        onPublish={(data) => handleSavePost({ ...data, status: 'published' })}
        onCancel={() => { setEditingPost(null); goTo('posts'); }}
      />
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 min-h-screen bg-background text-text">

      {/* ── Top navigation bar ── */}
      <div className="flex items-center justify-between border-b border-outline bg-surface/80 backdrop-blur-xl px-6 lg:px-12 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-6 lg:gap-12 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <FileText size={18} />
            </div>
            <div>
              <h1 className="text-base font-headline font-black text-text tracking-tight">Editorial</h1>
              <p className="text-[10px] uppercase font-bold text-textMuted tracking-widest opacity-60">Admin CMS</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 p-1.5 bg-surfaceHigh/40 rounded-2xl">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => goTo(item.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 ${
                  view === item.id
                    ? 'bg-surface shadow-md text-primary'
                    : 'text-textMuted hover:text-text hover:bg-surface/60'
                }`}
              >
                <item.icon size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {view !== 'overview' && (
            <button
              onClick={() => goTo('overview')}
               className="p-2.5 bg-surface border border-outline rounded-xl text-textMuted hover:text-primary transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <button
            onClick={() => { setEditingPost(null); goTo('editor'); }}
            className="px-5 py-2.5 bg-text text-background rounded-full font-black text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Create New
          </button>
        </div>
      </div>

      {/* ── Main viewport ── */}
      <div className="px-6 lg:px-12 pb-24 animate-in fade-in duration-500">
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-sm font-black text-textMuted uppercase tracking-widest animate-pulse">
              Loading Editorial Data…
            </p>
          </div>
        ) : (
          <>
            {view === 'overview' && (
              <BlogOverview
                stats={stats}
                recentPosts={posts.slice(0, 5)}
                onViewAllPosts={() => goTo('posts')}
                onNewPost={() => { setEditingPost(null); goTo('editor'); }}
                onEditPost={(post) => { void handleEditPost(post); }}
                onManageCategories={() => goTo('categories')}
                onViewSubscribers={() => goTo('subscribers')}
              />
            )}

            {view === 'posts' && (
              <PostList
                posts={posts}
                totalPosts={totalPosts}
                currentPage={currentPage}
                onNewPost={() => { setEditingPost(null); goTo('editor'); }}
                onEditPost={(post) => { void handleEditPost(post); }}
                onDeletePost={handleDeletePost}
                onPreviewPost={(slug) => window.open(`/blog/${slug}`, '_blank')}
                onDuplicatePost={(post) => { void handleDuplicatePost(post); }}
                onSearch={(term) => handleFetchPosts(1, term)}
                onFilterStatus={(status) => console.log('filter status', status)}
                onFilterCategory={(id) => console.log('filter category', id)}
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
                onSearch={(term) => handleFetchPosts(1, term)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
