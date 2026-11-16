import assert from 'node:assert/strict';
import { ProgressbarColors } from '../src/shared/colors/ProgressbarColors.js';
import { ProgressbarClasses } from '../src/shared/classes/ProgressbarClasses.js';

const dark = (classNames) => (classNames ? classNames : '');
const colors = ProgressbarColors({}, dark);
const classes = ProgressbarClasses(colors);

assert.match(String(classes.base.material), /bg-md-light-surface-variant/);
assert.doesNotMatch(String(classes.base.ios), /bg-black\/30.*bg-black\/30/);
assert.match(String(classes.base.ios), /bg-black\/30/);

console.log('test-progressbar-material-colors: ok');