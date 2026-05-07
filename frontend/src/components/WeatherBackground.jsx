import { useEffect, useRef } from 'react';

export default function WeatherBackground() {
  return (
    <div className="weather-bg-2d">
      <svg
        className="bg-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0b1a3b', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0d2a5e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#112244', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="moonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4FC3F7', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#B3E5FC', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="hill1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0a3060' }} />
            <stop offset="100%" style={{ stopColor: '#071a35' }} />
          </linearGradient>
          <linearGradient id="hill2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#071a35' }} />
            <stop offset="100%" style={{ stopColor: '#040e1d' }} />
          </linearGradient>
          <radialGradient id="glowCircle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#4FC3F7', stopOpacity: 0.25 }} />
            <stop offset="100%" style={{ stopColor: '#4FC3F7', stopOpacity: 0 }} />
          </radialGradient>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Sky background */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Stars */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = (i * 197 + 37) % 1440;
          const y = (i * 113 + 53) % 500;
          const r = i % 3 === 0 ? 1.5 : 1;
          const delay = (i * 0.3) % 4;
          return (
            <circle key={i} cx={x} cy={y} r={r} fill="white" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur={`${2 + delay}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Moon glow */}
        <circle cx="1200" cy="120" r="100" fill="url(#glowCircle)" filter="url(#blur4)" />

        {/* Moon */}
        <circle cx="1200" cy="120" r="48" fill="url(#moonGlow)" opacity="0.9" />
        <circle cx="1220" cy="105" r="36" fill="#0d2a5e" />
        {/* Moon craters */}
        <circle cx="1190" cy="130" r="5" fill="rgba(0,0,0,0.15)" />
        <circle cx="1205" cy="118" r="3" fill="rgba(0,0,0,0.1)" />

        {/* Big cloud 1 - slow drift */}
        <g className="cloud-drift-1" opacity="0.85">
          <ellipse cx="200" cy="180" rx="90" ry="40" fill="#1e3a6e" />
          <ellipse cx="255" cy="160" rx="65" ry="45" fill="#1e3a6e" />
          <ellipse cx="145" cy="175" rx="55" ry="35" fill="#1e3a6e" />
          <ellipse cx="310" cy="175" rx="50" ry="33" fill="#1e3a6e" />
          {/* Cloud highlight */}
          <ellipse cx="240" cy="152" rx="40" ry="15" fill="#2a4a80" opacity="0.7" />
        </g>

        {/* Big cloud 2 */}
        <g className="cloud-drift-2" opacity="0.7">
          <ellipse cx="900" cy="130" rx="110" ry="45" fill="#162d5e" />
          <ellipse cx="965" cy="108" rx="75" ry="52" fill="#162d5e" />
          <ellipse cx="840" cy="128" rx="60" ry="38" fill="#162d5e" />
          <ellipse cx="1020" cy="125" rx="55" ry="35" fill="#162d5e" />
          <ellipse cx="950" cy="100" rx="45" ry="18" fill="#1e3a6e" opacity="0.7" />
        </g>

        {/* Small cloud 3 */}
        <g className="cloud-drift-3" opacity="0.6">
          <ellipse cx="550" cy="90" rx="70" ry="30" fill="#1a3260" />
          <ellipse cx="595" cy="72" rx="48" ry="35" fill="#1a3260" />
          <ellipse cx="510" cy="88" rx="42" ry="26" fill="#1a3260" />
          <ellipse cx="635" cy="85" rx="38" ry="24" fill="#1a3260" />
        </g>

        {/* Rain drops */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i * 53 + 20) % 1440;
          const duration = 1 + (i % 5) * 0.4;
          const delay = (i * 0.2) % 3;
          return (
            <line
              key={`rain-${i}`}
              x1={x} y1="0" x2={x - 4} y2="18"
              stroke="#4FC3F7"
              strokeWidth="1.5"
              opacity="0.3"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 -20"
                to="0 920"
                dur={`${duration}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="0;0.3;0.3;0" dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" />
            </line>
          );
        })}

        {/* Aurora / light beams */}
        <g opacity="0.12">
          <path d="M0,400 Q360,200 720,350 Q1080,500 1440,300 L1440,900 L0,900 Z" fill="#4FC3F7" />
        </g>
        <g opacity="0.07">
          <path d="M0,500 Q400,350 800,420 Q1100,480 1440,380 L1440,900 L0,900 Z" fill="#00BCD4" />
        </g>

        {/* Far hill */}
        <path
          d="M0,700 Q180,580 360,640 Q540,700 720,620 Q900,540 1080,610 Q1260,680 1440,640 L1440,900 L0,900 Z"
          fill="url(#hill1Grad)"
        />

        {/* Near hill */}
        <path
          d="M0,800 Q200,720 400,760 Q600,800 800,740 Q1000,680 1200,730 Q1350,760 1440,750 L1440,900 L0,900 Z"
          fill="url(#hill2Grad)"
        />

        {/* City silhouette */}
        <g fill="#071220" opacity="0.9">
          <rect x="60" y="720" width="30" height="80" />
          <rect x="55" y="715" width="40" height="10" />
          <rect x="100" y="700" width="25" height="100" />
          <rect x="95" y="695" width="35" height="10" />
          <rect x="130" y="730" width="35" height="70" />
          <rect x="170" y="710" width="20" height="90" />
          <rect x="165" y="705" width="30" height="10" />

          <rect x="300" y="690" width="40" height="110" />
          <rect x="295" y="685" width="50" height="10" />
          <rect x="345" y="715" width="28" height="85" />
          <rect x="378" y="700" width="22" height="100" />

          <rect x="500" y="680" width="45" height="120" />
          <rect x="495" y="673" width="55" height="12" />
          <rect x="550" y="700" width="30" height="100" />
          <rect x="585" y="720" width="25" height="80" />

          <rect x="1100" y="695" width="38" height="105" />
          <rect x="1095" y="688" width="48" height="12" />
          <rect x="1143" y="710" width="28" height="90" />
          <rect x="1175" y="700" width="32" height="100" />
          <rect x="1210" y="725" width="22" height="75" />
          <rect x="1280" y="705" width="35" height="95" />
          <rect x="1320" y="720" width="28" height="80" />
          <rect x="1355" y="710" width="40" height="90" />

          {/* Windows glow */}
          {Array.from({ length: 40 }).map((_, i) => {
            const wx = 60 + (i * 37) % 1300;
            const wy = 700 + (i * 17) % 100;
            const on = i % 3 !== 0;
            return on ? (
              <rect key={`w${i}`} x={wx} y={wy} width="5" height="7" fill="#4FC3F7" opacity="0.5" />
            ) : null;
          })}
        </g>

        {/* Ground glow */}
        <ellipse cx="720" cy="900" rx="800" ry="80" fill="#4FC3F7" opacity="0.04" />
      </svg>
    </div>
  );
}
