In addition to Tailwind CSS variants, there is a theme variant added in Tailwind Capacitor to help make custom styles which should be different in iOS and Material theme:

| Theme prefix | Applied for | CSS |
| --- | --- | --- |
| `ios` | iOS theme | `.k-ios ...` |
| `material` | Material theme | `.k-material ...` |

For example:

-   Image will have height `h-11` (44px) in iOS theme and `h-12` (48px) in Material theme
    
    ```html
    <img class="ios:h-11 material:h-12" src="..." />
    ```
    
-   Text will be bold in iOS theme and semibold in Material theme
    
    ```html
    <span class="ios:font-bold material:font-semibold">Hello</span>
    ```
