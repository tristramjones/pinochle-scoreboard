/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    // Base colors
    background: '#F8F0D9', // Warm cream background
    card: {
      background: '#F6F0E4', // Warmer cream for cards
      border: '#E8D5B0',
      shadow: 'rgba(0, 0, 0, 0.25)', // 15% darker shadow
    },
    // Text colors
    text: '#202017', // Rich dark color for main text
    textSecondary: '#6B5F51', // Warm brown for secondary text (dates)

    // Accent colors
    primary: '#173D2D', // Deep vintage green for primary actions
    accent: {
      burgundy: '#8B2E2E', // Deep red for accents
      green: '#173D2D', // Deep green
      gold: '#C6A15B', // Vintage gold
    },

    // Button colors
    button: {
      primary: '#173D2D', // Deep vintage green
      secondary: '#FFFDF7', // White background for secondary buttons
      text: '#FFFDF7', // White text on primary
      textSecondary: '#173D2D', // Green text on secondary
    },

    // Input colors
    input: {
      background: '#FFFDF7',
      border: '#E8D5B0',
      text: '#202017',
      placeholder: '#A39485',
    },
  },

  // Typography
  typography: {
    fonts: {
      regular: 'CrimsonText',
      bold: 'CrimsonText-Bold',
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
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // Button
  button: {
    sizes: {
      sm: {
        height: 40,
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

  // Animation
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
  },

  // Standardized card styling
  card: {
    background: '#F6F0E4', // Warmer cream color
    borderRadius: 8,
    shadow: {
      shadowColor: 'rgba(0, 0, 0, 0.25)', // 15% darker
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.4, // Increased opacity by ~15%
      shadowRadius: 6,
      elevation: 7, // Slightly increased elevation to match
    },
  },
};

// Type definitions for theme
export type ThemeColors = typeof Theme.colors;
export type ThemeType = typeof Theme;

// Helper to ensure we're using valid theme colors
export type ThemeColor = keyof ThemeColors;
