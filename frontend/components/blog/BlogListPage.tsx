import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import { getAllCategories, getAllPosts, getAllTags } from '../../src/lib/blog';
import type { Category, Post, Tag } from '../../src/types/blog';
import { BlogSEO } from './BlogSEO';
import { NewsletterSignup } from './NewsletterSignup';
import { PostCard } from './PostCard';
import { TagBadge } from './TagBadge';
import { LandingHeader } from '../LandingHeader';
import { LandingFooter } from '../LandingFooter';

export const BlogListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
  const searchFilter = searchParams.get('search') || '';

  useEffect(() => {
    let mounted = true;
    Promise.all([getAllCategories(), getAllTags()]).then(([cats, tgs]) => {
      if (!mounted) return;
      setCategories(cats);
      setTags(tgs);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setCurrentPage(1);
    getAllPosts({ category: categoryFilter || undefined, tag: tagFilter || undefined, search: searchFilter || undefined, page: 1 }).then((items) => {
      if (!mounted) return;
      setPosts(items);
      setCanLoadMore(items.length >= 10);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [categoryFilter, tagFilter, searchFilter]);

  const featuredPost = useMemo(() => posts.find((post) => post.is_featured), [posts]);
  const gridPosts = useMemo(() => posts.filter((post) => post.slug !== featuredPost?.slug), [posts, featuredPost]);

  const updateFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    const items = await getAllPosts({
      category: categoryFilter || undefined,
      tag: tagFilter || undefined,
      search: searchFilter || undefined,
      page: nextPage,
    });

    setPosts((prev) => [...prev, ...items]);
    setCurrentPage(nextPage);
    setCanLoadMore(items.length >= 10);
    setLoadingMore(false);
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Blog | Presently',
    description: 'Attendance, EdTech, and building for Nigerian universities.',
    url: 'https://getpresently.com.ng/blog',
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primaryContainer selection:text-primary">
      {/* SEO: Blog listing metadata and WebPage schema */}
      <BlogSEO
        title="Blog | Presently"
        description="Attendance, EdTech, and building for Nigerian universities."
        canonicalPath="/blog"
        jsonLd={webPageSchema}
      />

      <LandingHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-32 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[3rem] border border-outline/10 bg-surface/30 p-8 md:p-20 backdrop-blur-2xl">
          {/* Animated/Dynamic Blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-secondaryContiner/5 blur-[150px]" />

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Presently Editorial
            </span>
            <h1 className="font-headline text-6xl font-black tracking-tight text-text md:text-8xl lg:text-[7rem] leading-[0.9]">
              The <span className="text-primary italic">Presently</span> Blog
            </h1>
            <p className="mt-8 text-lg md:text-xl text-textMuted leading-relaxed max-w-2xl mx-auto">
              Deep dives into attendance tech, university modernization, and the future of education in Nigeria.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row max-w-2xl mx-auto items-stretch gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-2xl border border-outline/20 bg-surface/60 px-5 py-4 backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                <Search size={20} className="text-textMuted" />
                <input
                  className="w-full bg-transparent text-base text-text placeholder:text-textMuted focus:outline-none"
                  placeholder="Search articles, stories, or guides..."
                  defaultValue={searchFilter}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      const target = event.target as HTMLInputElement;
                      updateFilter('search', target.value.trim() || undefined);
                    }
                  }}
                />
              </div>
              <button
                className="btn-presently-primary rounded-2xl px-8 font-bold"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                  if (input) updateFilter('search', input.value.trim() || undefined);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </section>

        {featuredPost && (
          <section className="mt-16 overflow-hidden rounded-[2.5rem] border border-outline/10 bg-surface/40 backdrop-blur-md group hover:border-primary/30 transition-all duration-500">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="h-80 lg:h-full relative overflow-hidden">
                {featuredPost.cover_image ? (
                  <img src={featuredPost.cover_image} alt={featuredPost.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-surfaceHigh to-surface" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent" />
              </div>
              <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Featured Post
                  </span>
                  {featuredPost.category?.name && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-textMuted">
                      {featuredPost.category.name}
                    </span>
                  )}
                </div>
                <h2 className="font-headline text-4xl md:text-5xl font-black text-text leading-tight group-hover:text-primary transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-textMuted leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags?.map((tag) => (
                    <TagBadge key={tag.slug} tag={tag} active={tagFilter === tag.slug} />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-outline/10 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 flex items-center justify-center rounded-full bg-surfaceHigh text-text font-bold border border-outline/10">
                      {featuredPost.author_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text">{featuredPost.author_name}</span>
                      <span className="text-[11px] text-textMuted">{featuredPost.reading_time} min read</span>
                    </div>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`} className="btn-presently-secondary !px-6 !py-3 rounded-xl text-sm font-bold">
                    Continue reading
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-20 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="font-headline text-2xl font-black text-text">Explore Categories</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
              <button
                className={[
                  'rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap',
                  !categoryFilter ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20 scale-105' : 'border-outline/10 text-textMuted hover:border-primary/50 hover:text-text hover:bg-surfaceHigh',
                ].join(' ')}
                onClick={() => updateFilter('category', undefined)}
              >
                All Stories
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className={[
                    'rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap',
                    categoryFilter === category.slug
                      ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'border-outline/10 text-textMuted hover:border-primary/50 hover:text-text hover:bg-surfaceHigh',
                  ].join(' ')}
                  onClick={() => updateFilter('category', category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap border-t border-outline/10 pt-8">
            <span className="text-xs font-bold uppercase tracking-widest text-textMuted/60 mr-2">Top Tags:</span>
            {tags.slice(0, 12).map((tag) => (
              <TagBadge key={tag.slug} tag={tag} active={tagFilter === tag.slug} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          {loading ? (
            <p className="text-textMuted">Loading blog posts...</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post) => (
                <PostCard key={`${post.source}-${post.slug}`} post={post} />
              ))}
            </div>
          )}

          {!loading && !gridPosts.length && (
            <p className="mt-6 text-textMuted">No posts matched your filters.</p>
          )}

          {canLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary-fixed disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </section>

        <section className="mt-12">
          <NewsletterSignup source="blog-list" />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
