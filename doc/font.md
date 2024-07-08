By default there are following font family rules used in Tailwind Capacitor:

-   for iOS theme: `-apple-system, SF Pro Text, SF UI Text, system-ui, Helvetica Neue, Helvetica, Arial, sans-serif`
-   for Material theme: `Roboto, system-ui, Noto, Helvetica, Arial, sans-serif`

You can override them in `tailwind.config.js` in the following way:

```js

module.exports = {
  theme: {
    fontFamily: {
      ios: 'my-ios-font',
      material: 'my-material-font',
    }
  }
  ...
};
```

[useTheme](/use-theme)
