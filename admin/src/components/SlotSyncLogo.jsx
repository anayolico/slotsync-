import React from 'react';

export default function SlotSyncLogo({ size = 38, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="adminLogoGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>

      {/* Main Rounded Container */}
      <rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="22"
        fill="url(#adminLogoGrad)"
      />

      {/* Subtle Inner Glow Border */}
      <rect
        x="4"
        y="4"
        width="72"
        height="72"
        rx="20"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Calendar Top Ring Pins */}
      <rect x="26" y="16" width="6" height="10" rx="3" fill="#ffffff" />
      <rect x="48" y="16" width="6" height="10" rx="3" fill="#ffffff" />

      {/* Calendar Card Sheet */}
      <rect x="18" y="22" width="44" height="42" rx="10" fill="#ffffff" fillOpacity="0.95" />

      {/* Calendar Header Line */}
      <path
        d="M18 32 C18 28 20 28 24 28 H56 C60 28 62 28 62 32 V34 H18 V32 Z"
        fill="#4f46e5"
      />

      {/* Slot Grid Points */}
      <circle cx="29" cy="42" r="3.5" fill="#4f46e5" />
      <circle cx="40" cy="42" r="3.5" fill="#4f46e5" />
      <circle cx="51" cy="42" r="3.5" fill="#cbd5e1" />

      {/* Sync Arrow / Motif */}
      <path
        d="M27 52.5 L36 52.5 M33 49.5 L36 52.5 L33 55.5"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M53 52.5 L44 52.5 M47 49.5 L44 52.5 L47 55.5"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
