import { ViewStyle } from "react-native";

export const Colors = {
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  accent: "#FF6B35",
  background: "#0F0F1A",
  surface: "#1A1A2E",
  surfaceLight: "#2D2D44",
  text: "#FFFFFF",
  textSecondary: "#A0A0B8",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  cardio: "#FF6B35",
  strength: "#6C63FF",
  flexibility: "#26C6DA",
  sports: "#FFD54F",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
};

const Theme = { Colors, Spacing, FontSizes, BorderRadius, Shadow } as const;
export default Theme;
