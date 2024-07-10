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
- [Safe Areas](/blob/main/doc/safearea.md)
- [Colors](/blob/main/doc/colors.md)
- [Hairlines](/blob/main/doc/hairlines.md)
- [Touch Ripple](/blob/main/doc/touch-ripple.md)
- [iOS Material](/blob/main/doc/ios-material.md)
- [Line Clamp](/blob/main/doc/line-clamp.md)
- [Translucent](/blob/main/doc/translucent.md)
- [Range](/blob/main/doc/range.md)
- [Touch](/blob/main/doc/touch.md)
- [No Scrollbar](/blob/main/doc/no-scrollbar.md)

# Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
