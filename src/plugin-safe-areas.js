module.exports = (({ addUtilities, addBase, theme, e }) => {
    const base = {
      ':root': {
        '--c-safe-area-left': '0px',
        '--c-safe-area-right': '0px',
        '--c-safe-area-top': '0px',
        '--c-safe-area-bottom': '0px',
      },

      '@supports (left: env(safe-area-inset-left))': {
        '.safe-areas': {
          '--c-safe-area-left': 'env(safe-area-inset-left)',
          '--c-safe-area-right': 'env(safe-area-inset-right)',
          '--c-safe-area-top': 'env(safe-area-inset-top)',
          '--c-safe-area-bottom': 'env(safe-area-inset-bottom)',
        },
      },
    };
    const safe = {
      '.no-safe-areas': {
        '--c-safe-area-left': '0px',
        '--c-safe-area-right': '0px',
        '--c-safe-area-top': '0px',
        '--c-safe-area-bottom': '0px',
      },
      '.no-safe-areas-top': {
        '--c-safe-area-top': '0px',
      },
      '.no-safe-areas-left': {
        '--c-safe-area-left': '0px',
      },
      '.no-safe-areas-right': {
        '--c-safe-area-right': '0px',
      },
      '.no-safe-areas-bottom': {
        '--c-safe-area-bottom': '0px',
      },
    };
    const spacing = theme('spacing');
    ['top', 'right', 'bottom', 'left'].forEach((side) => {
      const first = side[0];
      const upper = `${side[0].toUpperCase()}${side.slice(1)}`;

      safe[`.p${first}-safe`] = {
        [`padding${upper}`]: `var(--c-safe-area-${side})`,
      };
      safe[`.m${first}-safe`] = {
        [`margin${upper}`]: `var(--c-safe-area-${side})`,
      };
      safe[`.${side}-safe`] = {
        [side]: `var(--c-safe-area-${side})`,
      };

      Object.keys(spacing).forEach((key) => {
        const value = spacing[key];
        safe[`.p${first}-${e(key)}-safe`] = {
          [`padding${upper}`]: `calc(var(--c-safe-area-${side}) + ${value})`,
        };
        safe[`.m${first}-${e(key)}-safe`] = {
          [`margin${upper}`]: `calc(var(--c-safe-area-${side}) + ${value})`,
        };
        safe[`.${side}-${e(key)}-safe`] = {
          [side]: `calc(var(--c-safe-area-${side}) + ${value})`,
        };
      });
    });
    ['start', 'end'].forEach((side) => {
      const first = side[0];
      const areaSide = side === 'start' ? 'left' : 'right';
      safe[`.p${first}-safe`] = {
        [`padding-inline-${side}`]: `var(--c-safe-area-${areaSide})`,
      };
      safe[`.m${first}-safe`] = {
        [`margin-inline-${side}`]: `var(--c-safe-area-${areaSide})`,
      };
      safe[`.${side}-safe`] = {
        [`inset-inline-${side}`]: `var(--c-safe-area-${areaSide})`,
      };

      Object.keys(spacing).forEach((key) => {
        const value = spacing[key];
        safe[`.p${first}-${e(key)}-safe`] = {
          [`padding-inline-${side}`]: `calc(var(--c-safe-area-${areaSide}) + ${value})`,
        };
        safe[`.m${first}-${e(key)}-safe`] = {
          [`margin-inline-${side}`]: `calc(var(--c-safe-area-${areaSide}) + ${value})`,
        };
        safe[`.${side}-${e(key)}-safe`] = {
          [`inset-inline-${side}`]: `calc(var(--c-safe-area-${areaSide}) + ${value})`,
        };
      });
    });
    addBase(base);
    addUtilities(safe);
  });
