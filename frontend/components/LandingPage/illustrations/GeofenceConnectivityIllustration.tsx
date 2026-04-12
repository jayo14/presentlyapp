import React from 'react';

interface GeofenceConnectivityProps {
  className?: string;
  style?: React.CSSProperties;
}

export const GeofenceConnectivityIllustration: React.FC<GeofenceConnectivityProps> = ({
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
        <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="glowCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="darkShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Dark background */}
      <rect width="400" height="400" fill="url(#mapGradient)" />

      {/* Subtle campus grid */}
      <g stroke="#1e40af" strokeWidth="0.5" opacity="0.2">
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={50 + i * 45}
            y1="80"
            x2={50 + i * 45}
            y2="320"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="50"
            y1={80 + i * 40}
            x2="350"
            y2={80 + i * 40}
          />
        ))}
      </g>

      {/* Campus buildings as simplified shapes */}
      {[
        { x: 80, y: 120, w: 50, h: 40 },
        { x: 200, y: 100, w: 60, h: 45 },
        { x: 280, y: 140, w: 45, h: 50 },
        { x: 100, y: 240, w: 55, h: 35 },
        { x: 230, y: 260, w: 50, h: 40 },
      ].map((building, i) => (
        <g key={`building-${i}`}>
          <rect
            x={building.x}
            y={building.y}
            width={building.w}
            height={building.h}
            fill="#0369a1"
            opacity="0.3"
            rx="4"
            filter="url(#darkShadow)"
          />
          <rect
            x={building.x}
            y={building.y}
            width={building.w}
            height={building.h}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            opacity="0.6"
            rx="4"
          />
        </g>
      ))}

      {/* Central geofence area */}
      <circle cx="200" cy="200" r="80" fill="url(#glowCenter)" />

      {/* Geofence boundary - main animated ring */}
      <circle
        cx="200"
        cy="200"
        r="80"
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        opacity="0.9"
        filter="url(#neonGlow)"
        style={{
          animation: 'pulse 2s ease-in-out infinite',
          strokeDasharray: '502',
          strokeDashoffset: 0,
        }}
      />

      {/* Secondary geofence ring */}
      <circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1.5"
        opacity="0.4"
        style={{
          animation: 'pulse 3s ease-in-out infinite 0.2s',
        }}
      />

      {/* Outer detection ring */}
      <circle
        cx="200"
        cy="200"
        r="120"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1"
        opacity="0.2"
        strokeDasharray="4,4"
      />

      {/* Active detection nodes inside geofence */}
      {[
        { x: 200, y: 140, label: 'Active' },
        { x: 240, y: 190, label: 'Verified' },
        { x: 200, y: 250, label: 'Present' },
        { x: 160, y: 190, label: 'Tracked' },
        { x: 200, y: 200, label: 'Hub' },
      ].map((node, i) => (
        <g key={`node-${i}`}>
          {/* Node halo */}
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill="#10b981"
            opacity="0.2"
            style={{
              animation: `pulse ${1.5 + i * 0.1}s ease-in-out infinite`,
            }}
          />
          {/* Node core */}
          <circle
            cx={node.x}
            cy={node.y}
            r="4"
            fill="#10b981"
            filter="url(#neonGlow)"
          />
        </g>
      ))}

      {/* Connection lines between nodes (subtle network) */}
      {[
        [200, 140, 240, 190],
        [240, 190, 200, 250],
        [200, 250, 160, 190],
        [160, 190, 200, 140],
        [200, 140, 200, 200],
        [200, 200, 240, 190],
        [200, 200, 160, 190],
        [200, 200, 200, 250],
      ].map((line, i) => (
        <line
          key={`connection-${i}`}
          x1={line[0]}
          y1={line[1]}
          x2={line[2]}
          y2={line[3]}
          stroke="#10b981"
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}

      {/* Data packets moving around geofence */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * 90 * Math.PI) / 180;
        const x = 200 + 90 * Math.cos(angle);
        const y = 200 + 90 * Math.sin(angle);
        return (
          <g key={`packet-${i}`} filter="url(#neonGlow)">
            <circle
              cx={x}
              cy={y}
              r="3"
              fill="#ec4899"
              opacity="0.8"
              style={{
                animation: `float ${4 + i * 0.3}s linear infinite`,
              }}
            />
          </g>
        );
      })}

      {/* Real-time indicator */}
      <g filter="url(#neonGlow)">
        <circle cx="350" cy="50" r="6" fill="#ec4899" />
        <circle
          cx="350"
          cy="50"
          r="8"
          fill="none"
          stroke="#ec4899"
          strokeWidth="1"
          opacity="0.5"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </g>

      {/* Label backgrounds with subtle styling */}
      <rect x="20" y="30" width="100" height="24" fill="#0f172a" opacity="0.8" rx="4" />
      <text
        x="30"
        y="48"
        fontSize="12"
        fontWeight="600"
        fill="#10b981"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Real-time Campus Map
      </text>

      <rect x="20" y="350" width="120" height="24" fill="#0f172a" opacity="0.8" rx="4" />
      <text
        x="30"
        y="368"
        fontSize="11"
        fontWeight="500"
        fill="#06b6d4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ✓ Geofence Active
      </text>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            r: 8;
          }
          50% {
            opacity: 0.9;
            r: 12;
          }
        }

        @keyframes float {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(0, -160px);
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
};
