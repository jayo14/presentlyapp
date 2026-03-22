import React, { useEffect, useMemo, useState } from 'react';

import { extractHeadings } from '../../src/lib/mdx';

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <div className="rounded-2xl border border-outline/10 bg-surface/40 backdrop-blur-md p-6">
      <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-textMuted mb-6">In this article</h3>
      <ul className="space-y-4">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}>
            <a
              href={`#${heading.id}`}
              className={[
                'block text-sm transition-all duration-300 relative',
                activeId === heading.id 
                  ? 'text-primary font-bold translate-x-1' 
                  : 'text-textMuted hover:text-text hover:translate-x-1',
              ].join(' ')}
            >
              {activeId === heading.id && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/40" />
              )}
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
