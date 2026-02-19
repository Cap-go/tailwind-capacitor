const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const hairlineUtilities = {
    '.hairline-t': {
      borderTopWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-r': {
      borderRightWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-b': {
      borderBottomWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-l': {
      borderLeftWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-x': {
      borderLeftWidth: 'calc(1px / var(--c-device-pixel-ratio))',
      borderRightWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-y': {
      borderTopWidth: 'calc(1px / var(--c-device-pixel-ratio))',
      borderBottomWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline': {
      borderWidth: 'calc(1px / var(--c-device-pixel-ratio))',
    },
    '.hairline-color': {
      borderColor: 'var(--c-hairline-color)',
    },
  };

  addUtilities(hairlineUtilities);
});
