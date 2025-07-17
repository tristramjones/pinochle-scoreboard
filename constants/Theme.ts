/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    // Core colors
    primary: '#1B3B25', // Dark forest green
    background: '#F5E6D3', // Warm cream background
    surface: '#FFF8E7', // Lighter cream for cards
    text: '#1B3B25', // Dark forest green for text
    textSecondary: '#2D4A35', // Slightly lighter green
    border: '#1B3B25', // Dark green borders

    // Status colors
    success: '#2D4A35', // Forest green success
    error: '#8B1E1E', // Deep red for errors
    warning: '#8B4513', // Saddle brown for warnings

    // Component specific
    card: {
      background: '#FFF8E7', // Light cream
      border: '#1B3B25', // Dark green border
      shadow: 'rgba(27, 59, 37, 0.2)', // Semi-transparent green shadow
    },
    button: {
      primary: '#1B3B25', // Dark forest green
      secondary: '#F5E6D3', // Cream background
      text: '#FFF8E7', // Light cream text
      textSecondary: '#1B3B25', // Dark green text
    },
    input: {
      background: '#FFF8E7', // Light cream
      border: '#1B3B25', // Dark green border
      text: '#1B3B25', // Dark green text
      placeholder: '#2D4A35', // Lighter green
    },
    accent: {
      burgundy: '#8B1E1E', // For special elements like the joker card
    },
  },

  typography: {
    fontSizes: {
      xs: 14,
      sm: 16,
      md: 18,
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
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    md: {
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    lg: {
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.2,
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
