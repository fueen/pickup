import fs from 'fs';
import path from 'path';
import { Tokens } from '../../src/design-tokens';

describe('theme colors', () => {
  it('uses the selected muted green as the app accent color', () => {
    expect(Tokens.color.accent).toBe('#A8D46F');
    expect(Tokens.color.safe).toBe('#A8D46F');
  });

  it('does not keep the previous neon accent hardcoded in the monthly chart', () => {
    const chartSource = fs.readFileSync(path.join(__dirname, '../../src/components/hub/MonthlyChart.tsx'), 'utf8');

    expect(chartSource).not.toContain('233,255,63');
    expect(chartSource).not.toContain('#E9FF3F');
  });

  it('uses the original stacked-card splash mark without a Chinese tagline', () => {
    const splashSource = fs.readFileSync(path.join(__dirname, '../../src/components/SplashScreen.tsx'), 'utf8');

    expect(splashSource).toContain('cardStage');
    expect(splashSource).toContain('brandCard');
    expect(splashSource).toContain('cardThree');
    expect(splashSource).toContain('cardStyle');
    expect(splashSource).not.toContain('记忆由你选择');
    expect(splashSource).not.toContain('照片整理');
  });

  it('keeps the splash accent aligned with the current theme color', () => {
    const splashSource = fs.readFileSync(path.join(__dirname, '../../src/components/SplashScreen.tsx'), 'utf8');

    expect(splashSource).toContain('Tokens.color.accent');
    expect(splashSource).not.toContain('#FFCC00');
    expect(splashSource).not.toContain('#E9FF3F');
    expect(splashSource).not.toContain('SafeBlurView');
    expect(splashSource).not.toContain('backgroundGlow');
    expect(splashSource).not.toContain('glassShell');
    expect(splashSource).not.toContain('glassDot');
    expect(splashSource).not.toContain('logoBody');
    expect(splashSource).not.toContain('logoCutout');
    expect(splashSource).not.toContain('logoHighlight');
    expect(splashSource).not.toContain('logoDot');
  });
});
