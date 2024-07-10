Translucent utility class adds backdrop blur to element. By default it is used in iOS styles for some components.

| Class | CSS |
| --- | --- |
| `translucent` | 
```css
@supports (backdrop-filter: blur(20px)) {
  .translucent {
    --tw-bg-opacity: 0.8 !important;
    backdrop-filter: saturate(180%) blur(20px);
  }
}
```

 |
