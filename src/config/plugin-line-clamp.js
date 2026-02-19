const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const lineClampUtilities = {};

  // Generate line-clamp utilities for 1-12 lines
  for (let i = 1; i <= 12; i++) {
    lineClampUtilities[`.line-clamp-${i}`] = {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': `${i}`,
    };
  }

  lineClampUtilities['.line-clamp-none'] = {
    overflow: 'visible',
    display: 'block',
    '-webkit-box-orient': 'unset',
    '-webkit-line-clamp': 'unset',
  };

  addUtilities(lineClampUtilities);
});
