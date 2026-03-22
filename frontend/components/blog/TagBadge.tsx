import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { Tag } from '../../src/types/blog';

interface TagBadgeProps {
  tag: Tag;
  active?: boolean;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, active = false }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('tag', tag.slug);
  const target = `/blog?${params.toString()}`;

  return (
    <Link
      to={target}
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
        active
          ? 'border-primary bg-primary text-on-primary-fixed shadow-lg shadow-primary/20'
          : 'border-outline/20 text-textMuted hover:border-primary/50 hover:text-primary hover:bg-primary/5',
      ].join(' ')}
    >
      {tag.name}
    </Link>
  );
};
