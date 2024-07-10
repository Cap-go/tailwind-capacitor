# tailwind-capacitor
<a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>
  
<div align="center">
<h2><a href="https://capgo.app/">Check out: Capgo — live updates for capacitor</a></h2>
</div>

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
- [Safe Areas](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/safe-areas.md)
- [Colors](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/colors.md)
- [Hairlines](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/hairlines.md)
- [Touch Ripple](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/touch-ripple.md)
- [iOS Material](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/ios-material.md)
- [Line Clamp](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/line-clamp.md)
- [Translucent](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/translucent.md)
- [Range](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/range.md)
- [Touch](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/touch.md)
- [No Scrollbar](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/no-scrollbar.md)

# Credits

Tailwind Capacitor is a fork of [Konsta UI](https://github.com/konstaui/konstaui) and [Tailwind CSS](https://tailwindcss.com/).
