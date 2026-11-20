import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { ProgressbarColors } from '../src/shared/colors/ProgressbarColors.js';
import { ProgressbarClasses } from '../src/shared/classes/ProgressbarClasses.js';

const dark = (classNames) => (classNames ? classNames : '');
const colors = ProgressbarColors({}, dark);
const classes = ProgressbarClasses(colors);

assert.match(String(classes.base.material), /bg-md-light-surface-variant/);
assert.doesNotMatch(String(classes.base.ios), /bg-black\/30.*bg-black\/30/);
assert.match(String(classes.base.ios), /bg-black\/30/);

const sync = spawnSync('npm', ['run', 'generate:css'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  stdio: 'inherit',
});
if (sync.status !== 0) {
  process.exit(sync.status ?? 1);
}

const stylesEntry = fileURLToPath(
  new URL('../registry/capacitor/styles/tailwind-capacitor.css', import.meta.url),
);
const registryCss = readFileSync(stylesEntry, 'utf8');
const result = await postcss([tailwindcss()]).process(registryCss, {
  from: stylesEntry,
});

assert.match(
  result.css,
  /\.bg-md-light-surface-variant\b/,
  'tailwind build must emit bg-md-light-surface-variant utility',
);
assert.match(
  result.css,
  /\.bg-md-light-primary\b/,
  'tailwind build must emit bg-md-light-primary utility',
);

function extractUtilityBackground(css, utility) {
  const escaped = utility.replace(/[/]/g, '\\/').replace(/-/g, '\\-');
  const re = new RegExp(`\\.${escaped}(?:::where\\([^)]*\\))?\\s*\\{([^}]+)\\}`);
  const match = css.match(re);
  assert.ok(match, `missing CSS rule for .${utility}`);
  const block = match[1];
  const bgMatch =
    block.match(/background-color:\s*([^;]+)/) ||
    block.match(/background:\s*([^;]+)/);
  assert.ok(bgMatch, `no background on .${utility}`);
  return bgMatch[1].trim();
}

function parseRgbTriplet(value) {
  const rgba = value.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (rgba) {
    return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])];
  }
  const varRgb = value.match(
    /rgba\(var\(--c-color-[^)]+\)\s*,\s*([\d.]+)\)/,
  );
  if (varRgb) {
    return null;
  }
  return null;
}

function colorDistance(a, b) {
  return Math.max(
    Math.abs(a[0] - b[0]),
    Math.abs(a[1] - b[1]),
    Math.abs(a[2] - b[2]),
  );
}

const trackBg = extractUtilityBackground(result.css, 'bg-md-light-surface-variant');
const surfaceBg = extractUtilityBackground(result.css, 'bg-md-light-surface');

assert.notEqual(
  trackBg,
  surfaceBg,
  'progressbar track utility must not equal surface utility (zero contrast)',
);

const trackRgb = parseRgbTriplet(trackBg);
const surfaceRgb = parseRgbTriplet(surfaceBg);
if (trackRgb && surfaceRgb) {
  assert.ok(
    colorDistance(trackRgb, surfaceRgb) >= 8,
    `track vs surface contrast too low (${trackRgb} vs ${surfaceRgb})`,
  );
}

assert.match(
  trackBg,
  /rgb\(var\(--c-color-md-light-surface-variant\)\s*\/\s*1\)/,
  'track utility must use rgb(var(--c-color-* ) / 1)',
);
assert.doesNotMatch(
  trackBg,
  /transparent|#0000/,
  'track utility must resolve to a visible background',
);

console.log('test-progressbar-material-colors: ok');