const plugin = require('tailwindcss/plugin');
const hexToRgb = require('./hex-to-rgb.js');
const iosColors = require('./ios-colors.js');
const mdColors = require('./md-colors.js');

module.exports = plugin(function({ addUtilities, theme, addBase }) {
  const themeColors = theme('colors');
  const colorVariables = {};

  // Create CSS custom properties for all theme colors
  Object.keys(themeColors).forEach((colorName) => {
    const colorValue = themeColors[colorName];
    if (typeof colorValue === 'string') {
      const rgb = hexToRgb(colorValue);
      colorVariables[`--c-color-${colorName}`] = rgb.join(' ');
    } else if (typeof colorValue === 'object') {
      Object.keys(colorValue).forEach((shade) => {
        const rgb = hexToRgb(colorValue[shade]);
        colorVariables[`--c-color-${colorName}-${shade}`] = rgb.join(' ');
      });
    }
  });

  // Add color variables to :root
  addBase({
    ':root': colorVariables
  });

  // Generate color utilities that use the CSS custom properties
  const colorUtilities = {};
  
  Object.keys(themeColors).forEach((colorName) => {
    const colorValue = themeColors[colorName];
    if (typeof colorValue === 'string') {
      colorUtilities[`.text-${colorName}`] = {
        color: `rgba(var(--c-color-${colorName}), 1)`
      };
      colorUtilities[`.bg-${colorName}`] = {
        backgroundColor: `rgba(var(--c-color-${colorName}), 1)`
      };
      colorUtilities[`.border-${colorName}`] = {
        borderColor: `rgba(var(--c-color-${colorName}), 1)`
      };
    } else if (typeof colorValue === 'object') {
      Object.keys(colorValue).forEach((shade) => {
        colorUtilities[`.text-${colorName}-${shade}`] = {
          color: `rgba(var(--c-color-${colorName}-${shade}), 1)`
        };
        colorUtilities[`.bg-${colorName}-${shade}`] = {
          backgroundColor: `rgba(var(--c-color-${colorName}-${shade}), 1)`
        };
        colorUtilities[`.border-${colorName}-${shade}`] = {
          borderColor: `rgba(var(--c-color-${colorName}-${shade}), 1)`
        };
      });
    }
  });

  addUtilities(colorUtilities);
});
