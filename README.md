# tailwind-capacitor
Tailwind plugin for capacitor apps


How to use
----------

1. Add the plugin to your project
```bash
npm install --save-dev @tailwindcss/capacitor
```

2. Add the plugin to your tailwind config
```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/capacitor').safeAreas,
    require('@tailwindcss/capacitor').colors,
    require('@tailwindcss/capacitor').hairlines,
    require('@tailwindcss/capacitor').touchRipple,
    require('@tailwindcss/capacitor').iosMaterial,
    require('@tailwindcss/capacitor').lineClamp,
    require('@tailwindcss/capacitor').translucent,
    require('@tailwindcss/capacitor').range,
    require('@tailwindcss/capacitor').touch,
    require('@tailwindcss/capacitor').noScrollbar,
  ],
}
```

Documentation for each plugin can be found here:
- [Safe Areas](/doc/safearea.md)
- [Colors](/doc/colors.md)
- [Hairlines](/doc/hairlines.md)
- [Touch Ripple](/doc/touch-ripple.md)
- [iOS Material](/doc/ios-material.md)
- [Line Clamp](/doc/line-clamp.md)
- [Translucent](/doc/translucent.md)
- [Range](/doc/range.md)
- [Touch](/doc/touch.md)
- [No Scrollbar](/doc/no-scrollbar.md)

# Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
