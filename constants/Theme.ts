/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    primary: '#1C3823', // deep forest green from the card
    secondary: '#8B3A2B', // rich burgundy/rust red
    background: '#E8D5B0', // aged parchment/gold
    surface: '#E2CCA3', // slightly darker parchment for contrast
    text: '#1C3823', // forest green for text
    textSecondary: '#8B3A2B', // burgundy for secondary text
    border: '#8B3A2B', // burgundy for borders
    success: '#1C3823', // forest green
    error: '#8B3A2B', // burgundy
    warning: '#D4B355', // gold
    card: {
      background: '#E8D5B0', // aged parchment
      border: '#8B3A2B', // burgundy border
      shadow: '#1C382348', // lighter shadow with 28% base opacity
    },
    button: {
      primary: '#1C3823', // forest green
      secondary: '#E8D5B0', // parchment
      text: '#E8D5B0', // parchment text
      textSecondary: '#1C3823', // forest green text
    },
    input: {
      background: '#E8D5B0', // parchment
      border: '#8B3A2B', // burgundy
      text: '#1C3823', // forest green
      placeholder: '#8B3A2B80', // semi-transparent burgundy
    },
    accent: {
      burgundy: '#8B3A2B',
      green: '#1C3823',
      gold: '#D4B355',
    },
  },
  patterns: {
    background: `repeating-linear-gradient(
      45deg,
      #E6D5A7,
      #E6D5A7 10px,
      #E2D1A3 10px,
      #E2D1A3 20px
    )`, // subtle diagonal pattern
    card: `linear-gradient(
      to bottom right,
      #F5EAC6,
      #F0E2B6
    )`, // subtle gradient for cards
  },

  typography: {
    fonts: {
      regular: 'CrimsonText-Regular',
      bold: 'CrimsonText-Bold',
    },
    fontSizes: {
      xs: 14,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 40,
      xxxl: 48,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
    xl: 40,
    xxl: 56,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },

  shadows: {
    sm: {
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    md: {
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    lg: {
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
  },

  // Layout
  layout: {
    containerPadding: 20,
    maxWidth: 800,
  },

  // Animation
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
    },
  },
};

// Type definitions for theme
export type ThemeColors = typeof Theme.colors;
export type ThemeType = typeof Theme;

// Helper to ensure we're using valid theme colors
export type ThemeColor = keyof ThemeColors;
