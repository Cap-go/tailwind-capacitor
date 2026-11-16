import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const additions = [
  'Accordion',
  'AccordionItem',
  'Alert',
  'Avatar',
  'Datetime',
  'Picker',
  'Select',
  'Textarea',
  'InputOtp',
  'InfiniteScroll',
  'Refresher',
  'ItemSliding',
  'Reorder',
  'Modal',
  'Skeleton',
  'SplitPane',
  'Tabs',
  'Tab',
  'Thumbnail',
  'Note',
  'Footer',
  'Header',
  'TouchRipple',
];

const root = repoRoot;

function writeIfMissing(path, content) {
  if (existsSync(path)) return;
  writeFileSync(path, content);
}

for (const name of additions) {
  const classesPath = join(root, `src/shared/classes/${name}Classes.js`);
  const colorsPath = join(root, `src/shared/colors/${name}Colors.js`);
  const vuePath = join(root, `src/vue/components/${name}.vue`);

  writeIfMissing(
    classesPath,
    `import { cls } from '../cls.js';

export const ${name}Classes = (props, colors, { className } = {}) => ({
  base: {
    common: cls(colors.bg, colors.text, className),
    ios: colors.iosSurface,
    material: colors.materialSurface,
  },
});
`,
  );

  writeIfMissing(
    colorsPath,
    `export const ${name}Colors = (colorsProp = {}) => ({
  bg: 'bg-light',
  text: 'text-black dark:text-white',
  iosSurface: 'ios:rounded-xl',
  materialSurface: 'android:rounded-2xl',
  ...colorsProp,
});
`,
  );

  writeIfMissing(
    vuePath,
    `<template>
  <component :is="component" :class="classes">
    <slot />
  </component>
</template>
<script>
  import { computed } from 'vue';
  import { useContext } from '../shared/use-context.js';
  import { ${name}Classes } from '../../shared/classes/${name}Classes.js';
  import { ${name}Colors } from '../../shared/colors/${name}Colors.js';
  import { themeClasses } from '../shared/use-theme-classes.js';
  import { darkClasses } from '../shared/use-dark-classes.js';

  export default {
    name: 'c-${name.replace(/([A-Z])/g, (m, l, i) => (i ? '-' : '') + l.toLowerCase())}',
    props: {
      component: {
        type: String,
        default: 'div',
      },
      colors: { type: Object },
      ios: { type: Boolean, default: undefined },
      material: { type: Boolean, default: undefined },
    },
    setup(props, ctx) {
      const context = useContext();
      const useDarkClasses = darkClasses(context);
      const useThemeClasses = themeClasses(context);
      const colors = computed(() => ${name}Colors(props.colors || {}, useDarkClasses));
      const c = useThemeClasses(props, () =>
        ${name}Classes(props, colors.value, { className: ctx.attrs.class }),
      );
      const classes = computed(() => c.value.base);
      return { classes };
    },
  };
</script>
`,
  );

  const reactPath = join(root, `src/react/components/${name}.tsx`);
  writeIfMissing(
    reactPath,
    `/* @ts-nocheck */
import React from 'react';
import { ${name}Classes } from '../../shared/classes/${name}Classes.js';
import { ${name}Colors } from '../../shared/colors/${name}Colors.js';
import { useThemeClasses } from '../shared/use-theme-classes.js';

const ${name} = (props) => {
  const {
    component: Component = 'div',
    className,
    colors: colorsProp,
    ios,
    material,
    children,
    ...rest
  } = props;
  const themeClassesFn = useThemeClasses({ ios, material });
  const colors = ${name}Colors(colorsProp);
  const c = themeClassesFn(${name}Classes(props, colors, { className }), className);
  return (
    <Component className={c.base} {...rest}>
      {children}
    </Component>
  );
};

${name}.displayName = '${name}';
export default ${name};
`,
  );
}

console.log(`scaffold-ionic-additions: ${additions.length} components`);
