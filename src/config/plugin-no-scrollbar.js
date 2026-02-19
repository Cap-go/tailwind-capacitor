const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const noScrollbarUtilities = {
    '.no-scrollbar': {
      'scrollbar-width': 'none',
      '-ms-overflow-style': 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
  };

  addUtilities(noScrollbarUtilities);
});
