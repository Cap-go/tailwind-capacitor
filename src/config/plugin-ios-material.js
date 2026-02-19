const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const iosMaterialUtilities = {
    '.c-ios': {
      '--c-theme': 'ios',
    },
    '.ios': {
      '--c-theme': 'ios',
    },
    '.c-material': {
      '--c-theme': 'material',
    },
    '.md': {
      '--c-theme': 'material',
    },
    '.theme-ios': {
      '--c-theme': 'ios',
    },
    '.theme-material': {
      '--c-theme': 'material',
    },
    '.theme-md': {
      '--c-theme': 'material',
    },
  };

  addUtilities(iosMaterialUtilities);
});
