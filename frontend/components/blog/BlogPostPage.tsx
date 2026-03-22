import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { getPostBySlug } from '../../src/lib/blog';
import type { Post } from '../../src/types/blog';
import { BlogSEO } from './BlogSEO';
import { NewsletterSignup } from './NewsletterSignup';
import { PostHeader } from './PostHeader';
import { RelatedPosts } from './RelatedPosts';
import { TableOfContents } from './TableOfContents';
import { TagBadge } from './TagBadge';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const ShareButtons: React.FC<{ slug: string; title: string }> = ({ slug, title }) => {
  const absolute = `https://www.getpresently.com.ng/blog/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(absolute);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <a
        href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:text-[#00FF94]"
      >
        Share on X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:text-[#00FF94]"
      >
        Share on LinkedIn
      </a>
      <button
        onClick={() => navigator.clipboard?.writeText(absolute)}
        className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:text-[#00FF94]"
      >
        Copy link
      </button>
    </div>
  );
};

export const BlogPostPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPostBySlug(slug).then((item) => {
      if (!mounted) return;
      setPost(item);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const articleSchema = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.cover_image,
      datePublished: post.published_at,
      author: {
        '@type': 'Person',
        name: post.author_name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Presently',
        url: 'https://www.getpresently.com.ng',
      },
      keywords: post.tags.map((tag) => tag.name),
      mainEntityOfPage: `https://www.getpresently.com.ng/blog/${post.slug}`,
    };
  }, [post]);

  if (loading) {
    return <div className="min-h-screen bg-[#0D1117] px-6 py-16 text-zinc-200">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0D1117] px-6 py-16 text-zinc-100">
        <BlogSEO
          title="Blog Post Not Found"
          description="Requested article could not be found."
          canonicalPath="/blog"
        />
        <h1 className="font-headline text-3xl font-bold">Article Not Found</h1>
        <Link className="mt-4 inline-flex text-[#00FF94]" to="/blog">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-zinc-100">
      {/* SEO: Per-article metadata and Article schema */}
      <BlogSEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        image={post.cover_image}
        jsonLd={articleSchema || undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <PostHeader post={post} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="prose prose-invert max-w-none prose-headings:font-headline prose-headings:text-white prose-a:text-[#00FF94] prose-code:text-[#00FF94]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeHighlight]}
              components={{
                h2: ({ children }: { children?: React.ReactNode }) => {
                  const text = String(children);
                  return <h2 id={slugify(text)}>{children}</h2>;
                },
                h3: ({ children }: { children?: React.ReactNode }) => {
                  const text = String(children);
                  return <h3 id={slugify(text)}>{children}</h3>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>

            <div className="mt-8 flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
              {post.tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} />
              ))}
            </div>

            <ShareButtons slug={post.slug} title={post.title} />
          </article>

          <div>
            <TableOfContents content={post.content} />
          </div>
        </div>

        <RelatedPosts currentSlug={post.slug} tags={post.tags.map((tag) => tag.slug)} />

        <section className="mt-12">
          <NewsletterSignup source={post.slug} />
        </section>
      </main>
    </div>
  );
};
