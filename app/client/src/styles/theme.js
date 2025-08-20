export const theme = {
  colors: {
    // Brand colors
    primary: '#E94E20',      // Used in logo, etc.
    
    // Text colors
    text: {
      primary: '#0A0A0A',    // Main text color
      secondary: '#999999',  // Secondary text, captions, etc.
      tertiary: '#C2C2C2',   // Tertiary text, inactive, etc.
      white: '#FFFFFF',      // White text
      error: '#FF0000',      // Error text color
      errorSecondary: '#E50500', // Secondary error text color
      success: '#28a745',    // Success text color
    },

    // Background colors
    background: {
      aqua: '#5EDED1',       // Aqua background (used in logo)
      aquaLight: '#BFF2ED',   // Dark aqua background (used in logo)
      acquaExtraLight: '#DFF9F6' , // Extra light aqua background (used in logo)
      dark: '#0A0A0A',       // Dark background (used in important buttons)
      error: '#FEEAEA',      // Error background color
      light: '#FBFAF9',
      primary: '#F6F6F6',    // Primary background (used in buttons, cards)
      purp: '#D23B75',       // Runes color
      purpPale: '#FAEBF1',   // Runes color, pale
      secondary: '#EAEAEA',  // Secondary background (used in hover states)
      success: '#34C759',    // Success background color
      tertiary: '#FBFBFB',   // Extra light grey (used in logo)
      verm: '#E94E20',       // Brand color
      vermBorder: '#FCE4DA', // Brand color, border
      vermPale: '#FDEEE8',   // Brand color, pale
      white: '#FFFFFF',      // Default page background
    },

    // UI element colors
    border: '#EAEAEA',       // Border, divider color 
  },
  // to-do: update spacing
  spacing: {
    // Core spacing units
    xxs: '0.25rem',   // 4px
    xs: '0.375rem',   // 6px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '2.5rem',    // 40px
  },
  // to-do: update border radius
  borderRadius: {
    small: '0.375rem',    // 6px  - small elements
    medium: '0.5rem',     // 8px  - buttons, cards
    large: '0.75rem',     // 12px - larger elements
    full: '1.5rem',       // 24px - pill buttons
  },

  typography: {
    fontFamilies: {
      medium: 'relative-medium-pro',
      bold: 'relative-bold-pro',
    },
    
    fontSize: {
      xs: '0.875rem',    // 14px
      sm: '1rem',        // 16px
      md: '1.25rem',     // 20px
      lg: '1.5rem',      // 24px
      xl: '1.75rem',     // 28px
    },
  },

  // to-do: update transitions
  transitions: {
    default: 'all 350ms ease',
    transform: 'transform 150ms ease',
  },
  // to-do: update breakpoints
  breakpoints: {
    xs: '480px',
    sm: '630px',
    md: '812px',
    lg: '960px',
    xl: '1080px',
    xxl: '1346px',
    xxxl: '1550px',
    max: '1984px',
  },

  // to-do: update media queries
  mediaQueries: {
    xs: '@media (max-width: 480px)',
    sm: '@media (max-width: 630px)',
    md: '@media (max-width: 812px)',
    lg: '@media (max-width: 960px)',
    xl: '@media (max-width: 1080px)',
    xxl: '@media (max-width: 1346px)',
    xxxl: '@media (max-width: 1550px)',
    max: '@media (min-width: 1984px)',
  },

  // to-do: update shadows
  shadows: {
    soft: '0px 1px 6px 0px rgba(0, 0, 0, 0.09)',
    image: 'drop-shadow(0 8px 24px rgba(158,158,158,.2))',
  },
}

// Add type checking in development
if (process.env.NODE_ENV === 'development') {
  Object.freeze(theme)
}

export default theme
