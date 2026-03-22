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
    <section className="mt-14">
      <h2 className="font-headline text-2xl font-bold text-white">Related posts</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};
