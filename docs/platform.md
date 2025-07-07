# Platform

Platform plugin adds `ios:` and `android:` variants to target platform-specific styles in Capacitor apps.

## Usage

The plugin adds two variants:
- `ios:` - targets iOS devices (when `.ios` class is present)
- `android:` - targets Android devices (when `.md` class is present)

```html
<div class="ios:bg-primary android:bg-secondary">
  This div will have a primary background color on iOS and a secondary background color on Android.
</div>

<button class="ios:rounded-lg android:rounded-md ios:shadow-sm android:shadow-lg">
  Different styling per platform
</button>

<p class="ios:text-blue-500 android:text-green-500">
  Platform-specific text colors
</p>
```

## How it works

The variants work by targeting parent classes that are typically set on the root element:
- `ios:` variant targets `.ios &` selector
- `android:` variant targets `.md &` selector

These classes are usually added by Capacitor or your app's platform detection logic. 
