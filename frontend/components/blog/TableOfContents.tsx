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
    <aside className="sticky top-24 rounded-xl border border-zinc-800 bg-[#101827] p-4">
      <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-zinc-200">Table of contents</h3>
      <ul className="mt-3 space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={[
                'block text-sm transition-colors',
                heading.level === 3 ? 'pl-4' : 'pl-1',
                activeId === heading.id ? 'text-[#00FF94]' : 'text-zinc-400 hover:text-zinc-200',
              ].join(' ')}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
