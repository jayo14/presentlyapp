import React from 'react';

/**
 * ResponsiveContainer - A wrapper component that handles mobile/desktop layout separation
 * 
 * This component ensures that:
 * 1. Desktop layouts remain unchanged (md breakpoint and above)
 * 2. Mobile layouts are completely separate and don't interfere with desktop
 * 3. No style leakage between mobile and desktop views
 */

interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobileChildren?: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  mobileChildren,
  className = '',
  mobileClassName = '',
  desktopClassName = ''
}) => {
  // If separate mobile children provided, render both with breakpoint visibility
  if (mobileChildren) {
    return (
      <>
        {/* Mobile View - Hidden on md and above */}
        <div className={`md:hidden ${mobileClassName} ${className}`}>
          {mobileChildren}
        </div>
        
        {/* Desktop View - Hidden below md */}
        <div className={`hidden md:block ${desktopClassName} ${className}`}>
          {children}
        </div>
      </>
    );
  }
  
  // If no separate mobile children, render single component with combined classes
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * MobileOnly - Component that only renders on mobile (below md breakpoint)
 */
export const MobileOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`md:hidden ${className}`}>
    {children}
  </div>
);

/**
 * DesktopOnly - Component that only renders on desktop (md breakpoint and above)
 */
export const DesktopOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`hidden md:block ${className}`}>
    {children}
  </div>
);
