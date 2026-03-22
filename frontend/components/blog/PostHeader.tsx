import React from 'react';

import type { Post } from '../../src/types/blog';

interface PostHeaderProps {
  post: Post;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
  return (
    <header className="mx-auto mb-10 max-w-4xl space-y-6">
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="h-auto max-h-[420px] w-full rounded-2xl object-cover shadow-2xl border border-outline/10"
        />
      )}

      <div className="space-y-6">
        {post.category?.name && (
          <span className="inline-flex rounded-full border border-primary/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/5">
            {post.category.name}
          </span>
        )}

        <h1 className="font-headline text-4xl font-black leading-tight text-text md:text-6xl tracking-tight">
          {post.title}
        </h1>
        <p className="max-w-3xl text-xl text-textMuted leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 py-6 border-y border-outline/10 text-sm text-textMuted">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt={post.author_name} className="h-10 w-10 rounded-full object-cover border border-outline/20" />
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surfaceHigh text-text font-bold border border-outline/20">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col">
            <span className="text-text font-bold text-base">{post.author_name}</span>
            <div className="flex items-center gap-2 opacity-80">
              <span>{formatDate(post.published_at)}</span>
              <span>·</span>
              <span>{post.reading_time} min read</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
