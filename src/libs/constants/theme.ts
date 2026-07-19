export const COLORS = {
  light: '#FAFAFA',
  shade: '#0A0A09',
  background: '#F1E9DA',
  foreground: '#2E294E',
  primary: '#FFD400',
  accent: '#D90368',
  highlight: '#541388',
  muted: '#6F697B',
  border: '#DED5C7',
  danger: '#B4233D',
} as const;

export const THEME = {
  surface: {
    page: COLORS.background,
    raised: COLORS.light,
    dark: COLORS.foreground,
  },
  text: {
    primary: COLORS.shade,
    secondary: COLORS.muted,
    inverse: COLORS.light,
  },
  action: {
    premium: COLORS.highlight,
    emotional: COLORS.accent,
    celebration: COLORS.primary,
    destructive: COLORS.danger,
  },
  border: COLORS.border,
} as const;
