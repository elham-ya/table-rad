// src/types/theme.ts
export const COLORS = {
  primary: '#007bff',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  muted: '#6c757d',

  brandBlue: '#0d6efd',
  brandIndigo: '#6610f2',
} as const;

// برای تایپ‌های دقیق (optional)
export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];