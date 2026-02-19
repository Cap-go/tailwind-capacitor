const plugin = require('tailwindcss/plugin');
const hexToRgb = require('./hex-to-rgb.js');
const iosColors = require('./ios-colors.js');
const mdColors = require('./md-colors.js');

module.exports = plugin(function({ addBase, theme }) {
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
  theme('fontFamily')
) {
  getFonts(theme('fontFamily'));
}
  const darkMode = theme('darkMode');
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
    ...iosColors(theme('colors.primary')),
    ...mdColors(theme('colors.primary')),
  };
  Object.keys(theme('colors')).forEach((key) => {
    primaryColors[key] = theme('colors')[key];
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
      '--c-primary': 'rgba(var(--c-primary-rgb))',
      '--c-primary-rgb': '59, 130, 246',
      '--c-success': 'rgba(var(--c-success-rgb))',
      '--c-success-rgb': '16, 185, 129',
      '--c-warning': 'rgba(var(--c-warning-rgb))',
      '--c-warning-rgb': '245, 158, 11',
      '--c-danger': 'rgba(var(--c-danger-rgb))',
      '--c-danger-rgb': '239, 68, 68',
      '--c-info': 'rgba(var(--c-info-rgb))',
      '--c-info-rgb': '59, 130, 246',
      '--c-dark': 'rgba(var(--c-dark-rgb))',
      '--c-dark-rgb': '17, 24, 39',
      '--c-medium': 'rgba(var(--c-medium-rgb))',
      '--c-medium-rgb': '107, 114, 128',
      '--c-light': 'rgba(var(--c-light-rgb))',
      '--c-light-rgb': '249, 250, 251',
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
