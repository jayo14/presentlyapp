import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-surfaceHigh';
  const animationClass = animation === 'pulse' ? 'animate-pulse' : 'animate-shimmer';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
};

// Specific skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '70%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 bg-surface border border-outline rounded-xl ${className}`}>
    <Skeleton variant="rectangular" height="200px" className="mb-4" />
    <Skeleton variant="text" width="60%" className="mb-2" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonStudentDashboard: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
    {/* Header Skeleton */}
    <div className="flex md:hidden justify-between items-center px-2">
      <div className="space-y-2">
        <Skeleton variant="text" width="100px" height="12px" />
        <Skeleton variant="text" width="180px" height="32px" />
      </div>
      <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-2xl" />
    </div>

    {/* Hero Card Skeleton */}
    <div className="px-2">
      <Skeleton variant="rectangular" height="240px" className="rounded-[2.5rem]" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-2 gap-4 md:gap-6 px-2">
      <Skeleton variant="rectangular" height="180px" className="rounded-[2.5rem]" />
      <Skeleton variant="rectangular" height="180px" className="rounded-[2.5rem]" />
    </div>

    {/* Schedule Skeleton */}
    <div className="space-y-6 px-2">
      <div className="flex justify-between items-end px-2">
        <Skeleton variant="text" width="120px" height="12px" />
        <Skeleton variant="text" width="80px" height="12px" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rectangular" height="120px" className="rounded-[2.5rem]" />
        <Skeleton variant="rectangular" height="120px" className="rounded-[2.5rem]" />
      </div>
    </div>
  </div>
);

export const SkeletonCourseGrid: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
    <div className="px-2 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="rectangular" width="40px" height="40px" className="rounded-2xl" />
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="rectangular" width="40px" height="40px" className="rounded-2xl" />
      </div>
      <Skeleton variant="text" width="200px" height="48px" />
      <Skeleton variant="text" width="150px" />
    </div>
    
    <div className="px-2">
      <Skeleton variant="rectangular" height="64px" className="rounded-[1.5rem]" />
    </div>

    <div className="px-2 grid grid-cols-1 gap-4">
      {[1, 2, 3].map(i => (
        <Skeleton variant="rectangular" key={i} height="280px" className="rounded-[2.5rem]" />
      ))}
    </div>
  </div>
);

export default Skeleton;
