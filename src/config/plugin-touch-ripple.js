const hexToRgb = require('./hex-to-rgb.js');

module.exports = (({ addUtilities, addBase, theme }) => {
    addBase({
      // prettier-ignore
      ':root': {
        '--c-touch-ripple-opacity': '0.15',
        '--c-touch-ripple-black': 'rgba(0, 0, 0, var(--c-touch-ripple-opacity))',
        '--c-touch-ripple-white': 'rgba(255, 255, 255, var(--c-touch-ripple-opacity))',
        '--c-touch-ripple-color': 'var(--c-touch-ripple-black)',
      },
      '.c-touch-ripple-wave': {
        left: '0',
        top: '0',
        position: 'absolute !important',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '-1',
        padding: '0',
        margin: '0',
        fontSize: '0',
        transform: 'translate3d(0px, 0px, 0) scale(0)',
        backgroundColor: 'var(--c-touch-ripple-color)',
        animation: 'c-touch-ripple-in 200ms forwards',
        display: 'block !important',
        '&.c-touch-ripple-wave-out': {
          transform: 'var(--c-ripple-transform)',
          animation: 'c-touch-ripple-out 300ms forwards',
        },
      },
      '@keyframes c-touch-ripple-in': {
        from: {
          transform: 'translate3d(0px, 0px, 0) scale(0)',
        },
        to: {
          transform: 'var(--c-ripple-transform)',
        },
      },
      '@keyframes c-touch-ripple-out': {
        from: {
          opacity: '1',
        },
        to: {
          opacity: '0',
        },
      },
    });
    const themeColors = theme('colors');

    const touchRippleColors = {
      '.touch-ripple-current': {
        '--c-touch-ripple-color': 'currentColor',
      },
    };

    Object.keys(themeColors).forEach((key) => {
      let value = themeColors[key];
      if (typeof value === 'string') {
        if (value[0] === '#') {
          const [r, g, b] = hexToRgb(value);
          value = `rgba(${r}, ${g}, ${b}, var(--c-touch-ripple-opacity))`;
        }
        if (value.includes('<alpha-value>')) {
          value = value.replace(
            '<alpha-value>',
            'var(--c-touch-ripple-opacity)'
          );
        }
        touchRippleColors[`.touch-ripple-${key}`] = {
          '--c-touch-ripple-color': value,
        };
      } else {
        Object.keys(value).forEach((subKey) => {
          let subValue = value[subKey];
          if (subValue[0] === '#') {
            const [r, g, b] = hexToRgb(subValue);
            subValue = `rgba(${r}, ${g}, ${b}, var(--c-touch-ripple-opacity))`;
          }
          if (subKey === 'DEFAULT') {
            touchRippleColors[`.touch-ripple-${key}`] = {
              '--c-touch-ripple-color': subValue.replace(
                '<alpha-value>',
                'var(--c-touch-ripple-opacity)'
              ),
            };
          } else {
            touchRippleColors[`.touch-ripple-${key}-${subKey}`] = {
              '--c-touch-ripple-color': subValue.replace(
                '<alpha-value>',
                'var(--c-touch-ripple-opacity)'
              ),
            };
          }
        });
      }
    });
    Object.assign(touchRippleColors, {
      '.touch-ripple-black': {
        '--c-touch-ripple-color': 'var(--c-touch-ripple-black)',
      },
      '.touch-ripple-white': {
        '--c-touch-ripple-color': 'var(--c-touch-ripple-white)',
      },
    });

    addUtilities(touchRippleColors, ['dark']);
  });
