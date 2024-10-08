Tailwind Capacitor comes with implementation of Material Design Touch Ripple effect.

It is enabled by default for Material theme.

With these extra utility classes we can control touch ripple "wave" color:

| Class | CSS |  |
| --- | --- | --- |
| `.touch-ripple-current` | `--c-touch-ripple-color: rgba(0, 0, 0, 0.1)` | Inherits touch ripple color from parent element's text color |
| `.touch-ripple-black` | `--c-touch-ripple-color: rgba(255, 255, 255, 0.15)` | Makes touch ripple black |
| `.touch-ripple-white` | `--c-touch-ripple-color: currentColor` | Makes touch ripple white |
| `.touch-ripple-[color]` | `--c-touch-ripple-color: rgba([color], 0.25)` | Makes touch ripple of specified color |

For example:

```html
<!-- Makes button with red touch ripple --> <button class="touch-ripple-red-500">Click me</button>
```
