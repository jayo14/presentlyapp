import React from 'react';
import { Link } from 'react-router-dom';

import type { Post } from '../../src/types/blog';

interface PostCardProps {
  post: Post;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <article className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] border border-outline/10 bg-surface/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/20 hover:bg-surface/80 hover:shadow-[0_24px_50px_-12px_rgba(var(--primary-rgb),0.15)]">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="relative h-56 w-full overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surfaceHigh to-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          {post.category?.name && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-primary-fixed shadow-lg">
              {post.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-grow space-y-4 p-6 sm:p-8">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-headline text-2xl font-bold leading-tight text-text transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h3>
        </Link>

        <p className="line-clamp-3 text-sm text-textMuted leading-relaxed flex-grow">{post.excerpt}</p>

        <div className="flex items-center gap-3 pt-4 border-t border-outline/10 text-xs text-textMuted">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="h-7 w-7 rounded-full object-cover border border-outline/20"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surfaceHigh text-xs font-medium text-text border border-outline/20">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col">
            <span className="text-text font-medium">{post.author_name}</span>
            <span className="flex items-center gap-1.5 opacity-80">
              <span>{formatDate(post.published_at)}</span>
              <span>·</span>
              <span>{post.reading_time} min read</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
