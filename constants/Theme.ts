/**
 * Global theme configuration for the Pinochle Scoreboard app.
 * This defines all the design tokens used throughout the app.
 */

export const Theme = {
  colors: {
    // Base colors
    background: '#21120C',
    card: {
      background: '#321D12',
      border: '#8B6738',
      shadow: 'rgba(0, 0, 0, 0.25)',
    },
    // Text colors
    text: '#F8EACC',
    textSecondary: '#CBB491',

    // Accent colors
    primary: '#E4BC73',
    accent: {
      burgundy: '#E8A17C',
      green: '#7F8B65',
      gold: '#E4BC73',
    },

    // Button colors
    button: {
      primary: '#20533E',
      secondary: '#2A170E',
      text: '#F8EACC',
      textSecondary: '#E4BC73',
    },

    // Input colors
    input: {
      background: '#F5E4BD',
      border: '#8B6738',
      text: '#2A170E',
      placeholder: '#7B674B',
    },
  },

  // Typography
  typography: {
    fonts: {
      regular: 'IMFellEnglish',
      italic: 'IMFellEnglish-Italic',
      bold: 'PlayfairDisplay-Bold',
      display: 'Cinzel',
      editorial: 'IMFellEnglish',
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
    background: '#321D12',
    borderRadius: 8,
    shadow: {
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 7,
    },
  },
};

// Type definitions for theme
export type ThemeColors = typeof Theme.colors;
export type ThemeType = typeof Theme;

// Helper to ensure we're using valid theme colors
export type ThemeColor = keyof ThemeColors;
