import assert from 'node:assert/strict';
import { ButtonColors } from '../src/shared/colors/ButtonColors.js';

const dark = (classNames) => (classNames ? classNames : '');

const defaults = ButtonColors({}, dark);
assert.equal(defaults.tonalActiveBgIos, 'active:bg-primary/25');

const limeOnly = ButtonColors({ tonalBgIos: 'bg-lime-500' }, dark);
assert.equal(limeOnly.tonalActiveBgIos, 'active:bg-lime-500/25');

const limeExplicit = ButtonColors(
  {
    tonalBgIos: 'bg-lime-500',
    tonalActiveBgIos: 'active:bg-lime-700',
  },
  dark,
);
assert.equal(limeExplicit.tonalActiveBgIos, 'active:bg-lime-700');

const slashOverride = ButtonColors({ tonalBgIos: 'bg-red-500/15' }, dark);
assert.equal(slashOverride.tonalActiveBgIos, 'active:bg-red-500/25');

const combined = ButtonColors(
  {
    tonalBgIos: 'bg-lime-500',
    tonalTextIos: 'text-lime-950',
  },
  dark,
);
assert.match(combined.tonalActiveBgIos, /^active:bg-lime-500\//);

console.log('test-button-tonal-colors: ok');