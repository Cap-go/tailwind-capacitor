const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const rangeUtilities = {
    '.range': {
      '-webkit-appearance': 'none',
      appearance: 'none',
      height: '2px',
      background: 'rgba(0, 0, 0, 0.1)',
      outline: 'none',
      borderRadius: '1px',
      
      '&::-webkit-slider-thumb': {
        '-webkit-appearance': 'none',
        appearance: 'none',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'currentColor',
        cursor: 'pointer',
      },
      
      '&::-moz-range-thumb': {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'currentColor',
        cursor: 'pointer',
        border: 'none',
      },
    },
  };

  addUtilities(rangeUtilities);
});
