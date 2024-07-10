-   [Viewport](/safe-areas#viewport)
-   [Safe Areas](/safe-areas#safe-areas)
-   [Disable Safe Areas](/safe-areas#disable-safe-areas)
-   [Safe Spacing & Placement](/safe-areas#safe-spacing-placement)

With the iPhone X release and further, Apple introduced called safe areas, later implemented by Google Chrome with support in Android.

On devices with safe areas (like with top screen notch), app UI must include additional top/bottom spacing (to consider top-notch and bottom bar) in portrait orientation and additional left/right spacing (to consider left/right notch) in landscape orientation.

## [](/safe-areas#viewport)Viewport

If your app targets full screen mobile devices, make sure you have `viewport-fit=cover` in your `<meta name="viewport">`, e.g.:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    ...
    <!-- Make sure you have viewport-fit=cover in content -->
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
    />
  </head>

  <body>
    ...
  </body>
</html>
```

## [](/safe-areas#safe-areas)Safe Areas

To tell our components that our app is a full screen app and we need to consider safe areas, we need to add `safe-areas` class to Tailwind Capacitor components parent element, preferably to the root app element.

```html
<!-- App.vue  -->
<template>
  <!-- add "safe-areas" class to the app root element -->
  <div id="my-app" class="safe-areas">...</div>
</template>
```

This is how `safe-areas` class defined in CSS:

```css
:root: {
  --c-safe-area-left: 0px;
  --c-safe-area-right: 0px;
  --c-safe-area-top: 0px;
  --c-safe-area-bottom: 0px;
}

@supports (left: env(safe-area-inset-left)):  {
  .safe-areas: {
    --c-safe-area-left: env(safe-area-inset-left);
    --c-safe-area-right: env(safe-area-inset-right);
    --c-safe-area-top: env(safe-area-inset-top);
    --c-safe-area-bottom: env(safe-area-inset-bottom);
  }
}

```

## [](/safe-areas#disable-safe-areas)Disable Safe Areas

It can be useful to disable safe areas on modals and side panels which are not full screen elements.

We can disable safe areas on certain elements with the following utility classes:

| Class |  |
| --- | --- |
| `.no-safe-areas` | Disable all safe areas on element |
| `.no-safe-areas-top` | Disable top safe area on element |
| `.no-safe-areas-right` | Disable right safe area on element |
| `.no-safe-areas-bottom` | Disable bottom safe area on element |
| `.no-safe-areas-left` | Disable left safe area on element |

This is how `no-safe-areas` classes defined in CSS:

```css
@supports (left: env(safe-area-inset-left)):  {
  .no-safe-areas: {
    --c-safe-area-left: 0px;
    --c-safe-area-right: 0px;
    --c-safe-area-top: 0px;
    --c-safe-area-bottom: 0px;
  }
  .no-safe-areas-top: {
    --c-safe-area-top: 0px;
  }
  .no-safe-areas-right: {
    --c-safe-area-right: 0px;
  }
  .no-safe-areas-bottom: {
    --c-safe-area-bottom: 0px;
  }
  .no-safe-areas-left: {
    --c-safe-area-left: 0px;
  }
}

```

## [](/safe-areas#safe-spacing-placement)Safe Spacing & Placement

We can also consider safe areas when placing elements:

| Class | CSS |
| --- | --- |
| `.top-safe` | `top: var(--c-safe-area-top)` |
| `.top-[value]-safe` | `top: calc([value] + var(--c-safe-area-top))` |
| `.right-safe` | `right: var(--c-safe-area-right)` |
| `.right-[value]-safe` | `right: calc([value] + var(--c-safe-area-right))` |
| `.bottom-safe` | `bottom: var(--c-safe-area-bottom)` |
| `.bottom-[value]-safe` | `bottom: calc([value] + var(--c-safe-area-bottom))` |
| `.left-safe` | `left: var(--c-safe-area-left)` |
| `.left-[value]-safe` | `left: calc([value] + var(--c-safe-area-left))` |

And same with margin and padding:

| Class | CSS |
| --- | --- |
| `.pt-safe` | `padding-top: var(--c-safe-area-top)` |
| `.pt-[value]-safe` | `padding-top: calc([value] + var(--c-safe-area-top))` |
| `.pr-safe` | `padding-right: var(--c-safe-area-right)` |
| `.pr-[value]-safe` | `padding-right: calc([value] + var(--c-safe-area-right))` |
| `.pb-safe` | `padding-bottom: var(--c-safe-area-bottom)` |
| `.pb-[value]-safe` | `padding-bottom: calc([value] + var(--c-safe-area-bottom))` |
| `.pl-safe` | `padding-left: var(--c-safe-area-left)` |
| `.pl-[value]-safe` | `padding-left: calc([value] + var(--c-safe-area-left))` |

| Class | CSS |
| --- | --- |
| `.mt-safe` | `margin-top: var(--c-safe-area-top)` |
| `.mt-[value]-safe` | `margin-top: calc([value] + var(--c-safe-area-top))` |
| `.mr-safe` | `margin-right: var(--c-safe-area-right)` |
| `.mr-[value]-safe` | `margin-right: calc([value] + var(--c-safe-area-right))` |
| `.mb-safe` | `margin-bottom: var(--c-safe-area-bottom)` |
| `.mb-[value]-safe` | `margin-bottom: calc([value] + var(--c-safe-area-bottom))` |
| `.ml-safe` | `margin-left: var(--c-safe-area-left)` |
| `.ml-[value]-safe` | `margin-left: calc([value] + var(--c-safe-area-left))` |

For example:

```html
<!-- "left-safe" class will set: left: var(--c-safe-area-top); "bottom-4-safe" class will set: bottom: calc(1rem + var(--c-safe-area-bottom)); --> <div class="left-safe bottom-4-safe">...</div>;
```
