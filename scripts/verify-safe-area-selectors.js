const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const joinSafeClassSelector = require('../src/config/join-safe-class-selector.js');

assert.equal(joinSafeClassSelector('top', '0.5', 'safe'), '.top-0\\.5-safe');
assert.equal(joinSafeClassSelector('mr', '1.5', 'safe'), '.mr-1\\.5-safe');

async function assertGeneratedCss() {
  const from = `${process.cwd()}/registry/capacitor/styles/tailwind-capacitor.css`;
  const css = readFileSync(from, 'utf8');
  const result = await postcss([tailwindcss()]).process(css, { from });

  assert.ok(
    !/\.[a-z]+-\d+\.\d+-safe/.test(result.css),
    'found unescaped fractional safe-area selector in generated CSS',
  );
  assert.ok(
    result.css.includes('top-0\\.5-safe') || result.css.includes('.top-0\\.5-safe'),
    'expected escaped top-0.5-safe utility in generated CSS',
  );
}

assertGeneratedCss()
  .then(() => {
    console.log('verify-safe-area-selectors: ok');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
