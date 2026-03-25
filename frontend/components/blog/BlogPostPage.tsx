import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy, Link2 } from 'lucide-react';
import highlightLightCss from 'highlight.js/styles/github.css?url';
import highlightDarkCss from 'highlight.js/styles/github-dark.css?url';

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

const extractNodeText = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join(' ');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }
  return '';
};

// Remove local ShareButtons as we are importing it from components/blog/ShareButtons.tsx

export const BlogPostPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCodeKey, setCopiedCodeKey] = useState('');

  useEffect(() => {
    const styleId = 'blog-highlight-theme';
    let linkElement = document.getElementById(styleId) as HTMLLinkElement | null;

    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = styleId;
      linkElement.rel = 'stylesheet';
      document.head.appendChild(linkElement);
    }

    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const nextHref = isDark ? highlightDarkCss : highlightLightCss;
      if (linkElement && linkElement.href !== nextHref) {
        linkElement.href = nextHref;
      }
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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
        url: 'https://getpresently.com.ng',
      },
      keywords: post.tags.map((tag) => tag.name),
      mainEntityOfPage: `https://getpresently.com.ng/blog/${post.slug}`,
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

  const resolvedSeoTitle = (post.seo_title || '').trim() || post.title;
  const resolvedSeoDescription = (post.seo_description || '').trim() || post.excerpt;
  const resolvedSeoKeywords = [
    ...post.tags.map((tag) => tag.name),
    post.category?.name,
    post.author_name,
    'presently blog',
  ]
    .filter(Boolean)
    .join(', ');

  const handleCopyCode = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCodeKey(key);
      window.setTimeout(() => {
        setCopiedCodeKey((currentKey) => (currentKey === key ? '' : currentKey));
      }, 1800);
    } catch {
      setCopiedCodeKey('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text relative selection:bg-primaryContainer selection:text-primary">
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-20 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute -left-40 top-1/2 h-[700px] w-[700px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-primary/5 from-10% to-transparent to-100%" />
      </div>
      
      {/* SEO: Per-article metadata and Article schema */}
      <BlogSEO
        title={resolvedSeoTitle}
        description={resolvedSeoDescription}
        keywords={resolvedSeoKeywords}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        image={post.cover_image || undefined}
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
            <div className="hidden xl:block absolute -left-20 top-0 pointer-events-none">
              <div className="sticky top-40 space-y-4 pointer-events-auto">
                <ShareButtons vertical slug={post.slug} title={post.title} />
              </div>
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children, ...props }: any) => {
                    const id = slugify(extractNodeText(children));
                    return (
                      <h1
                        id={id}
                        className="group scroll-mt-32 mt-16 mb-8 flex items-center gap-2 font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-text"
                        {...props}
                      >
                        <span className="flex-1">{children}</span>
                        <a
                          href={`#${id}`}
                          className="opacity-0 transition-opacity text-textMuted group-hover:opacity-100 hover:text-primary"
                          aria-label="Copy section link"
                        >
                          <Link2 size={20} />
                        </a>
                      </h1>
                    );
                  },
                  h2: ({ children, ...props }: any) => {
                    const id = slugify(extractNodeText(children));
                    return (
                      <h2
                        id={id}
                        className="group scroll-mt-32 mt-14 mb-6 flex items-center gap-2 border-b border-outline/10 pb-3 font-headline text-3xl md:text-4xl font-black tracking-tight text-text"
                        {...props}
                      >
                        <span className="flex-1">{children}</span>
                        <a
                          href={`#${id}`}
                          className="opacity-0 transition-opacity text-textMuted group-hover:opacity-100 hover:text-primary"
                          aria-label="Copy section link"
                        >
                          <Link2 size={18} />
                        </a>
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }: any) => {
                    const id = slugify(extractNodeText(children));
                    return (
                      <h3
                        id={id}
                        className="group scroll-mt-32 mt-10 mb-4 flex items-center gap-2 font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-text"
                        {...props}
                      >
                        <span className="flex-1">{children}</span>
                        <a
                          href={`#${id}`}
                          className="opacity-0 transition-opacity text-textMuted group-hover:opacity-100 hover:text-primary"
                          aria-label="Copy section link"
                        >
                          <Link2 size={16} />
                        </a>
                      </h3>
                    );
                  },
                  p: ({ children, ...props }: any) => (
                    <p className="mb-6 leading-8 text-[1.06rem] text-textMuted" {...props}>
                      {children}
                    </p>
                  ),
                  a: ({ href, children, ...props }: any) => {
                    const isExternal = !!href && /^https?:\/\//i.test(href);
                    return (
                      <a
                        href={href}
                        {...props}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                      >
                        {children}
                      </a>
                    );
                  },
                  ul: ({ children, ...props }: any) => (
                    <ul className="my-6 list-disc space-y-3 pl-6 marker:text-primary" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: any) => (
                    <ol className="my-6 list-decimal space-y-3 pl-6 marker:font-bold marker:text-primary" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }: any) => (
                    <li className="pl-1 text-textMuted" {...props}>
                      {children}
                    </li>
                  ),
                  blockquote: ({ children, ...props }: any) => (
                    <blockquote
                      className="my-8 rounded-2xl border-l-4 border-primary bg-surfaceHigh/40 px-6 py-5 text-[1.05rem] italic text-text"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  table: ({ children, ...props }: any) => (
                    <div className="my-8 overflow-x-auto rounded-2xl border border-outline/10">
                      <table className="w-full border-collapse bg-surface/30 text-sm" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }: any) => (
                    <thead className="bg-surfaceHigh/60" {...props}>
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }: any) => (
                    <th className="border-b border-outline/10 px-4 py-3 text-left font-black uppercase tracking-wide text-xs text-text" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }: any) => (
                    <td className="border-b border-outline/5 px-4 py-3 align-top text-textMuted" {...props}>
                      {children}
                    </td>
                  ),
                  img: ({ alt, ...props }: any) => (
                    <img
                      alt={alt || 'Blog media'}
                      loading="lazy"
                      className="my-10 w-full rounded-[2rem] border border-outline/10 shadow-2xl"
                      {...props}
                    />
                  ),
                  hr: (props: any) => <hr className="my-12 border-outline/10" {...props} />,
                  code: ({ className, children, ...props }: any) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.9em] text-primary" {...props}>
                          {children}
                        </code>
                      );
                    }

                    const language = className.replace('language-', '') || 'text';
                    return (
                      <code className={`${className} block text-sm leading-6`} data-language={language} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }: any) => (
                    <div className="my-8 overflow-hidden rounded-2xl border border-outline/20 bg-white dark:bg-[#0d1117] shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted">Code</span>
                        <button
                          type="button"
                          onClick={() => {
                            const codeElement = Array.isArray(children) ? children[0] : children;
                            const rawCode = React.isValidElement<any>(codeElement)
                              ? String(codeElement.props?.children ?? '').replace(/\n$/, '')
                              : String(children ?? '');
                            const codeClassName = React.isValidElement<any>(codeElement)
                              ? String(codeElement.props?.className ?? '')
                              : '';
                            const language = codeClassName.replace('language-', '') || 'text';
                            const key = `${language}:${rawCode.slice(0, 60)}`;
                            void handleCopyCode(key, rawCode);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-outline/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-textMuted hover:text-text hover:bg-surfaceHigh/40 transition-colors"
                        >
                          {(() => {
                            const codeElement = Array.isArray(children) ? children[0] : children;
                            const rawCode = React.isValidElement<any>(codeElement)
                              ? String(codeElement.props?.children ?? '').replace(/\n$/, '')
                              : String(children ?? '');
                            const codeClassName = React.isValidElement<any>(codeElement)
                              ? String(codeElement.props?.className ?? '')
                              : '';
                            const language = codeClassName.replace('language-', '') || 'text';
                            const key = `${language}:${rawCode.slice(0, 60)}`;
                            const copied = copiedCodeKey === key;

                            return copied ? (
                              <>
                                <Check size={12} />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                Copy
                              </>
                            );
                          })()}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-5 text-sm" {...props}>
                        {children}
                      </pre>
                    </div>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>

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
