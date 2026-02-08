import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  className = '',
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary dark:text-dark-text-secondary font-medium">
            Step {current} of {total}
          </span>
          <span className="text-text-tertiary dark:text-dark-text-tertiary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-background-tertiary dark:bg-dark-background-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
