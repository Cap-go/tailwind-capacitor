const plugin = require('tailwindcss/plugin');
const hexToRgb = require('./hex-to-rgb.js');
const iosColors = require('./ios-colors.js');
const mdColors = require('./md-colors.js');

module.exports = (({ addBase, config }) => {
    let iosFont =
    '-apple-system, SF Pro Text, SF UI Text, system-ui, Helvetica Neue, Helvetica, Arial, sans-serif';
  let materialFont = 'Roboto, system-ui, Noto, Helvetica, Arial, sans-serif';

  const getFonts = (ff) => {
    if (ff.ios) {
      iosFont = Array.isArray(ff.ios) ? ff.ios.join(', ') : ff.ios;
    }
    if (ff.material) {
      materialFont = Array.isArray(ff.material)
        ? ff.material.join(', ')
        : ff.material;
    }
  };
  if (
    config('fontFamily')
  ) {
    getFonts(config('fontFamily'));
  }
    const darkMode = config('darkMode');
    let darkProps = {};
    if (darkMode === 'class') {
      darkProps = {
        '.dark': {
          backgroundColor: '#000',
          '--c-hairline-color': 'rgba(255, 255, 255, 0.15)',
          color: '#fff',
        },
      };
    } else if (darkMode === 'media') {
      darkProps = {
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            backgroundColor: '#000',
            '--c-hairline-color': 'rgba(255, 255, 255, 0.15)',
            color: '#fff',
          },
        },
      };
    }

    const primaryColors = {
      ...iosColors(config('colors.primary')),
      ...mdColors(config('colors.primary')),
    };
    Object.keys(config('colors')).forEach((key) => {
      primaryColors[key] = config('colors')[key];
    });
    const primaryColorVars = {};

    Object.keys(primaryColors).forEach((key) => {
      primaryColorVars[`--c-color-${key}`] = hexToRgb(primaryColors[key]).join(
        ' '
      );
    });

    addBase({
      ':root': {
        '--c-device-pixel-ratio': '1',
        '--c-hairline-color': 'rgba(0, 0, 0, 0.2)',
        '--c-rtl-reverse': '1',
        ...primaryColorVars,
      },
      '[dir="rtl"]': {
        '--c-rtl-reverse': '-1',
      },
      ...darkProps,
      '@media (min-resolution: 1.25dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '1.25',
        },
      },
      '@media (min-resolution: 1.5dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '1.5',
        },
      },
      '@media (min-resolution: 1.75dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '1.75',
        },
      },
      '@media (min-resolution: 2dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '2',
        },
      },
      '@media (min-resolution: 2.25dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '2.25',
        },
      },
      '@media (min-resolution: 2.5dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '2.5',
        },
      },
      '@media (min-resolution: 3dppx)': {
        ':root': {
          '--c-device-pixel-ratio': '3',
        },
      },
      '*': {
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        '-webkit-text-size-adjust': '100%',
      },
      body: {
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
      },
      '.c-ios, .ios': {
        'font-family': iosFont,
      },
      '.c-material, .md': {
        'font-family': materialFont,
      },
    });
  });
