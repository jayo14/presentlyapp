import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const markdownToHtml = (content: string): string => {
  const lines = content.split('\n');
  const html: string[] = [];
  let inCode = false;
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        html.push('<pre><code>');
      } else {
        inCode = false;
        html.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (/^###\s+/.test(line)) {
      const text = line.replace(/^###\s+/, '').trim();
      html.push(`<h3 id="${slugify(text)}">${escapeHtml(text)}</h3>`);
      continue;
    }

    if (/^##\s+/.test(line)) {
      const text = line.replace(/^##\s+/, '').trim();
      html.push(`<h2 id="${slugify(text)}">${escapeHtml(text)}</h2>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        inList = true;
        html.push('<ul>');
      }
      html.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, '').trim())}</li>`);
      continue;
    }

    if (inList) {
      inList = false;
      html.push('</ul>');
    }

    if (!line) {
      html.push('');
      continue;
    }

    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (inList) html.push('</ul>');
  if (inCode) html.push('</code></pre>');

  return html.join('\n');
};

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
    <div className="min-h-screen bg-[#0D1117] text-zinc-100 relative selection:bg-[#00FF94]/30 selection:text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-[#00FF94]/5 from-10% to-transparent to-100%" />
      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#00FF94]/5 blur-[120px]" />
      
      {/* SEO: Per-article metadata and Article schema */}
      <BlogSEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        image={post.cover_image}
        jsonLd={articleSchema || undefined}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-12">
          <PostHeader post={post} />
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="prose prose-invert max-w-none prose-headings:font-headline prose-headings:text-white prose-a:text-[#00FF94] hover:prose-a:underline prose-code:text-[#00FF94] prose-pre:bg-[#111826] prose-pre:border prose-pre:border-white/5 prose-img:rounded-3xl prose-img:shadow-2xl">
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />

            <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-8">
              {post.tags.map((tag) => (
                <TagBadge key={tag.slug} tag={tag} />
              ))}
            </div>

            <ShareButtons slug={post.slug} title={post.title} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t border-white/5 pt-16">
          <h3 className="mb-8 font-headline text-3xl font-bold text-white">Read Next</h3>
          <RelatedPosts currentSlug={post.slug} tags={post.tags.map((tag) => tag.slug)} />
        </div>

        <section className="mt-24">
          <NewsletterSignup source={post.slug} />
        </section>
      </main>
    </div>
  );
};
