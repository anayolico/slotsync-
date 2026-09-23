import React from 'react';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SlotSyncLogoProps {
  size?: number;
}

export default function SlotSyncLogo({ size = 68 }: SlotSyncLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Defs>
        <LinearGradient id="logoGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#6366f1" />
          <Stop offset="50%" stopColor="#4f46e5" />
          <Stop offset="100%" stopColor="#4338ca" />
        </LinearGradient>
        <LinearGradient id="accentGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="100%" stopColor="#818cf8" />
        </LinearGradient>
      </Defs>

      {/* Main Rounded Shield/Container */}
      <Rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="22"
        fill="url(#logoGradient)"
      />

      {/* Subtle Inner Glow Border */}
      <Rect
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
      <Rect x="26" y="16" width="6" height="10" rx="3" fill="#ffffff" />
      <Rect x="48" y="16" width="6" height="10" rx="3" fill="#ffffff" />

      {/* Calendar Card Sheet */}
      <Rect x="18" y="22" width="44" height="42" rx="10" fill="#ffffff" fillOpacity="0.95" />

      {/* Calendar Header Line */}
      <Path
        d="M18 32 C18 28 20 28 24 28 H56 C60 28 62 28 62 32 V34 H18 V32 Z"
        fill="#4f46e5"
      />

      {/* Slot Grid Points / Clock Sync Motif */}
      <Circle cx="29" cy="42" r="3.5" fill="#4f46e5" />
      <Circle cx="40" cy="42" r="3.5" fill="#4f46e5" />
      <Circle cx="51" cy="42" r="3.5" fill="#cbd5e1" />

      {/* Sync Arrow / Check Mark for Appointment Slot */}
      <Path
        d="M27 52.5 L36 52.5 M33 49.5 L36 52.5 L33 55.5"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M53 52.5 L44 52.5 M47 49.5 L44 52.5 L47 55.5"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
