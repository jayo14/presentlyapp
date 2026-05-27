import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '../../../components/SEO';

interface DashboardPageProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  seoTitle?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  title,
  description,
  children,
  action,
  seoTitle
}) => {
  return (
    <div className="flex flex-col gap-12 md:gap-24 lg:gap-32">
      {seoTitle && <SEO title={seoTitle} />}
      {(title || description || action) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 lg:gap-16">
          <div className="space-y-4">
            {title && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface font-display leading-[1.1]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base md:text-lg lg:text-xl text-on-surface-variant font-medium opacity-70 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 md:mb-2">
              {action}
            </div>
          )}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
