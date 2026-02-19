const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addUtilities }) {
  const touchRippleUtilities = {
    '.touch-ripple': {
      position: 'relative',
      overflow: 'hidden',
      
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0',
        height: '0',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.3s, height 0.3s',
        pointerEvents: 'none',
      },
      
      '&:active::before': {
        width: '200px',
        height: '200px',
      },
    },
    
    '.touch-ripple-dark': {
      '&::before': {
        background: 'rgba(0, 0, 0, 0.1)',
      },
    },
  };

  addUtilities(touchRippleUtilities);
});
