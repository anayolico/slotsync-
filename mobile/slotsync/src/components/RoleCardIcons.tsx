import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export function ClientCardIcon({ size = 28, color = "#4f46e5" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Calendar body */}
      <Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth="2" fill="none" />
      {/* Top ring pins */}
      <Path d="M8 2V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 2V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Header bar */}
      <Path d="M3 9H21" stroke={color} strokeWidth="2" />
      {/* Search / Slot Glass */}
      <Circle cx="10" cy="14" r="2.5" stroke={color} strokeWidth="1.8" fill="none" />
      <Path d="M12 16L15.5 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function CreatorCardIcon({ size = 28, color = "#0891b2" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Crown / Service Badge */}
      <Path
        d="M4 18L3 8L8.5 12L12 5L15.5 12L21 8L20 18H4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Base Bar */}
      <Path d="M4 20H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
