export const PALETTE = {
  paper: '#FFFEFB',
  ink: '#242624',
  porcelain: '#F7F4EE',
  midnight: '#17252B',
  champagne: '#C7A66A',
  aubergine: '#563B49',
  forest: '#30463E',
  slate: '#6D716D',
  parchment: '#EAE3D7',
  danger: '#B4233D',
} as const;

export const COLORS = PALETTE;

export const THEME = {
  surface: {
    page: PALETTE.porcelain,
    raised: PALETTE.paper,
    inset: PALETTE.parchment,
    dark: PALETTE.midnight,
  },
  text: {
    primary: PALETTE.ink,
    secondary: PALETTE.slate,
    inverse: PALETTE.paper,
  },
  action: {
    premium: PALETTE.forest,
    emotional: PALETTE.aubergine,
    celebration: PALETTE.champagne,
    destructive: PALETTE.danger,
  },
  border: PALETTE.parchment,
} as const;
