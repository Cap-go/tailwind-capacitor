-   [Add Hairlines](/safe-areas#add-hairlines)
-   [Remove Hairlines](/safe-areas#remove-hairlines)
-   [Hairline Color](/safe-areas#hairline-color)
-   [Hairline Transition Duration](/safe-areas#hairline-transition-duration)

To replace borders you can use "hairlines" instead of usual CSS borders.

Hairlines are made with `:after` and `:before` pseudo elements. This method allows to have true 0.5px and 0.33px wide "borders".

## [](/safe-areas#add-hairlines)Add Hairlines

To add hairline we need to use `.hairline-[side]` classes:

| Class |  |
| --- | --- |
| `.hairline-t` | Add top hairline |
| `.hairline-r` | Add right hairline |
| `.hairline-b` | Add bottom hairline |
| `.hairline-l` | Add left hairline |

Note, hairlines use `absolute` positioning, so make sure element with hairline has `absolute`, `fixed` or `relative` position

For example:

```html
<!-- add bottom hairline to the element --> <div class="relative hairline-b">...</div>
```

## [](/safe-areas#remove-hairlines)Remove Hairlines

To remove hairline we need to use `.no-hairline-[side]` classes:

| Class |  |
| --- | --- |
| `.hairline-t-none` | Remove top hairline |
| `.hairline-r-none` | Remove right hairline |
| `.hairline-b-none` | Remove bottom hairline |
| `.hairline-l-none` | Remove left hairline |

## [](/safe-areas#hairline-color)Hairline Color

Hairline color is also customizable with `.hairline-[color]` classes:

| Class |  |
| --- | --- |
| `.hairline-[color]` | Set hairline color |

For example:

```html
<!-- add bottom hairline with red-500 color to the element --> <div class="relative hairline-b hairline-red-500">...</div>
```

## [](/safe-areas#hairline-transition-duration)Hairline Transition Duration

To control hairline transition duration we can use `.hairline-duration-[duration]` classes:

| Class |  |
| --- | --- |
| `.hairline-duration-[duration]` | Set hairline transition duration |

For example:

```html
<!-- add bottom hairline with red-500 color to the element, and change its color to blue-500 on hover --> <div class="relative hairline-b hairline-red-500 hairline-duration-300 hover:hairline-blue-500" > ... </div>
```
