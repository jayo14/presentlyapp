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
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-transparent bg-[#00FF94] text-[#0D1117]'
          : 'border-zinc-700 text-zinc-300 hover:border-[#00FF94] hover:text-[#00FF94]',
      ].join(' ')}
    >
      #{tag.name}
    </Link>
  );
};
