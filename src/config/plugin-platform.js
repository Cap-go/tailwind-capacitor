const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addVariant }) {
  // Platform variants
  addVariant('ios', '@supports (-webkit-touch-callout: none)');
  addVariant('android', '@supports not (-webkit-touch-callout: none)');
  addVariant('capacitor', '.capacitor &');
  addVariant('electron', '.electron &');
  addVariant('cordova', '.cordova &');
  
  // Device variants
  addVariant('mobile', '@media (max-width: 767px)');
  addVariant('tablet', '@media (min-width: 768px) and (max-width: 1023px)');
  addVariant('desktop', '@media (min-width: 1024px)');
  
  // Orientation variants
  addVariant('portrait', '@media (orientation: portrait)');
  addVariant('landscape', '@media (orientation: landscape)');
  
  // Theme variants
  addVariant('theme-ios', '.c-ios &, .ios &');
  addVariant('theme-material', '.c-material &, .md &');
});

