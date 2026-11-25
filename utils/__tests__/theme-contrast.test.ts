import appConfig from '../../app.json';
import {Palette, Theme} from '../../constants/Theme';

function luminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map(value => parseInt(value, 16) / 255)
    .map(value =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
const contrast = (foreground: string, background: string) => {
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
};

// Actual body/control text pairs. Decorative, highlighted suit symbols and
// disabled controls have separate rendering and are not covered by this check.
const {colors} = Theme;
const pairs = [
  ...[colors.background, colors.tableBackground].flatMap(background => [
    ['Body text', colors.text, background],
    ['Secondary text', colors.textSecondary, background],
    ['Gold text', colors.accent.gold, background],
  ]),
  ['Card text', colors.card.text, colors.card.background],
  ['Card secondary text', colors.card.textSecondary, colors.card.background],
  ['Card accent', colors.card.accent, colors.card.background],
  ['Primary button', colors.button.text, colors.button.primary],
  ['Secondary button', colors.button.textSecondary, colors.button.secondary],
  ['Destructive button', colors.accent.destructive, colors.button.secondary],
  ['Input text', colors.input.text, colors.input.background],
  ['Input placeholder', colors.input.placeholder, colors.input.background],
];

test.each(pairs)(
  '%s on %s / %s meets 4.5:1 text contrast',
  (_label, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  },
);

test('keeps the approved green and separates the room, cards, and surround', () => {
  expect(colors.tableBackground).toBe('#20533E');
  expect(colors.button.primary).not.toBe(colors.tableBackground);
  expect(luminance(Palette.surround)).toBeLessThan(
    luminance(colors.tableBackground),
  );
  expect(luminance(Palette.surround)).toBeLessThan(luminance(Palette.surface));
  expect(
    contrast(colors.tableBackground, Palette.surface),
  ).toBeGreaterThanOrEqual(1.25);
});

function hue(hex: string): number {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map(v => parseInt(v, 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  if (delta === 0) return 0;
  const sector =
    max === r
      ? (g - b) / delta
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return (sector * 60 + 360) % 360;
}

test('uses the complementary hue for primary actions', () => {
  const distance = Math.abs(
    hue(colors.tableBackground) - hue(colors.button.primary),
  );
  expect(Math.abs(distance - 180)).toBeLessThan(5);
});

test('keeps native launch and launcher colors aligned with the palette', () => {
  expect(appConfig.expo.android.adaptiveIcon.backgroundColor).toBe(
    Palette.forest,
  );
  const splash = appConfig.expo.plugins.find(
    plugin => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  );
  expect(splash?.[1]).toEqual(
    expect.objectContaining({backgroundColor: Palette.surround}),
  );
});
