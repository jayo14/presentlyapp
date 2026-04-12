import React from 'react';

interface PresentlyIllustrationProps {
  className?: string;
  style?: React.CSSProperties;
}

export const PresentlyIllustration: React.FC<PresentlyIllustrationProps> = ({
  className = '',
  style = {},
}) => {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background gradient circle */}
      <circle cx="200" cy="180" r="140" fill="url(#glowGradient)" opacity="0.3" />

      {/* Isometric building - left face */}
      <path
        d="M 120 200 L 120 100 L 180 60 L 180 160 Z"
        fill="#4f46e5"
        opacity="0.7"
        filter="url(#softShadow)"
      />

      {/* Isometric building - right face */}
      <path
        d="M 180 160 L 180 60 L 280 100 L 280 200 Z"
        fill="url(#buildingGradient)"
        filter="url(#softShadow)"
      />

      {/* Isometric building - top face */}
      <path
        d="M 120 100 L 180 60 L 280 100 L 220 140 Z"
        fill="#818cf8"
        opacity="0.8"
        filter="url(#softShadow)"
      />

      {/* Windows on left face */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`left-${row}-${col}`}
            x={125 + col * 16}
            y={110 + row * 20}
            width="12"
            height="12"
            fill="url(#windowGradient)"
            opacity="0.7"
          />
        ))
      )}

      {/* Windows on right face */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`right-${row}-${col}`}
            x={195 + col * 16}
            y={90 + row * 20}
            width="12"
            height="12"
            fill="url(#windowGradient)"
            opacity="0.7"
          />
        ))
      )}

      {/* Geofence circles - animated */}
      {[1, 2, 3].map((i) => (
        <circle
          key={`geofence-${i}`}
          cx="200"
          cy="200"
          r={80 + i * 30}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          opacity={0.6 - i * 0.15}
          style={{
            animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Left student */}
      <g filter="url(#softShadow)">
        {/* Head */}
        <circle cx="90" cy="240" r="8" fill="#d97706" />
        {/* Body */}
        <rect x="86" y="250" width="8" height="16" fill="#3b82f6" rx="2" />
        {/* Legs */}
        <line x1="89" y1="266" x2="85" y2="280" stroke="#1f2937" strokeWidth="2" />
        <line x1="89" y1="266" x2="93" y2="280" stroke="#1f2937" strokeWidth="2" />
        {/* Phone */}
        <rect x="65" y="255" width="8" height="14" fill="#1f2937" rx="1" />
        <rect x="66" y="256" width="6" height="10" fill="#fbbf24" rx="0.5" />
      </g>

      {/* Right student */}
      <g filter="url(#softShadow)">
        {/* Head */}
        <circle cx="310" cy="245" r="8" fill="#d97706" />
        {/* Body */}
        <rect x="306" y="255" width="8" height="16" fill="#8b5cf6" rx="2" />
        {/* Legs */}
        <line x1="309" y1="271" x2="305" y2="285" stroke="#1f2937" strokeWidth="2" />
        <line x1="309" y1="271" x2="313" y2="285" stroke="#1f2937" strokeWidth="2" />
        {/* Phone */}
        <rect x="315" y="260" width="8" height="14" fill="#1f2937" rx="1" />
        <rect x="316" y="261" width="6" height="10" fill="#fbbf24" rx="0.5" />
      </g>

      {/* Check mark badge - floating above */}
      <g filter="url(#glow)">
        <circle cx="200" cy="50" r="16" fill="#10b981" />
        <path
          d="M 194 50 L 198 54 L 206 46"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Wi-Fi waves */}
      <g opacity="0.6" style={{ animation: 'fadeInOut 2s ease-in-out infinite' }}>
        <path
          d="M 200 180 Q 210 170 220 180"
          stroke="#06b6d4"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 200 175 Q 215 160 230 175"
          stroke="#06b6d4"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 180 180 Q 190 170 200 180"
          stroke="#06b6d4"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 170 175 Q 185 160 200 175"
          stroke="#06b6d4"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      {/* Digital signals - small dots */}
      {[
        { cx: 150, cy: 120 },
        { cx: 250, cy: 140 },
        { cx: 180, cy: 280 },
        { cx: 280, cy: 220 },
      ].map((dot, i) => (
        <g key={`signal-${i}`}>
          <circle
            cx={dot.cx}
            cy={dot.cy}
            r="3"
            fill="#ec4899"
            opacity="0.8"
            style={{
              animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
            }}
          />
          <circle
            cx={dot.cx}
            cy={dot.cy}
            r="6"
            fill="none"
            stroke="#ec4899"
            strokeWidth="1"
            opacity="0.3"
            style={{
              animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
            }}
          />
        </g>
      ))}

      {/* Ground line */}
      <line x1="60" y1="290" x2="340" y2="290" stroke="#e5e7eb" strokeWidth="1.5" />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </svg>
  );
};

export default PresentlyIllustration;
