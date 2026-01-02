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
  const baseClasses = 'bg-zinc-800/50';
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
  <div className={`p-6 bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
    <Skeleton variant="rectangular" height="200px" className="mb-4" />
    <Skeleton variant="text" width="60%" className="mb-2" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="text" width="300px" />
      </div>
      <Skeleton variant="rectangular" width="120px" height="40px" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i} />
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="300px" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="rectangular" height="300px" />
      </div>
    </div>
  </div>
);

export default Skeleton;
