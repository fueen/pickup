export const Tokens = {
  color: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    danger: '#FF3B30',
    safe: '#34C759',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#48484A',
    overlay: 'rgba(0,0,0,0.6)',
  },
  spacing: { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 },
  radius: { card: 12, button: 12, pill: 999 },
  animation: {
    spring: { damping: 0.7, stiffness: 150 },
    timing: { duration: 300 },
  },
  photo: {
    groupSize: 15,
    freeDailyLimit: 20,
    markThreshold: 0.4,
  },
  typography: {
    headline: { fontSize: 28, fontWeight: '700' as const },
    title: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
  },
};
