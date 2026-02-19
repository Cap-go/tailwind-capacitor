const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const translucentUtilities = {
    '.translucent': {
      'backdrop-filter': 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.9)',
    },
    '.translucent-dark': {
      'backdrop-filter': 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
      background: 'rgba(0, 0, 0, 0.9)',
    },
    '.translucent-glass': {
      'backdrop-filter': 'blur(20px) saturate(180%)',
      '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
      background: 'rgba(255, 255, 255, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    '.backdrop-blur-sm': {
      'backdrop-filter': 'blur(4px)',
      '-webkit-backdrop-filter': 'blur(4px)',
    },
    '.backdrop-blur': {
      'backdrop-filter': 'blur(8px)',
      '-webkit-backdrop-filter': 'blur(8px)',
    },
    '.backdrop-blur-md': {
      'backdrop-filter': 'blur(12px)',
      '-webkit-backdrop-filter': 'blur(12px)',
    },
    '.backdrop-blur-lg': {
      'backdrop-filter': 'blur(16px)',
      '-webkit-backdrop-filter': 'blur(16px)',
    },
    '.backdrop-blur-xl': {
      'backdrop-filter': 'blur(24px)',
      '-webkit-backdrop-filter': 'blur(24px)',
    },
  };

  addUtilities(translucentUtilities);
});
