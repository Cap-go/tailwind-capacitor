# tailwind-capacitor
<a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>
  
<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

Tailwind plugin for capacitor apps

## Version Compatibility

- **Use v4** for Tailwind CSS 4.x
- **Use v1.0.8** for Tailwind CSS 3.x

## How to use

1. Add the plugin to your project
```bash
npm install --save-dev tailwind-capacitor
```

2. Add the plugin to your CSS (Tailwind CSS 4.x)
```css
@import "tailwindcss";
// minimum
@plugin "@capgo/tailwind-capacitor/platform";
@plugin "@capgo/tailwind-capacitor/safe-areas";
// recommended
@plugin "@capgo/tailwind-capacitor/colors";
@plugin "@capgo/tailwind-capacitor/hairlines";
@plugin "@capgo/tailwind-capacitor/ios-material";
@plugin "@capgo/tailwind-capacitor/line-clamp";
@plugin "@capgo/tailwind-capacitor/no-scrollbar";
@plugin "@capgo/tailwind-capacitor/preloader";
@plugin "@capgo/tailwind-capacitor/range";
@plugin "@capgo/tailwind-capacitor/touch-ripple";
@plugin "@capgo/tailwind-capacitor/touch";
@plugin "@capgo/tailwind-capacitor/translucent";
```

Or for Tailwind CSS 3.x config style, add to your tailwind config:
```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailwind-capacitor').platform,
    require('tailwind-capacitor').safeAreas,
    require('tailwind-capacitor').colors,
    require('tailwind-capacitor').hairlines,
    require('tailwind-capacitor').touchRipple,
    require('tailwind-capacitor').iosMaterial,
    require('tailwind-capacitor').lineClamp,
    require('tailwind-capacitor').translucent,
    require('tailwind-capacitor').range,
    require('tailwind-capacitor').touch,
    require('tailwind-capacitor').noScrollbar,
  ],
}
```

## Basic Example

```vue
<template>
  <TailwindCapacitorProvider>
    <App>
      <Page>
        <Navbar title="My App" />
        
        <Block>
          <Button fill="ios:outline md:fill">
            My Button
          </Button>
          
          <List>
            <ListItem title="Item 1" />
            <ListItem title="Item 2" />
          </List>
        </Block>
      </Page>
    </App>
  </TailwindCapacitorProvider>
</template>

<script setup>
import { 
  TailwindCapacitorProvider,
  App, 
  Page, 
  Navbar, 
  Block, 
  Button, 
  List, 
  ListItem 
} from 'tailwind-capacitor/vue'
</script>
```

Documentation for each plugin can be found here:
- [Platform](https://github.com/Cap-go/tailwind-capacitor/blob/main/docs/platform.md)
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
