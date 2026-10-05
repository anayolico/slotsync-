/** Shared SlotSync visual tokens & rich chromatic design system constants */
export const colors = {
  // Primary Spectrum (Indigo & Electric Violet)
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#6366F1',
  primaryWash: '#EEF2FF',
  primaryGlow: 'rgba(79, 70, 229, 0.22)',
  primaryGlowSolid: '#E0E7FF',

  // Radiant Secondary & Ambient Accents
  accentViolet: '#7C3AED',
  accentPurpleWash: '#F5F3FF',
  accentCyan: '#06B6D4',
  accentCyanWash: '#ECFEFF',
  accentPink: '#EC4899',
  accentPinkWash: '#FDF2F8',
  accentAmber: '#F59E0B',
  accentAmberWash: '#FEF3C7',
  accentEmerald: '#10B981',
  accentEmeraldWash: '#ECFDF5',

  // Category Colorways (Rich, Vibrant & Harmonious)
  categoryDoctor: { 
    text: '#0D9488', 
    bg: '#F0FDFA', 
    border: '#99F6E4', 
    accent: '#0D9488', 
    glow: 'rgba(13, 148, 136, 0.18)',
    gradient: ['#14B8A6', '#0F766E'] 
  },
  categoryLawyer: { 
    text: '#059669', 
    bg: '#ECFDF5', 
    border: '#A7F3D0', 
    accent: '#059669', 
    glow: 'rgba(5, 150, 105, 0.18)',
    gradient: ['#10B981', '#047857'] 
  },
  categoryBarber: { 
    text: '#E11D48', 
    bg: '#FFF1F2', 
    border: '#FECDD3', 
    accent: '#E11D48', 
    glow: 'rgba(225, 29, 72, 0.18)',
    gradient: ['#FB7185', '#BE123C'] 
  },
  categoryConsultant: { 
    text: '#D97706', 
    bg: '#FFFBEB', 
    border: '#FDE68A', 
    accent: '#D97706', 
    glow: 'rgba(217, 119, 6, 0.18)',
    gradient: ['#F59E0B', '#B45309'] 
  },
  categoryFitness: {
    text: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    accent: '#0284C7',
    glow: 'rgba(2, 132, 199, 0.18)',
    gradient: ['#38BDF8', '#0284C7']
  },
  categoryGeneral: { 
    text: '#4338CA', 
    bg: '#EEF2FF', 
    border: '#C7D2FE', 
    accent: '#6366F1', 
    glow: 'rgba(99, 102, 241, 0.18)',
    gradient: ['#6366F1', '#4F46E5'] 
  },

  // Rich Canvas & Frosted Glass Tones
  bgApp: '#F4F7FC',
  bgMeshLight: '#EEF2FB',
  bgCard: 'rgba(255, 255, 255, 0.94)',
  bgCardSolid: '#FFFFFF',
  bgCardGlass: 'rgba(255, 255, 255, 0.82)',
  bgInput: 'rgba(255, 255, 255, 0.92)',
  bgInputFocus: '#FFFFFF',
  bgSubtle: '#F0F4FA',
  subtleBg: '#F0F4FA',
  bgDark: '#0B1120',
  bgDarkSurface: '#1E293B',

  // Status & Feedback Colors
  success: '#059669',
  successDark: '#047857',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706',
  warningDark: '#B45309',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#E11D48',
  dangerDark: '#BE123C',
  dangerBg: '#FFF1F2',
  dangerBorder: '#FECDD3',

  info: '#2563EB',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // Typography & Content
  textMain: '#0F172A',
  textHeading: '#1E1B4B',
  textMuted: '#475569',
  textDim: '#64748B',
  textWhite: '#FFFFFF',

  // Glass Borders & Outlines
  borderColor: 'rgba(226, 232, 240, 0.95)',
  borderLight: 'rgba(241, 245, 249, 0.85)',
  borderGlass: 'rgba(99, 102, 241, 0.16)',
  borderDark: '#CBD5E1',
  borderFocus: '#6366F1',

  // Backdrop
  overlay: 'rgba(15, 23, 42, 0.55)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
};

export const typography = {
  fontHeading: 'System',
  fontBody: 'System',
  display: 30,
  title: 22,
  subheading: 18,
  body: 15,
  caption: 12,
  micro: 10,
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  full: 9999,
  pill: 9999,
};

export const spacing = { 
  xxs: 2,
  xs: 4, 
  sm: 8, 
  md: 16, 
  lg: 24, 
  xl: 32, 
  xxl: 40 
};

export const shadows = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryGlow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 7,
  },
  violetGlow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 7,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 18,
  }
};

export const chromatic = {
  indigo: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    glow: 'rgba(79, 70, 229, 0.22)',
    gradient: ['#6366F1', '#4F46E5'] as [string, string],
  },
  violet: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    glow: 'rgba(124, 58, 237, 0.22)',
    gradient: ['#8B5CF6', '#7C3AED'] as [string, string],
  },
  emerald: {
    primary: '#059669',
    secondary: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    glow: 'rgba(5, 150, 105, 0.20)',
    gradient: ['#10B981', '#047857'] as [string, string],
  },
  teal: {
    primary: '#0D9488',
    secondary: '#14B8A6',
    bg: '#F0FDFA',
    border: '#99F6E4',
    glow: 'rgba(13, 148, 136, 0.20)',
    gradient: ['#14B8A6', '#0F766E'] as [string, string],
  },
  rose: {
    primary: '#E11D48',
    secondary: '#F43F5E',
    bg: '#FFF1F2',
    border: '#FECDD3',
    glow: 'rgba(225, 29, 72, 0.20)',
    gradient: ['#FB7185', '#BE123C'] as [string, string],
  },
  amber: {
    primary: '#D97706',
    secondary: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    glow: 'rgba(217, 119, 6, 0.20)',
    gradient: ['#F59E0B', '#B45309'] as [string, string],
  },
  cyan: {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    glow: 'rgba(2, 132, 199, 0.20)',
    gradient: ['#38BDF8', '#0284C7'] as [string, string],
  },
};

export const glass = {
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderWidth: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(203, 213, 225, 0.9)',
    borderWidth: 1,
  },
  inputFocus: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4F46E5',
    borderWidth: 1.5,
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderWidth: 1,
  },
};

export const motion = { 
  press: 110, 
  short: 180, 
  standard: 260, 
  entrance: 340 
};

