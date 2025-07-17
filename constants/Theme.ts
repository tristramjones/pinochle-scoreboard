/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    // Core colors
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F8F8F8',
    text: '#11181C',
    textSecondary: '#666666',
    border: '#CCCCCC',

    // Status colors
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FFCC00',

    // Component specific
    card: {
      background: '#FFFFFF',
      border: '#E0E0E0',
      shadow: '#000000',
    },
    button: {
      primary: '#007AFF',
      secondary: '#F0F0F0',
      text: '#FFFFFF',
      textSecondary: '#000000',
    },
    input: {
      background: '#FFFFFF',
      border: '#CCCCCC',
      text: '#11181C',
      placeholder: '#999999',
    },
  },

  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
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
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  shadows: {
    sm: {
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    md: {
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    lg: {
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  },

  // Layout
  layout: {
    containerPadding: 16,
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
