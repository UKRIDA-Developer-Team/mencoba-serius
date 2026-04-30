export const colorPrimary = "oklch(0.269 0.0551 21.4)";
export const colorAccent = "oklch(0.678 0.0800 306.3)";
export const colorAccentLight = "oklch(0.854 0.0463 305.2)";
export const colorBg = "oklch(0.987 0.0051 67.8)";
export const colorSurface = "oklch(0.954 0.0136 78.3)";
export const colorBorder = "oklch(0.903 0.0213 72.1)";
export const colorSuccess = "oklch(0.706 0.0707 157.3)";
export const colorWarning = "oklch(0.716 0.1076 61.0)";
export const colorError = "oklch(0.613 0.1177 15.7)";
export const colorInfo = "oklch(0.685 0.0666 267.9)";
export const colorPlaceholder = "oklch(0.726 0.0210 65.0)";

export const colors = {
  primary: colorPrimary,
  accent: colorAccent,
  accentLight: colorAccentLight,
  bg: colorBg,
  surface: colorSurface,
  border: colorBorder,
  success: colorSuccess,
  warning: colorWarning,
  error: colorError,
  info: colorInfo,
  placeholder: colorPlaceholder,
} as const;

export type ColorToken = keyof typeof colors;
