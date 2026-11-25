/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

// HSL complements: fixed green (~155 degrees) and muted wine (~337 degrees).
// Champagne gold tints the card surface; the approved gold frame is unchanged.
export const Palette = {
  surround: '#101A14',
  surface: '#E7D2A4',
  control: '#23362B',
  forest: '#20533E',
  wine: '#71364D',
  parchment: '#F7E8C9',
  parchmentMuted: '#D2B994',
  paper: '#F9F1DF',
  ink: '#23382C',
  inkMuted: '#515B4D',
  brass: '#E9C27E',
  brassMuted: '#A78043',
  brassLight: '#F3D69D',
  brassDeep: '#B48B47',
  brassShadow: '#5D3D23',
  brassGlow: '#FBE7BF',
  danger: '#E8B1C2',
  suitRed: '#D32F2F',
  suitBlack: '#111111',
  shadow: 'rgba(0, 0, 0, 0.25)',
} as const;

export const Theme = {
  colors: {
    background: Palette.surround,
    tableBackground: Palette.forest,
    card: {
      background: Palette.surface,
      border: Palette.brassMuted,
      text: Palette.ink,
      textSecondary: Palette.inkMuted,
      accent: Palette.forest,
    },
    text: Palette.parchment,
    textSecondary: Palette.parchmentMuted,
    primary: Palette.brass,
    accent: {
      destructive: Palette.danger,
      gold: Palette.brass,
    },
    button: {
      primary: Palette.wine,
      secondary: Palette.control,
      text: Palette.parchment,
      textSecondary: Palette.brass,
    },
    input: {
      background: Palette.paper,
      border: Palette.brassMuted,
      text: Palette.ink,
      placeholder: Palette.inkMuted,
    },
  },

  // Typography
  typography: {
    fonts: {
      regular: 'IMFellEnglish',
      italic: 'IMFellEnglish-Italic',
      bold: 'PlayfairDisplay-Bold',
      display: 'Cinzel',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 3,
    md: 6,
    lg: 10,
    xl: 14,
  },

  // Button
  button: {
    activeOpacity: 0.72,
    disabledOpacity: 0.45,
    sizes: {
      sm: {
        height: 44,
        paddingHorizontal: 16,
        fontSize: 14,
        lineHeight: 1.3,
      },
      md: {
        height: 48,
        paddingHorizontal: 24,
        fontSize: 16,
        lineHeight: 1.3,
      },
      lg: {
        height: 64,
        paddingHorizontal: 32,
        fontSize: 20,
        lineHeight: 1.3,
      },
    },
  },

  shadows: {
    card: {
      shadowColor: Palette.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 7,
    },
  },
};
