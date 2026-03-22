import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SEO } from '../SEO';
import { blogPosts } from '../../data/blogPosts';

const PAGE_SIZE = 10;

export const BlogListPage: React.FC = () => {
  const { page } = useParams();
  const pageNumber = Number(page || '1');
  const safePage = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  const start = (safePage - 1) * PAGE_SIZE;
  const visiblePosts = blogPosts.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background text-text">
      {/* SEO: Canonical for paginated blog list points to first page. */}
      <SEO
        title="Blog"
        description="Insights on GPS attendance, academic compliance, and university operations in Nigeria."
        canonicalPath="/blog"
      />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-headline text-4xl font-bold mb-8">Presently Blog</h1>
        <div className="space-y-6">
          {visiblePosts.map((post) => (
            <article key={post.slug} className="p-6 rounded-2xl border border-outline bg-surface">
              <h2 className="font-headline text-2xl font-semibold mb-2">
                <Link className="hover:text-primary" to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-textMuted mb-3">{post.description}</p>
              <p className="text-xs text-textMuted">Published {post.datePublished}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
