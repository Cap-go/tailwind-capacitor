Translucent utility class adds backdrop blur to element. By default it is used in iOS styles for some components.

| Class | CSS |
| --- | --- |
| `translucent` | 
```css
.translucent {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}
```

 |

Tailwind v4 ships the same behavior through `@utility translucent` in `tailwind-capacitor.css`. Use slash opacity utilities (`bg-black/50`) for semi transparent fills instead of the legacy `--tw-bg-opacity` variable.