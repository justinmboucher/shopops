// src/theme/shopopsTheme.js

const colors = {
  primary: "#4F8AFE",
  primaryHover: "#3C6FE0",
  backgroundApp: "#0D1117",
  backgroundCard: "#171C24",
  backgroundHover: "#1E242E",
  borderSubtle: "rgba(255,255,255,0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A6A6A6",
  success: "#31C48D",
  warning: "#F4BD0E",
  danger: "#E02424",
};

const radii = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const typography = {
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 28,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
};

export const shopopsTheme = {
  colors,
  radii,
  spacing,
  typography,
};
