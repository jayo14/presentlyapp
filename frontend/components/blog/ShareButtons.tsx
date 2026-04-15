import React from 'react';
import { Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';

interface ShareButtonsProps {
  slug: string;
  title: string;
  vertical?: boolean;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ slug, title, vertical = false }) => {
  const url = `https://getpresently.com.ng/blog/${slug}`;
  
  const shareLinks = [
    {
      name: 'Twitter',
      icon: <Twitter size={18} />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10',
    },
    {
      name: 'Facebook',
      icon: <Facebook size={18} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10',
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    // You could add a toast here
  };

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row items-center flex-wrap'} gap-2 sm:gap-3`}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.name}`}
          title={`Share on ${link.name}`}
          className={`group flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-outline/10 bg-surface/40 backdrop-blur-sm transition-all duration-300 ${link.color} shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label="Copy link to clipboard"
        title="Copy link to clipboard"
        className="group flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-outline/10 bg-surface/40 backdrop-blur-sm transition-all duration-300 hover:text-primary hover:bg-primary/10 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LinkIcon size={18} />
      </button>
    </div>
  );
};
