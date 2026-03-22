import React from 'react';

/**
 * LoadingScreen Component
 * A premium, AAA-grade loading screen featuring the Presently logo
 * with sophisticated animations and Material Design 3 theming
 */
export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading' }) => {
  return (
    <div 
      className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden relative" 
      role="status" 
      aria-live="polite" 
      aria-label={message}
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-primaryContainer/5 rounded-full blur-3xl opacity-60"
          style={{ animation: 'float-slow 8s ease-in-out infinite' }}
        ></div>
        <div 
          className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-gradient-to-tl from-primary/6 to-primaryContainer/4 rounded-full blur-3xl opacity-50"
          style={{ animation: 'float-slow 10s ease-in-out infinite 2s' }}
        ></div>
        <div 
          className="absolute top-[45%] right-[25%] w-[300px] h-[300px] bg-gradient-to-br from-primaryContainer/4 to-primary/3 rounded-full blur-3xl opacity-40"
          style={{ animation: 'float-slow 12s ease-in-out infinite 4s' }}
        ></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo container with sophisticated animations */}
        <div className="relative">
          {/* Outer rotating glow ring */}
          <div 
            className="absolute -inset-8 rounded-full opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, transparent, var(--primary-container), transparent)',
              animation: 'rotate-slow 4s linear infinite',
              filter: 'blur(20px)',
            }}
          ></div>

          {/* Secondary pulse ring */}
          <div 
            className="absolute -inset-6 rounded-full border-2 border-primary/20"
            style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
          ></div>

          {/* Rotating accent dots */}
          <div className="absolute -inset-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 90}deg) translateY(-48px)`,
                  animation: 'orbit-dots 8s linear infinite',
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* Logo container with glass effect */}
          <div className="relative w-32 h-32 rounded-3xl glass-panel flex items-center justify-center border border-outline/10 editorial-shadow">
            {/* Shimmer overlay */}
            <div 
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{ animation: 'shimmer-wave 3s ease-in-out infinite' }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                style={{ 
                  animation: 'shimmer-slide 3s ease-in-out infinite',
                  transform: 'translateX(-100%) skewX(-15deg)',
                }}
              ></div>
            </div>

            {/* Logo image */}
            <img 
              src="/logo.png" 
              alt="Presently Logo" 
              className="w-20 h-20 object-contain relative z-10"
              style={{ animation: 'logo-breathe 3s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4">
          <h2 className="font-headline text-3xl font-bold text-text tracking-tight">
            Presently
          </h2>

          {/* Loading message with animated dots */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-textMuted text-base font-medium">{message}</p>
            <div className="flex gap-1.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <span 
                  key={i}
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                  style={{ animation: `bounce-dot 1.4s ease-in-out infinite ${delay}s` }}
                ></span>
              ))}
            </div>
          </div>

          {/* Subtext */}
          <p className="text-sm text-textMuted/80 font-medium tracking-wider">
            Please wait...
          </p>
        </div>

        {/* Premium progress bar */}
        <div className="w-48 h-1.5 bg-surfaceHigh rounded-full overflow-hidden relative shadow-inner">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
            style={{ animation: 'progress-shine 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          />
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.15; }
        }

        @keyframes orbit-dots {
          0% { transform: rotate(0deg) translateY(-48px); opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { transform: rotate(360deg) translateY(-48px); opacity: 0.4; }
        }

        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.05); opacity: 1; }
        }

        @keyframes shimmer-slide {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }

        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }

        @keyframes progress-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
