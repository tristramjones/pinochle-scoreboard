/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    // Core brand colors
    primary: '#1C3823', // deep forest green
    secondary: '#8B3A2B', // rich burgundy
    accent: {
      burgundy: '#8B3A2B',
      green: '#1C3823',
      gold: '#D4B355',
    },

    // Background colors
    background: '#E8D5B0', // aged parchment
    surface: '#E2CCA3', // darker parchment

    // Text colors
    text: '#1C3823', // forest green
    textSecondary: '#8B3A2B', // burgundy

    // Status colors
    success: '#1C3823', // forest green
    error: '#8B3A2B', // burgundy
    warning: '#D4B355', // gold

    // Component specific
    card: {
      background: '#E8D5B0', // aged parchment
      border: '#8B3A2B', // burgundy
      shadow: '#1C382348', // semi-transparent green
    },
    button: {
      primary: '#1C3823', // forest green
      secondary: '#E8D5B0', // parchment
      text: '#E8D5B0', // parchment
      textSecondary: '#1C3823', // forest green
    },
    input: {
      background: '#E8D5B0', // parchment
      border: '#8B3A2B', // burgundy
      text: '#1C3823', // forest green
      placeholder: '#8B3A2B80', // semi-transparent burgundy
    },
  },

  typography: {
    fonts: {
      regular: 'CrimsonText-Regular',
      bold: 'CrimsonText-Bold',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
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
    lg: 16,
    full: 9999,
  },
};

// Type definitions for theme
export type ThemeColors = typeof Theme.colors;
export type ThemeType = typeof Theme;

// Helper to ensure we're using valid theme colors
export type ThemeColor = keyof ThemeColors;
