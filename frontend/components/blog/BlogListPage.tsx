import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import { getAllCategories, getAllPosts, getAllTags } from '../../src/lib/blog';
import type { Category, Post, Tag } from '../../src/types/blog';
import { BlogSEO } from './BlogSEO';
import { NewsletterSignup } from './NewsletterSignup';
import { PostCard } from './PostCard';
import { TagBadge } from './TagBadge';

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
    url: 'https://www.getpresently.com.ng/blog',
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-zinc-100">
      {/* SEO: Blog listing metadata and WebPage schema */}
      <BlogSEO
        title="Blog | Presently"
        description="Attendance, EdTech, and building for Nigerian universities."
        canonicalPath="/blog"
        jsonLd={webPageSchema}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#101827]/40 p-8 md:p-16 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#00FF94]/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#00FF94]/10 blur-[100px]" />
          
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00FF94]">Presently Editorial</p>
            <h1 className="mt-4 font-headline text-5xl font-black tracking-tight text-white md:text-7xl">
              The Presently Blog
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-400">
              Insightful commentary on attendance, EdTech, and building resilient systems for Nigerian institutions.
            </p>

            <div className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all focus-within:border-[#00FF94]/50 focus-within:bg-white/10 focus-within:ring-4 focus-within:ring-[#00FF94]/10">
              <Search size={20} className="text-zinc-400" />
              <input
                className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
                placeholder="Search articles, guides, or updates..."
                defaultValue={searchFilter}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const target = event.target as HTMLInputElement;
                    updateFilter('search', target.value.trim() || undefined);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {featuredPost && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="h-72 lg:h-full">
                {featuredPost.cover_image ? (
                  <img src={featuredPost.cover_image} alt={featuredPost.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-zinc-900" />
                )}
              </div>
              <div className="space-y-4 p-6 md:p-8">
                <span className="inline-flex rounded-full bg-[#00FF94] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0D1117]">
                  Featured
                </span>
                <h2 className="font-headline text-3xl font-bold text-white">{featuredPost.title}</h2>
                <p className="text-zinc-300">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag) => (
                    <TagBadge key={tag.slug} tag={tag} active={tagFilter === tag.slug} />
                  ))}
                </div>
                <p className="text-sm text-zinc-400">{featuredPost.reading_time} min read</p>
                <Link to={`/blog/${featuredPost.slug}`} className="inline-flex text-sm font-semibold text-[#00FF94] hover:opacity-80">
                  Read article →
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 space-y-3">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max items-center gap-2">
              <button
                className={[
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  !categoryFilter ? 'border-transparent bg-[#00FF94] text-[#0D1117]' : 'border-zinc-700 text-zinc-300 hover:border-[#00FF94]',
                ].join(' ')}
                onClick={() => updateFilter('category', undefined)}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className={[
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    categoryFilter === category.slug
                      ? 'border-transparent bg-[#00FF94] text-[#0D1117]'
                      : 'border-zinc-700 text-zinc-300 hover:border-[#00FF94]',
                  ].join(' ')}
                  onClick={() => updateFilter('category', category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max items-center gap-2">
              {tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} active={tagFilter === tag.slug} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <p className="text-zinc-400">Loading blog posts...</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {gridPosts.map((post) => (
                <PostCard key={`${post.source}-${post.slug}`} post={post} />
              ))}
            </div>
          )}

          {!loading && !gridPosts.length && (
            <p className="mt-6 text-zinc-400">No posts matched your filters.</p>
          )}

          {canLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full bg-[#00FF94] px-5 py-2 text-sm font-semibold text-[#0D1117] disabled:cursor-not-allowed disabled:opacity-70"
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
    </div>
  );
};
