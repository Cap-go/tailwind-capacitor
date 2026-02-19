const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const preloaderUtilities = {
    '.preloader': {
      display: 'inline-block',
      animation: 'preloader-spin 1s linear infinite',
    },
    '.preloader-ios': {
      width: '20px',
      height: '20px',
      background: 'conic-gradient(from 0deg, transparent, currentColor)',
      borderRadius: '50%',
      maskImage: 'radial-gradient(circle, transparent 40%, black 40%)',
      WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 40%)',
    },
    '.preloader-material': {
      width: '20px',
      height: '20px',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
    },
  };

  const preloaderKeyframes = {
    '@keyframes preloader-spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  };

  addUtilities(preloaderUtilities);
  addUtilities(preloaderKeyframes);
});
