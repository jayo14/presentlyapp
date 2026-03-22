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
import { ShareButtons } from './ShareButtons';
import { LandingHeader } from '../LandingHeader';
import { LandingFooter } from '../LandingFooter';

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

// Remove local ShareButtons as we are importing it from components/blog/ShareButtons.tsx

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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-textMuted text-lg font-medium">Coming presently...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <div className="mx-auto max-w-7xl px-4 py-32 text-center">
          <BlogSEO
            title="Blog Post Not Found"
            description="Requested article could not be found."
            canonicalPath="/blog"
          />
          <h1 className="font-headline text-4xl font-bold text-text">Article Not Found</h1>
          <p className="mt-4 text-textMuted">The post you are looking for doesn't exist or has been moved.</p>
          <Link className="mt-8 inline-flex btn-presently-primary px-6 py-3 rounded-full" to="/blog">
            Back to Blog
          </Link>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text relative selection:bg-primaryContainer selection:text-primary overflow-hidden">
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute -right-20 top-20 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[700px] w-[700px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-primary/5 from-10% to-transparent to-100%" />
      
      {/* SEO: Per-article metadata and Article schema */}
      <BlogSEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        image={post.cover_image}
        jsonLd={articleSchema || undefined}
      />

      <LandingHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-32 md:px-6 lg:px-8">
        <div className="mb-16">
          <PostHeader post={post} />
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_320px]">
          <div className="relative">
            {/* Social Share Sidebar (Desktop Only) */}
            <div className="hidden xl:block absolute -left-20 top-0 sticky top-40 space-y-4">
              <ShareButtons vertical slug={post.slug} title={post.title} />
            </div>

            <article className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-headline prose-headings:text-text prose-headings:tracking-tight
              prose-h1:text-5xl prose-h1:font-black
              prose-h2:text-4xl prose-h2:font-extrabold
              prose-p:text-textMuted prose-p:leading-relaxed
              prose-a:text-primary prose-a:font-bold hover:prose-a:underline 
              prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:rounded
              prose-pre:bg-surface/60 prose-pre:border prose-pre:border-outline/10 prose-pre:backdrop-blur-sm
              prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:border prose-img:border-outline/10
              prose-blockquote:border-l-primary prose-blockquote:bg-surfaceHigh/40 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl
            ">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />

              <div className="mt-16 flex flex-wrap gap-3 border-t border-outline/10 pt-10">
                <span className="text-xs font-bold uppercase tracking-widest text-textMuted mr-2 self-center">Tags:</span>
                {post.tags.map((tag) => (
                  <TagBadge key={tag.slug} tag={tag} />
                ))}
              </div>

              <div className="mt-12 xl:hidden">
                <ShareButtons slug={post.slug} title={post.title} />
              </div>
            </article>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-40 space-y-8">
              <TableOfContents content={post.content} />
              
              <div className="rounded-[2rem] border border-outline/10 bg-surface/40 backdrop-blur-md p-8">
                <h4 className="font-headline text-lg font-bold text-text mb-4">About the Author</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-surfaceHigh flex items-center justify-center font-black text-xl text-text border border-outline/10">
                    {post.author_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-text">{post.author_name}</p>
                    <p className="text-xs text-textMuted">Presently Contributor</p>
                  </div>
                </div>
                <p className="text-sm text-textMuted leading-relaxed">
                  Passionate about the intersection of education and technology in modern Nigeria.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-32 border-t border-outline/10 pt-20">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-headline text-4xl font-black text-text tracking-tight">Read Next</h3>
            <Link to="/blog" className="text-primary font-bold hover:underline">View all articles →</Link>
          </div>
          <RelatedPosts currentSlug={post.slug} tags={post.tags.map((tag) => tag.slug)} />
        </div>

        <section className="mt-32">
          <NewsletterSignup source={post.slug} />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
