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
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#111826] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
          {post.category?.name && (
            <span className="absolute left-3 top-3 rounded-full bg-[#00FF94] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0D1117]">
              {post.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-headline text-xl font-bold leading-snug text-white transition-colors group-hover:text-[#00FF94]">
            {post.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-zinc-300">{post.excerpt}</p>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="h-5 w-5 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-white">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="text-zinc-200">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_time} min read</span>
        </div>
      </div>
    </article>
  );
};
