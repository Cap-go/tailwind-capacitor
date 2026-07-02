const assert = require('assert');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const joinSafeClassSelector = require('../src/config/join-safe-class-selector.js');
const safeAreas = require('../src/config/plugin-safe-areas.js');

assert.equal(joinSafeClassSelector('top', '0.5', 'safe'), '.top-0\\.5-safe');
assert.equal(joinSafeClassSelector('mr', '1.5', 'safe'), '.mr-1\\.5-safe');

async function assertGeneratedCss() {
  const result = await postcss([
    tailwindcss({
      content: [
        {
          raw: '<div class="top-0.5-safe pt-1.5-safe mb-2.5-safe"></div>',
          extension: 'html',
        },
      ],
      plugins: [safeAreas],
    }),
  ]).process('@tailwind utilities', { from: undefined });

  assert.ok(
    !/\.[a-z]+-\d+\.\d+-safe/.test(result.css),
    'found unescaped fractional safe-area selector in generated CSS'
  );
  assert.ok(
    result.css.includes('top-0\\.5-safe') || result.css.includes('.top-0\\.5-safe'),
    'expected escaped top-0.5-safe utility in generated CSS'
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
