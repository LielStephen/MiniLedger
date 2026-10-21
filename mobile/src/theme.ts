/**
 * MiniLedger "Y2K Clean" Design System
 * Early-2000s optimism, Frutiger Aero / iPod-era gloss, bubbly rounded UI, glassmorphic surfaces.
 */

export const colors = {
  // Backgrounds & Gradients
  bgLight: '#F4F8FF',
  gradientBg: ['#EAF4FF', '#F1EAFF'] as const,
  orbBlue: 'rgba(58, 167, 255, 0.18)',
  orbPurple: 'rgba(139, 156, 255, 0.15)',

  // Brand Accents
  primaryAqua: '#3AA7FF',
  primaryAquaDark: '#1E8CE0',
  secondaryPeriwinkle: '#8B9CFF',
  accentMint: '#10B981', // Crisp mint for repaid/positive status
  mintBg: 'rgba(16, 185, 129, 0.12)',
  accentCoral: '#FF4D6D', // Vivid coral for overdue / urgency
  coralBg: 'rgba(255, 77, 109, 0.12)',
  pendingAmber: '#F59E0B',
  amberBg: 'rgba(245, 158, 11, 0.12)',

  // Glass & Chrome Highlights
  glassFill: 'rgba(255, 255, 255, 0.72)',
  glassFillDense: 'rgba(255, 255, 255, 0.88)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
  glassBorderSubtle: 'rgba(217, 226, 236, 0.65)',
  chromeGradient: ['#FFFFFF', '#D9E2EC'] as const,
  buttonGlossTop: 'rgba(255, 255, 255, 0.45)',
  buttonGlossBottom: 'rgba(255, 255, 255, 0.0)',

  // Typography
  textNavy: '#12203A',
  textSlate: '#6B7A90',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Utility
  cardShadow: '#3AA7FF',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  inputBorder: '#D0DFF0',
  inputBorderFocused: '#3AA7FF',
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 9999,
};

export const shadows = {
  glass: {
    shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#1A365D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  glossyButton: {
    shadowColor: '#3AA7FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glowAqua: {
    shadowColor: '#3AA7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const typography = {
  fontFamily: {
    regular: 'Sora_400Regular',
    semiBold: 'Sora_600SemiBold',
    bold: 'Sora_700Bold',
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};
