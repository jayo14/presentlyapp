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

  const colors = ['#FFD700', '#B8860B', '#DAA520', '#228B22', '#32CD32'];

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
