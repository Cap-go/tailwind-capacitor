const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const touchUtilities = {
    '.touch-action-auto': {
      'touch-action': 'auto',
    },
    '.touch-action-none': {
      'touch-action': 'none',
    },
    '.touch-action-pan-x': {
      'touch-action': 'pan-x',
    },
    '.touch-action-pan-y': {
      'touch-action': 'pan-y',
    },
    '.touch-action-manipulation': {
      'touch-action': 'manipulation',
    },
    '.user-select-none': {
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none',
    },
    '.user-select-text': {
      '-webkit-user-select': 'text',
      '-moz-user-select': 'text',
      '-ms-user-select': 'text',
      'user-select': 'text',
    },
    '.user-select-all': {
      '-webkit-user-select': 'all',
      '-moz-user-select': 'all',
      '-ms-user-select': 'all',
      'user-select': 'all',
    },
    '.user-select-auto': {
      '-webkit-user-select': 'auto',
      '-moz-user-select': 'auto',
      '-ms-user-select': 'auto',
      'user-select': 'auto',
    },
  };

  addUtilities(touchUtilities);
});
