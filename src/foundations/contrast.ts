/**
 * WCAG 2.1 contrast math, used by the Foundations pages so the documented ratios are
 * computed from the build rather than typed in by hand.
 */

export type Rgb = [number, number, number];
export type Rgba = [number, number, number, number];

/** Accepts `#abc`, `#aabbcc`, `rgb()` and `rgba()`. Returns null for anything else. */
export function parseColor(input: string): Rgba | null {
  const c = String(input).trim();

  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    if (hex.length !== 6) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return [r, g, b, 1];
  }

  const match = c.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(',').map((x) => parseFloat(x));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1], parts[2], parts[3] === undefined ? 1 : parts[3]];
}

/**
 * Flattens a translucent colour onto an opaque backdrop. Contrast is only meaningful
 * against what actually renders — `border-subtle` is rgba, so comparing its raw value
 * to a surface would report a ratio no one ever sees.
 */
export function flatten(fg: Rgba, bg: Rgb): Rgb {
  const a = fg[3];
  if (a >= 1) return [fg[0], fg[1], fg[2]];
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)) as unknown as Rgb;
}

const hex2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

/** `#rrggbb`, or `#rrggbbaa` when the colour carries alpha. Null if unparseable. */
export function toHex(value: string): string | null {
  const c = parseColor(value);
  if (!c) return null;
  const base = `#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}`;
  return c[3] >= 1 ? base : `${base}${hex2(c[3] * 255)}`;
}

/** `rgb(r, g, b)`, or `rgba(r, g, b, a)` when the colour carries alpha. */
export function toRgbString(value: string): string | null {
  const c = parseColor(value);
  if (!c) return null;
  const [r, g, b] = [c[0], c[1], c[2]].map((n) => Math.round(n));
  return c[3] >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Number(c[3].toFixed(3))})`;
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Relative luminance of a token value, flattened onto `backdrop` if translucent. */
export function luminanceOf(value: string, backdrop = '#ffffff'): number | null {
  const parsed = parseColor(value);
  if (!parsed) return null;
  const bg = parseColor(backdrop);
  return luminance(flatten(parsed, bg ? [bg[0], bg[1], bg[2]] : [255, 255, 255]));
}

/**
 * WCAG contrast ratio, 1–21. Returns null if either colour can't be parsed.
 *
 * `backdrop` is what sits behind a translucent *background* — required, because a
 * background like `rgba(46, 38, 24, 0.12)` renders as 12% ink over paper, not as solid
 * ink. Ignoring the background's own alpha reports the ratio of a colour nobody sees:
 * `ink-a12` measured 14.9:1 against cream that way, while the pixels on screen are
 * closer to 1.3:1.
 */
export function contrastRatio(fgValue: string, bgValue: string, backdrop = '#ffffff'): number | null {
  const fg = parseColor(fgValue);
  const bgParsed = parseColor(bgValue);
  if (!fg || !bgParsed) return null;

  const back = parseColor(backdrop);
  const backRgb: Rgb = back ? [back[0], back[1], back[2]] : [255, 255, 255];

  // Flatten the background first, then the foreground onto the result.
  const bg = flatten(bgParsed, backRgb);
  const [hi, lo] = [luminance(flatten(fg, bg)), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

export type Level = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/** Grades a ratio for body text. Large-text and UI thresholds are lower. */
export function gradeText(ratio: number): Level {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}
