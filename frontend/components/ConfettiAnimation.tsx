import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

interface ConfettiAnimationProps {
  active?: boolean;
  duration?: number;
  count?: number;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  active = true,
  duration = 3000,
  count = 30,
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(active);

  // Theme-aware confetti colors - gold tones for brand identity and green for success
  const colors = [
    'rgb(184, 134, 11)',   // primary - Dark Goldenrod
    'rgb(255, 215, 0)',    // Gold
    'rgb(218, 165, 32)',   // Goldenrod
    'rgb(34, 139, 34)',    // Forest Green (success)
    'rgb(50, 205, 50)',    // Lime Green (success-light)
  ];

  useEffect(() => {
    if (active) {
      setIsActive(true);
      const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 10 + 5,
      }));
      setConfetti(pieces);

      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, count]); // Added duration and count to dependencies

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${duration / 1000}s`,
          }}
        />
      ))}
    </div>
  );
};
