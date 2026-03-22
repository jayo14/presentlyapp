import React, { useEffect, useState } from 'react';

import { getRelatedPosts } from '../../src/lib/blog';
import type { Post } from '../../src/types/blog';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  currentSlug: string;
  tags: string[];
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentSlug, tags }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let mounted = true;
    getRelatedPosts(currentSlug, tags).then((items) => {
      if (mounted) setPosts(items);
    });
    return () => {
      mounted = false;
    };
  }, [currentSlug, tags]);

  if (!posts.length) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
};
