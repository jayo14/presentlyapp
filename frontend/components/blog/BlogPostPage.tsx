import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { JsonLd } from '../seo/JsonLd';
import { SITE_URL } from '../seo/seoConfig';
import { blogPostBySlug } from '../../data/blogPosts';

export const BlogPostPage: React.FC = () => {
  const { slug = '' } = useParams();
  const post = blogPostBySlug[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-text px-6 py-16">
        <SEO title="Blog Post Not Found" description="Requested article could not be found." canonicalPath="/blog" noIndex />
        <h1 className="font-headline text-3xl font-bold mb-4">Article Not Found</h1>
        <Link className="text-primary underline" to="/blog">Back to Blog</Link>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Presently',
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: Article metadata per post. */}
      <SEO
        title={post.title}
        description={post.description}
        type="article"
        canonicalPath={`/blog/${post.slug}`}
      />
      {/* SEO: Article JSON-LD for rich snippets. */}
      <JsonLd schema={articleSchema} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs text-textMuted mb-3">Published {post.datePublished} • {post.author}</p>
        <h1 className="font-headline text-4xl font-bold mb-6">{post.title}</h1>
        <p className="text-lg text-textMuted leading-relaxed">{post.content}</p>
      </main>
    </div>
  );
};
