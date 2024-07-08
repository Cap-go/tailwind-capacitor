-   [Primary Color](/touch-action#primary-color)
-   [Secondary Colors](/touch-action#secondary-colors)

## [](/touch-action#primary-color)Primary Color

Colors in Tailwind Capacitor are a bit tricky, because for example "Material You" design comes with whole set of different colors.

Tailwind Capacitor generate all required colors automatically, based on colors provided in `colors` section of tailwind config.

```js
// tailwind.config.js

module.exports = {
  /*
   * "Usual" tailwind colors can be used for some custom elements and styling.
   * These colors will not suite for Tailwind Capacitor components theming
   */
  theme: {
    extend: {
      colors: {
        'my-red': '#ff0000',
        primary: '#007aff'
      }
    }
  }
  // rest of your usual Tailwind CSS config here
  ...
};
```

Based on the given `primary` color, Tailwind Capacitor config will generate the following `theme.extend.colors` in your config:

```js

// will be added automatically to Tailwind config:

theme: {
  extend: {
    colors: {
      // auto generated colors
      'primary': 'rgb(var(--c-color-primary) / <alpha-value>)',
      'md-light-primary': 'rgb(var(--c-color-md-light-primary) / <alpha-value>)',
      'md-light-on-primary': 'rgb(var(--c-color-md-light-on-primary) / <alpha-value>)',
      'md-light-primary-container': 'rgb(var(--c-color-md-light-primary-container) / <alpha-value>)',
      'md-light-on-primary-container': 'rgb(var(--c-color-md-light-on-primary-container) / <alpha-value>)',
      'md-light-secondary': 'rgb(var(--c-color-md-light-secondary) / <alpha-value>)',
      'md-light-on-secondary': 'rgb(var(--c-color-md-light-on-secondary) / <alpha-value>)',
      'md-light-secondary-container': 'rgb(var(--c-color-md-light-secondary-container) / <alpha-value>)',
      'md-light-on-secondary-container': 'rgb(var(--c-color-md-light-on-secondary-container) / <alpha-value>)',
      'md-light-surface': 'rgb(var(--c-color-md-light-surface) / <alpha-value>)',
      'md-light-on-surface': 'rgb(var(--c-color-md-light-on-surface) / <alpha-value>)',
      'md-light-surface-variant': 'rgb(var(--c-color-md-light-surface-variant) / <alpha-value>)',
      'md-light-on-surface-variant': 'rgb(var(--c-color-md-light-on-surface-variant) / <alpha-value>)',
      'md-light-outline': 'rgb(var(--c-color-md-light-outline) / <alpha-value>)',
      'md-light-outline-variant': 'rgb(var(--c-color-md-light-outline-variant) / <alpha-value>)',
      'md-light-surface-1': 'rgb(var(--c-color-md-light-surface-1) / <alpha-value>)',
      'md-light-surface-2': 'rgb(var(--c-color-md-light-surface-2) / <alpha-value>)',
      'md-light-surface-3': 'rgb(var(--c-color-md-light-surface-3) / <alpha-value>)',
      'md-light-surface-4': 'rgb(var(--c-color-md-light-surface-4) / <alpha-value>)',
      'md-light-surface-5': 'rgb(var(--c-color-md-light-surface-5) / <alpha-value>)',
      'md-dark-primary': 'rgb(var(--c-color-md-dark-primary) / <alpha-value>)',
      'md-dark-on-primary': 'rgb(var(--c-color-md-dark-on-primary) / <alpha-value>)',
      'md-dark-primary-container': 'rgb(var(--c-color-md-dark-primary-container) / <alpha-value>)',
      'md-dark-on-primary-container': 'rgb(var(--c-color-md-dark-on-primary-container) / <alpha-value>)',
      'md-dark-secondary': 'rgb(var(--c-color-md-dark-secondary) / <alpha-value>)',
      'md-dark-on-secondary': 'rgb(var(--c-color-md-dark-on-secondary) / <alpha-value>)',
      'md-dark-secondary-container': 'rgb(var(--c-color-md-dark-secondary-container) / <alpha-value>)',
      'md-dark-on-secondary-container': 'rgb(var(--c-color-md-dark-on-secondary-container) / <alpha-value>)',
      'md-dark-surface': 'rgb(var(--c-color-md-dark-surface) / <alpha-value>)',
      'md-dark-on-surface': 'rgb(var(--c-color-md-dark-on-surface) / <alpha-value>)',
      'md-dark-surface-variant': 'rgb(var(--c-color-md-dark-surface-variant) / <alpha-value>)',
      'md-dark-on-surface-variant': 'rgb(var(--c-color-md-dark-on-surface-variant) / <alpha-value>)',
      'md-dark-outline': 'rgb(var(--c-color-md-dark-outline) / <alpha-value>)',
      'md-dark-outline-variant': 'rgb(var(--c-color-md-dark-outline-variant) / <alpha-value>)',
      'md-dark-surface-1': 'rgb(var(--c-color-md-dark-surface-1) / <alpha-value>)',
      'md-dark-surface-2': 'rgb(var(--c-color-md-dark-surface-2) / <alpha-value>)',
      'md-dark-surface-3': 'rgb(var(--c-color-md-dark-surface-3) / <alpha-value>)',
      'md-dark-surface-4': 'rgb(var(--c-color-md-dark-surface-4) / <alpha-value>)',
      'md-dark-surface-5': 'rgb(var(--c-color-md-dark-surface-5) / <alpha-value>)',
      'ios-primary': 'rgb(var(--c-color-ios-primary) / <alpha-value>)',
      'ios-primary-tint': 'rgb(var(--c-color-ios-primary-tint) / <alpha-value>)',
      'ios-primary-shade': 'rgb(var(--c-color-ios-primary-shade) / <alpha-value>)'
      // static colors that you can override
      'ios-light-surface': '#efeff4',
      'ios-dark-surface': '#000',
      'ios-light-surface-1': '#fff',
      'ios-dark-surface-1': '#1c1c1d',
      'ios-light-surface-2': '#f7f7f8',
      'ios-dark-surface-2': '#121212',
      'ios-light-surface-3': '#fff',
      'ios-dark-surface-3': '#1c1c1d',
      'ios-light-surface-variant': '#f4f4f4',
      'ios-dark-surface-variant': '#232323',
    }
  }
}

```

## [](/touch-action#secondary-colors)Secondary Colors

If you want some secondary colors for Tailwind Capacitor components, let's say to make some button red, you need to specify these colors in `colors` in `tailwind.config.js`:

```js

module.exports = {
    colors: {
      // "primary" is the main app color, if not specified will be default to '#007aff'
      primary: '#007aff',
      // custom colors used for Tailwind Capacitor components theming
      'brand-red': '#ff0000',
      'brand-green': '#00ff00',
    }
  // rest of your usual Tailwind CSS config here
  ...
};

```

And to apply these colors, we need to add `c-color-[name]` class to required component, e.g.:

```jsx
<button>Usual Button</button> <button class="c-color-brand-red">Red Button</button> <button class="c-color-brand-green">Green Button</button>
```

Such colors will be correctly inherited, so `c-color-[name]` class can be added to parent elements as well, e.g.:

```jsx
<div class="c-color-brand-red"> <button>Red Button</button> <button>Red Button</button> <button>Red Button</button> </div>
```
