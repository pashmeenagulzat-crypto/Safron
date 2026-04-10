/**
 * Maps product image filenames to inline SVG illustrations.
 * If an image is not found, renders a generic placeholder.
 */
import React from 'react';

// Colour palettes per product category
const PALETTE: Record<string, { bg: string; primary: string; accent: string; secondary: string }> = {
  saffron:      { bg: '#fdf3e0', primary: '#c8962a', accent: '#e8b84b', secondary: '#8b4513' },
  honey:        { bg: '#fef9e7', primary: '#f39c12', accent: '#f7dc6f', secondary: '#d68910' },
  'dry-fruits': { bg: '#faf0e6', primary: '#a0522d', accent: '#deb887', secondary: '#8b4513' },
  herbs:        { bg: '#e8f5e9', primary: '#2e7d32', accent: '#81c784', secondary: '#1b5e20' },
  default:      { bg: '#fdf8f0', primary: '#c8962a', accent: '#e8b84b', secondary: '#7a3a0e' },
};

function getPalette(cat: string) {
  const k = Object.keys(PALETTE).find(k => cat.includes(k));
  return PALETTE[k ?? 'default'];
}

interface ProductImageProps {
  image: string;
  name: string;
  category?: string;
  className?: string;
  size?: number;
}

// Simple geometric product illustrations
function SaffronSVG({ p }: { p: ReturnType<typeof getPalette> }) {
  return (
    <>
      {/* saffron flower */}
      {[0,60,120,180,240,300].map(a => (
        <ellipse key={a} cx="100" cy="100" rx="12" ry="38" fill={p.accent} opacity="0.8"
          transform={`rotate(${a} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="20" fill={p.primary} />
      {/* stigmas */}
      {[-15,0,15].map(x => (
        <line key={x} x1={100+x} y1="75" x2={100+x} y2="55" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </>
  );
}

function HoneySVG({ p }: { p: ReturnType<typeof getPalette> }) {
  return (
    <>
      {/* jar body */}
      <rect x="60" y="80" width="80" height="80" rx="20" fill={p.primary} />
      <rect x="70" y="70" width="60" height="20" rx="8" fill={p.secondary} />
      {/* honey drip */}
      <path d="M90 160 Q90 185 80 195 Q90 190 100 195 Q110 190 120 195 Q110 185 110 160Z" fill={p.accent} />
      {/* shine */}
      <ellipse cx="82" cy="105" rx="8" ry="18" fill="white" opacity="0.3" transform="rotate(-20 82 105)" />
    </>
  );
}

function DriedFruitSVG({ p }: { p: ReturnType<typeof getPalette> }) {
  return (
    <>
      {/* cluster of nuts */}
      {[
        [85,90,18], [115,85,14], [95,115,16], [120,110,12], [75,115,13],
      ].map(([cx,cy,r],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r-2} fill={i%2===0?p.primary:p.accent} opacity="0.9" />
      ))}
      {/* leaf */}
      <path d="M110 70 Q125 55 140 65 Q125 80 110 70Z" fill="#66bb6a" opacity="0.8" />
    </>
  );
}

function HerbSVG({ p }: { p: ReturnType<typeof getPalette> }) {
  return (
    <>
      {/* stem */}
      <line x1="100" y1="160" x2="100" y2="60" stroke={p.secondary} strokeWidth="4" strokeLinecap="round" />
      {/* leaves */}
      {[80,100,120].map((y,i) => (
        <React.Fragment key={i}>
          <path d={`M100 ${y} Q75 ${y-20} 65 ${y-5} Q80 ${y+5} 100 ${y}Z`} fill={p.primary} opacity="0.85" />
          <path d={`M100 ${y} Q125 ${y-20} 135 ${y-5} Q120 ${y+5} 100 ${y}Z`} fill={p.accent} opacity="0.85" />
        </React.Fragment>
      ))}
      {/* flower */}
      {[0,72,144,216,288].map(a => (
        <ellipse key={a} cx="100" cy="55" rx="7" ry="12" fill={p.accent}
          transform={`rotate(${a} 100 55)`} />
      ))}
      <circle cx="100" cy="55" r="8" fill={p.primary} />
    </>
  );
}

function GiftBoxSVG({ p }: { p: ReturnType<typeof getPalette> }) {
  return (
    <>
      <rect x="55" y="110" width="90" height="65" rx="6" fill={p.primary} />
      <rect x="55" y="95" width="90" height="20" rx="4" fill={p.secondary} />
      <rect x="95" y="95" width="10" height="80" fill={p.accent} />
      <line x1="100" y1="95" x2="80" y2="75" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1="95" x2="120" y2="75" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="73" rx="10" ry="6" fill="none" stroke={p.accent} strokeWidth="3" />
      <ellipse cx="120" cy="73" rx="10" ry="6" fill="none" stroke={p.accent} strokeWidth="3" />
      {[0,60,120,180,240,300].map(a => (
        <circle key={a} cx={100+30*Math.cos(a*Math.PI/180)} cy={142+20*Math.sin(a*Math.PI/180)} r="3" fill={p.accent} opacity="0.7" />
      ))}
    </>
  );
}

export function ProductImage({ image, name, category = 'default', className = '', size = 200 }: ProductImageProps) {
  const p = getPalette(category);

  let icon: React.ReactNode;
  const img = image.toLowerCase();
  if (img.includes('mongra') || img.includes('laccha') || img.includes('saffron') && !img.includes('honey') && !img.includes('ghee') && !img.includes('face') && !img.includes('milk') && !img.includes('gift'))
    icon = <SaffronSVG p={p} />;
  else if (img.includes('honey') || img.includes('honeycomb') || img.includes('tulsi-honey') || img.includes('acacia'))
    icon = <HoneySVG p={p} />;
  else if (img.includes('gift'))
    icon = <GiftBoxSVG p={p} />;
  else if (img.includes('kawa') || img.includes('herb') || img.includes('rose') || img.includes('salt') || img.includes('ghee') || img.includes('shilajit') || img.includes('face') || img.includes('milk'))
    icon = <HerbSVG p={p} />;
  else
    icon = <DriedFruitSVG p={p} />;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={name}
    >
      {/* Background */}
      <rect width="200" height="200" fill={p.bg} />
      {/* Decorative rings */}
      <circle cx="100" cy="100" r="75" fill="none" stroke={p.accent} strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="90" fill="none" stroke={p.primary} strokeWidth="0.5" opacity="0.2" />
      {/* Product illustration */}
      {icon}
    </svg>
  );
}
