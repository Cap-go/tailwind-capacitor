const plugin = require('tailwindcss/plugin');

const base = require('./src/config/plugin-base.js');
const colors = require('./src/config/plugin-colors.js');
const hairlines = require('./src/config/plugin-hairlines.js');
const iosMaterial = require('./src/config/plugin-ios-material.js');
const lineClamp = require('./src/config/plugin-line-clamp.js');
const noScrollbar = require('./src/config/plugin-no-scrollbar.js');
const preloader = require('./src/config/plugin-preloader.js');
const range = require('./src/config/plugin-range.js');
const safeAreas = require('./src/config/plugin-safe-areas.js');
const touchRipple = require('./src/config/plugin-touch-ripple.js');
const touch = require('./src/config/plugin-touch.js');
const translucent = require('./src/config/plugin-translucent.js');
const platform = require('./src/config/plugin-platform.js');

// Export individual plugins
module.exports = {
  base,
  colors,
  hairlines,
  iosMaterial,
  lineClamp,
  noScrollbar,
  preloader,
  range,
  safeAreas,
  touchRipple,
  touch,
  translucent,
  platform,
  
  // Default export combines all plugins
  default: plugin.withOptions((options = {}) => {
    return function(pluginApi) {
      // Apply all plugins
      base(pluginApi);
      colors(pluginApi);
      hairlines(pluginApi);
      iosMaterial(pluginApi);
      lineClamp(pluginApi);
      noScrollbar(pluginApi);
      preloader(pluginApi);
      range(pluginApi);
      safeAreas(pluginApi);
      touchRipple(pluginApi);
      touch(pluginApi);
      translucent(pluginApi);
      platform(pluginApi);
    };
  })
}; 
