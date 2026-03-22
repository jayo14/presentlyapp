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
          className="h-auto max-h-[420px] w-full rounded-2xl object-cover"
        />
      )}

      <div className="space-y-4">
        {post.category?.name && (
          <span className="inline-flex rounded-full border border-[#00FF94]/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00FF94]">
            {post.category.name}
          </span>
        )}

        <h1 className="font-headline text-4xl font-extrabold leading-tight text-white md:text-5xl">
          {post.title}
        </h1>
        <p className="max-w-3xl text-lg text-zinc-300">{post.excerpt}</p>

        <div className="flex items-center gap-3 text-sm text-zinc-400">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt={post.author_name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-white">
              {post.author_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="text-zinc-100">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_time} min read</span>
        </div>
      </div>
    </header>
  );
};
