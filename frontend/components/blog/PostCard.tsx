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
    <article className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] border border-outline/10 bg-surface/30 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-surface/60 hover:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.15)]">
      {/* Glossy Overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
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
            <span className="absolute left-6 top-6 rounded-xl bg-primary/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-transform duration-500 group-hover:scale-105">
              {post.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-grow space-y-6 p-8">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-headline text-2xl font-black leading-tight text-text tracking-tight transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h3>
        </Link>

        <p className="line-clamp-3 text-base text-textMuted leading-relaxed flex-grow">{post.excerpt}</p>

        <div className="flex items-center gap-4 pt-6 border-t border-outline/10 text-xs text-textMuted mt-auto">
          {post.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name}
              className="h-9 w-9 rounded-full object-cover border border-outline/20 group-hover:border-primary/40 transition-colors duration-500"
              loading="lazy"
            />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surfaceHigh text-text font-black border border-outline/20 group-hover:border-primary/40 transition-colors duration-500">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col">
            <span className="text-text font-bold text-sm tracking-tight">{post.author_name}</span>
            <div className="flex items-center gap-2 opacity-60 font-medium">
              <span>{formatDate(post.published_at)}</span>
              <span className="block h-1 w-1 rounded-full bg-textMuted/40" />
              <span>{post.reading_time} min read</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
