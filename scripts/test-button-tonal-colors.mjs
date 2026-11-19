import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { ButtonColors, tonalActiveBgIosScanHints } from '../src/shared/colors/ButtonColors.js';
import { fileURLToPath } from 'node:url';
import { repoRoot } from './repo-root.mjs';

const dark = (classNames) => (classNames ? classNames : '');

const defaults = ButtonColors({}, dark);
assert.equal(defaults.tonalActiveBgIos, 'active:!bg-primary/25');

const limeOnly = ButtonColors({ tonalBgIos: 'bg-lime-500' }, dark);
assert.equal(limeOnly.tonalActiveBgIos, 'active:!bg-lime-500/25');

const limeExplicit = ButtonColors(
  {
    tonalBgIos: 'bg-lime-500',
    tonalActiveBgIos: 'active:bg-lime-700',
  },
  dark,
);
assert.equal(limeExplicit.tonalActiveBgIos, 'active:bg-lime-700');

const slashOverride = ButtonColors({ tonalBgIos: 'bg-red-500/15' }, dark);
assert.equal(slashOverride.tonalActiveBgIos, 'active:!bg-red-500/25');

const arbitraryOpacity = ButtonColors({ tonalBgIos: 'bg-pink-500/[71.37%]' }, dark);
assert.equal(arbitraryOpacity.tonalActiveBgIos, 'active:!bg-primary/25');

const arbitraryHex = ButtonColors({ tonalBgIos: 'bg-[#22c55e]' }, dark);
assert.equal(arbitraryHex.tonalActiveBgIos, 'active:!bg-[#22c55e]/25');

const combined = ButtonColors(
  {
    tonalBgIos: 'bg-lime-500',
    tonalTextIos: 'text-lime-950',
  },
  dark,
);
assert.match(combined.tonalActiveBgIos, /^active:!bg-lime-500\//);

assert.match(tonalActiveBgIosScanHints, /active:!bg-primary\/25/);

const sync = spawnSync('npm', ['run', 'generate:css'], {
  cwd: repoRoot,
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
  /active\\:\\!bg-primary\\\/25/,
  'tailwind-capacitor.css must emit default tonal active utility',
);
assert.match(
  result.css,
  /active\\:\\!bg-lime-500\\\/25/,
  'tailwind-capacitor.css must emit lime tonal active utility',
);

console.log('test-button-tonal-colors: ok');