/**
 * Defines the token system for Stakked themes.
 * Themes provide the default look and feel but can be overridden.
 */
export interface Theme {
  /** Unique theme ID */
  id: string;
  /** Friendly theme name */
  name: string;
  /** Theme preview color */
  previewColor: string;
  /** Token set for both light and dark variations */
  tokens: {
    light: ThemeTokens;
    dark: ThemeTokens;
  };
}

/**
 * Concrete token values for a theme state.
 */
export interface ThemeTokens {
  /** Base colors for the UI and background */
  colors: {
    primary: string;    // Brand color
    secondary: string;  // Secondary brand color
    accent: string;     // Interaction/Notification color
    background: string; // Page background
    surface: string;    // Card/Container background
    border: string;     // Line/Border color
    text: string;       // Primary text
    textMuted: string;  // Secondary/De-emphasized text
  };
  
  /** Default typography pairings */
  fonts: {
    /** Primary heading font family */
    heading: {
      family: string;
      weight: number;
    };
    /** Primary body font family */
    body: {
      family: string;
      weight: number;
    };
    /** Monospace/Code font family */
    mono: {
      family: string;
      weight: number;
    };
  };

  /** System-wide spacing scale (in px) */
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };

  /** Elevation/Depth system */
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };

  /** Corner rounding scale (in px) */
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };

  /** Predefined visual effect overlays */
  effects?: {
    noise: number; // 0 to 1
    grain: number; // 0 to 1
  };
}
