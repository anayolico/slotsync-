import React from 'react';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export function Mail({ size = 20, color = '#64748b', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M22 6L12 13L2 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Lock({ size = 20, color = '#64748b', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M7 11V7A5 5 0 0 1 17 7V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function User({ size = 20, color = '#64748b', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M19 21V19A4 4 0 0 0 15 15H9A4 4 0 0 0 5 19V21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Phone({ size = 20, color = '#64748b', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M22 16.92V19.92C22 20.48 21.54 20.93 20.99 20.92C18.17 20.73 15.48 19.78 13.09 18.16C10.9 16.69 9.07 14.86 7.6 12.67C5.97 10.27 5.03 7.57 4.84 4.74C4.83 4.19 5.28 3.73 5.84 3.73H8.84C9.33 3.73 9.75 4.08 9.83 4.56C9.97 5.48 10.23 6.38 10.6 7.23C10.74 7.56 10.66 7.94 10.39 8.21L9.12 9.48C10.45 12.01 12.51 14.07 15.04 15.4L16.31 14.13C16.58 13.86 16.96 13.78 17.29 13.92C18.14 14.29 19.04 14.55 19.96 14.69C20.44 14.77 20.79 15.19 20.79 15.68L22 16.92Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Eye({ size = 20, color = '#6366f1', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M2 12S6 4 12 4S22 12 22 12S18 20 12 20S2 12 2 12Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function EyeOff({ size = 20, color = '#94a3b8', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M9.88 9.88A3 3 0 1 0 14.12 14.12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5C17 5 21 12 21 12A18.16 18.16 0 0 1 17.73 16.73" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.28 6.28A18.16 18.16 0 0 0 3 12C3 12 7 19 12 19A10.43 10.43 0 0 0 17.72 17.72" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="2" y1="2" x2="22" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckCircle2({ size = 20, color = '#10b981', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AlertCircle({ size = 20, color = '#ef4444', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="16" r="1" fill={color} />
    </Svg>
  );
}

export function ChevronLeft({ size = 20, color = '#4f46e5', strokeWidth = 2.5, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowRight({ size = 20, color = '#ffffff', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Check({ size = 20, color = '#ffffff', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ShieldCheck({ size = 20, color = '#4f46e5', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function RotateCcw({ size = 20, color = '#4f46e5', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M1 4V10H7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.51 15A9 9 0 1 0 5.64 5.64L1 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Sparkles({ size = 20, color = '#10b981', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Camera({ size = 20, color = '#ffffff', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MapPin({ size = 20, color = '#4f46e5', strokeWidth = 2, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 1 1 21 10Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
