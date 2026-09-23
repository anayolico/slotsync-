import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export function EmailInputIcon({ size = 18, color = "#64748b" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth="2" />
      <Path d="M3 7L12 13L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LockInputIcon({ size = 18, color = "#64748b" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="11" width="16" height="10" rx="3" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  );
}

export function EyeOpenIcon({ size = 20, color = "#6366f1" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

export function EyeOffSlashIcon({ size = 20, color = "#94a3b8" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12C1 12 3.05 7.82 7.06 5.06" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C23 12 21.6 14.67 18.82 17.06" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ValidationSuccessIcon({ size = 16, color = "#10b981" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" fill="#10b981" fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
      <Path d="M6 10.2L8.7 13L14 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ValidationErrorIcon({ size = 16, color = "#ef4444" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" fill="#ef4444" fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
      <Path d="M10 6V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="10" cy="14" r="1" fill={color} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color = "#4f46e5" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

