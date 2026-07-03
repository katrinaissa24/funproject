/**
 * Aura design tokens — "paper & ink" editorial system.
 * Warm off-white paper, near-black ink, terracotta accent,
 * muted per-module tints used sparingly.
 */

export const colors = {
  paper: '#FAF7F2',
  card: '#FFFFFF',
  ink: '#1A1815',
  inkSoft: '#5C564D',
  inkFaint: '#9B948A',
  hairline: '#EAE4DA',
  hairlineSoft: '#F1ECE4',

  accent: '#C4553D', // terracotta — the one true accent
  accentSoft: '#F6E4DE',
  accentFaint: '#FBF0EC',

  // per-module tints
  sage: '#71835F', // goals & habits
  sageSoft: '#E9EDE2',
  ochre: '#B8862B', // inbox / ideas
  ochreSoft: '#F4EBD7',
  slate: '#5B7285', // plan / calendar
  slateSoft: '#E4EBF0',
  plum: '#8A5A78', // body
  plumSoft: '#F0E5ED',

  success: '#5F7A50',
  danger: '#B3402E',
} as const;

export const font = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  serif: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 32, lineHeight: 38, color: colors.ink },
  title: { fontFamily: font.display, fontSize: 22, lineHeight: 28, color: colors.ink },
  heading: { fontFamily: font.semibold, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  caption: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: colors.inkSoft },
  micro: {
    fontFamily: font.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.inkFaint,
  },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 20,
  chip: 999,
  field: 14,
} as const;

export type ModuleTint = {
  color: string;
  soft: string;
};

export const tints = {
  inbox: { color: colors.ochre, soft: colors.ochreSoft },
  goals: { color: colors.sage, soft: colors.sageSoft },
  body: { color: colors.plum, soft: colors.plumSoft },
  plan: { color: colors.slate, soft: colors.slateSoft },
  today: { color: colors.accent, soft: colors.accentSoft },
} as const;
