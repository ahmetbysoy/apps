import React from 'react';

// Seeded random generator
const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// String hash for seeding
const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

interface RoosterAvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export const RoosterAvatar: React.FC<RoosterAvatarProps> = ({ seed, size = 120, className = "" }) => {
  const seedParts = cyrb128(seed);
  const rand = mulberry32(seedParts[0]);

  // Cyberpunk Color Palettes
  const palettes = [
    ['#ff00ff', '#00ffff', '#1a1a1a'], // Neon Pink/Cyan
    ['#ffff00', '#ff0000', '#2a2a2a'], // Yellow/Red
    ['#00ff00', '#003300', '#0a0a0a'], // Matrix Green
    ['#ff9900', '#3300cc', '#111111'], // Orange/Blue
    ['#ffffff', '#000000', '#444444'], // Monochrome
    ['#9d00ff', '#00ff99', '#120024'], // Purple/Mint
  ];

  const paletteIndex = Math.floor(rand() * palettes.length);
  const colors = palettes[paletteIndex];
  const primary = colors[0];
  const secondary = colors[1];
  const dark = colors[2];

  // Body variations
  const bodyScale = 0.8 + rand() * 0.4;
  const tailLength = 20 + rand() * 40;
  const eyeGlow = rand() > 0.5;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Aura */}
        <circle cx="50" cy="50" r="45" fill={dark} stroke={secondary} strokeWidth="1" strokeOpacity="0.5" />
        
        {/* Tail Feathers */}
        <path 
          d={`M20,60 Q5,${60-tailLength} 25,50 Q10,${50-tailLength} 30,40`} 
          fill="none" 
          stroke={primary} 
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <path 
          d={`M25,65 Q15,${65-tailLength*0.8} 30,55`} 
          fill="none" 
          stroke={secondary} 
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Body */}
        <ellipse cx="50" cy="60" rx={25 * bodyScale} ry={20} fill={dark} stroke={primary} strokeWidth="2" />
        
        {/* Metal Wing */}
        <path 
          d="M40,60 Q50,75 65,55 L60,50 Z" 
          fill="#333" 
          stroke={secondary} 
          strokeWidth="2" 
        />
        <circle cx="55" cy="60" r="2" fill={primary} filter="url(#glow)" />

        {/* Neck */}
        <path d="M50,60 Q55,40 50,30" fill="none" stroke={primary} strokeWidth="4" strokeLinecap="round" />

        {/* Head */}
        <circle cx="50" cy="30" r="12" fill={dark} stroke={primary} strokeWidth="2" />

        {/* Eye */}
        <circle cx="52" cy="28" r="3" fill={secondary} filter={eyeGlow ? "url(#glow)" : ""} />
        <circle cx="52" cy="28" r="1" fill="#fff" />

        {/* Cyber Beak */}
        <path d="M60,30 L72,33 L60,36 Z" fill="#cccc00" stroke={primary} strokeWidth="1" />

        {/* Comb (Mohawk style) */}
        <path 
          d={`M40,25 L45,15 L50,22 L55,12 L60,25 Z`} 
          fill={secondary} 
          stroke={primary} 
          strokeWidth="1" 
          filter="url(#glow)"
          opacity="0.9"
        />
        
        {/* Legs */}
        <line x1="45" y1="75" x2="40" y2="90" stroke="#666" strokeWidth="2" />
        <line x1="55" y1="75" x2="60" y2="90" stroke="#666" strokeWidth="2" />
        
        {/* Feet claws */}
        <path d="M40,90 L35,95 M40,90 L45,95" stroke="#666" strokeWidth="2" />
        <path d="M60,90 L55,95 M60,90 L65,95" stroke="#666" strokeWidth="2" />

      </svg>
    </div>
  );
};
