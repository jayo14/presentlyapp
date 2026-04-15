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
    <article className="group relative flex flex-col h-full overflow-hidden rounded-lg sm:rounded-2xl border border-outline/10 bg-surface/30 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-surface/60 hover:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.15)]">
      {/* Glossy Overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surfaceHigh to-surface relative">
               <div className="absolute inset-0 bg-primary/5 blur-3xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
          {post.category?.name && (
            <span className="absolute left-4 sm:left-6 top-4 sm:top-6 rounded-lg sm:rounded-xl bg-primary/90 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-background shadow-lg sm:shadow-xl shadow-primary/20 transition-transform duration-500 group-hover:scale-105">
              {post.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-grow space-y-4 sm:space-y-6 p-5 sm:p-8">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-headline text-xl sm:text-2xl font-black leading-tight text-text tracking-tight transition-colors duration-300 group-hover:text-primary line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="line-clamp-3 text-sm sm:text-base text-textMuted leading-relaxed flex-grow">{post.excerpt}</p>

        <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-outline/10 text-[11px] sm:text-xs text-textMuted mt-auto">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={`Avatar for ${post.author_name}, author`}
              className="h-8 sm:h-9 w-8 sm:w-9 rounded-full object-cover border border-outline/20 group-hover:border-primary/40 transition-colors duration-500 shrink-0"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-surfaceHigh text-text font-black border border-outline/20 group-hover:border-primary/40 transition-colors duration-500 text-xs shrink-0">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-text font-bold text-sm sm:text-xs tracking-tight truncate">{post.author_name}</span>
            <div className="flex items-center gap-1.5 opacity-60 font-medium text-[10px] sm:text-[11px]">
              <span className="truncate">{formatDate(post.published_at)}</span>
              <span className="hidden sm:block h-0.5 w-0.5 rounded-full bg-textMuted/40" />
              <span>{post.reading_time}m</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
