# iOS and Material Design Variants for Tailwind CSS

This document describes the custom Tailwind CSS variants for iOS and Material design styles provided by the `plugin-ios-material.js` plugin.

## Overview

The plugin adds four custom variants to Tailwind CSS:

1. `material`: For Material Design specific styles
2. `ios`: For iOS specific styles
3. `material-active`: For active states in Material Design
4. `ios-active`: For active states in iOS

These variants allow you to apply specific styles based on the design system (iOS or Material) and state (normal or active).

## Usage

### Material Design Variant

Use the `material:` prefix to apply styles only when the Material Design system is active:

```html
<div class="material:bg-blue-500">This will have a blue background in Material Design</div>
```

### iOS Variant

Use the `ios:` prefix to apply styles only when the iOS system is active:

```html
<div class="ios:bg-blue-500">This will have a blue background in iOS</div>
```

### Material Design Active Variant

Use the `material-active:` prefix to apply styles only when the Material Design system is active and the element is in an active state:

```html
<div class="material-active:bg-blue-500">This will have a blue background in Material Design when the element is active</div>
```

### iOS Active Variant

Use the `ios-active:` prefix to apply styles only when the iOS system is active and the element is in an active state:

```html
<div class="ios-active:bg-blue-500">This will have a blue background in iOS when the element is active</div>
```

## Example

```html
<div class="material:bg-blue-500">This will have a blue background in Material Design</div>
<div class="ios:bg-blue-500">This will have a blue background in iOS</div>
<div class="material-active:bg-blue-500">This will have a blue background in Material Design when the element is active</div>
<div class="ios-active:bg-blue-500">This will have a blue background in iOS when the element is active</div>
```

