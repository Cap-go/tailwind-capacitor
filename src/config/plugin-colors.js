const hexToRgb = require('./hex-to-rgb.js');
const iosColors = require('./ios-colors.js');
const mdColors = require('./md-colors.js');

const rulesForColor = (name, hex) => {
  if (!hex.includes('#') || name === 'primary') return {};
  const data = {};
  const colors = {
    primary: hex,
    ...iosColors(hex),
    ...mdColors(hex),
  };
  Object.keys(colors).forEach((key) => {
    data[`--c-color-${key}`] = hexToRgb(colors[key]).join(' ');
  });

  return {
    [`.c-color-${name}`]: data,
  };
};

module.exports = (({ addUtilities, config }) => {
    const themeColors = config('theme.colors');

    const colors = {};

    Object.keys(themeColors).forEach((name) => {
      Object.assign(colors, rulesForColor(name, themeColors[name]));
    });

    addUtilities(colors);
  });
