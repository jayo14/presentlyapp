import React from 'react';
import { MapPin, Activity } from 'lucide-react';

/**
 * LoadingScreen Component
 * A branded loading screen with smooth animations that resonates with Presently's
 * geolocation and attendance tracking features
 */
export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center overflow-hidden" role="status" aria-live="polite" aria-label={message}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo/Icon Container */}
        <div className="relative w-24 h-24">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/30 animate-spin" style={{ animationDuration: '3s' }}></div>

          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full border border-primary/20 animate-pulse" style={{ animationDuration: '2s' }}></div>

          {/* Inner container with icon */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="relative">
              {/* Location icon */}
              <MapPin className="w-10 h-10 text-primary animate-bounce" style={{ animationDuration: '2s' }} />

              {/* Activity indicator dots around the icon */}
              <div className="absolute -inset-6 rounded-full">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      animation: `orbit 3s linear infinite`,
                      animationDelay: `${i * 1}s`,
                      transformOrigin: '20px 0',
                      transform: `rotate(${i * 120}deg) translateY(-20px)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Presently
          </h2>

          {/* Loading text with animated dots */}
          <div className="flex items-center justify-center gap-1">
            <p className="text-zinc-400 text-sm">{message}</p>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>

          {/* Subtext */}
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
            One moment...
          </p>
        </div>

        {/* Optional progress indicator */}
        <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full"
            style={{
              animation: `shimmer 2s infinite`,
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: rotate(360deg) translateY(-20px) rotate(-360deg);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
