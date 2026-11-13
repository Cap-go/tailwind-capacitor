import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const root = repoRoot;

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const vueDir = join(root, 'src/vue/components');
const reactDir = join(root, 'src/react/components');
const sharedDir = join(root, 'src/shared');

const vueNames = readdirSync(vueDir)
  .filter((name) => name.endsWith('.vue'))
  .map((name) => basename(name, '.vue'))
  .sort();

const reactNames = readdirSync(reactDir)
  .filter((name) => name.endsWith('.tsx') && name !== 'Glass.tsx')
  .map((name) => basename(name, '.tsx'))
  .filter((n) => vueNames.includes(n))
  .sort();

const iconFilesVue = readdirSync(join(vueDir, 'icons'))
  .filter((name) => name.endsWith('.vue'))
  .map((name) => `src/vue/components/icons/${name}`);

const iconFilesReact = readdirSync(join(reactDir, 'icons'))
  .filter((name) => name.endsWith('.tsx'))
  .map((name) => `src/react/components/icons/${name}`);

function sharedClassColorFiles() {
  const dirs = ['classes', 'colors'];
  const files = [];
  for (const dir of dirs) {
    for (const name of readdirSync(join(sharedDir, dir))) {
      if (name.endsWith('.js')) files.push(`src/shared/${dir}/${name}`);
    }
  }
  files.push(
    'src/shared/cls.js',
    'src/shared/calc-popover-position.js',
    'src/shared/position-class.js',
    'src/shared/touch-ripple-class.js',
    'src/shared/use-ios-highlight.js',
    'src/shared/filter-colors.js',
  );
  return files.sort();
}

const styleCssFiles = [
  'registry/capacitor/styles/tailwind-capacitor.css',
  'registry/capacitor/styles/theme-tokens.css',
  'registry/capacitor/styles/variants.css',
  'registry/capacitor/styles/safe-areas-base.css',
  'registry/capacitor/styles/safe-areas-generated.css',
  'registry/capacitor/styles/utilities.css',
  'registry/capacitor/styles/line-clamp.css',
];

const styleJsFiles = [
  'registry/capacitor/config/plugin-base.js',
  'registry/capacitor/config/plugin-colors.js',
  'registry/capacitor/config/hex-to-rgb.js',
  'registry/capacitor/config/ios-colors.js',
  'registry/capacitor/config/md-colors.js',
  'registry/capacitor/config/join-safe-class-selector.js',
];

const vueProviderFiles = [
  'src/vue/shared/TailwindCapacitorProvider.vue',
  'src/vue/shared/use-auto-theme.js',
  'src/vue/shared/use-context.js',
  'src/vue/shared/use-dark-classes.js',
  'src/vue/shared/use-theme-classes.js',
  'src/vue/shared/use-theme.js',
  'src/vue/shared/use-touch-ripple.js',
];

const reactProviderFiles = [
  'src/react/shared/TailwindCapacitorProvider.tsx',
  'src/react/shared/CapacitorContext.ts',
  'src/react/shared/use-auto-theme.ts',
  'src/react/shared/use-dark-classes.ts',
  'src/react/shared/use-theme-classes.ts',
  'src/react/shared/use-theme.ts',
  'src/react/shared/use-touch-ripple.ts',
  'src/react/shared/use-isomorphic-layout-effect.ts',
  'src/react/shared/get-theme-specific-props.ts',
  'src/react/shared/ListContext.ts',
  'src/react/shared/use-list.ts',
];

const angularProviderFiles = [
  'src/angular/shared/tailwind-capacitor-provider.component.ts',
  'src/angular/shared/capacitor-context.ts',
  'src/angular/shared/use-theme-classes.ts',
];

function styleTarget(path) {
  return `src/capacitor/styles/${basename(path)}`;
}

function configTarget(path) {
  return `src/capacitor/config/${basename(path)}`;
}

function fileEntry(path, type, target) {
  return { path, type, target };
}

function dep(name, nested = false) {
  if (nested) return `../${name}.json`;
  return `./${name}.json`;
}

function tailwindItem() {
  return {
    name: 'capacitor-tailwind',
    type: 'registry:item',
    title: 'Tailwind Capacitor styles',
    description:
      'Tailwind CSS v4 capacitor utilities, safe areas, and platform variants.',
    files: [
      ...styleCssFiles.map((path) =>
        fileEntry(path, 'registry:file', styleTarget(path)),
      ),
      ...styleJsFiles.map((path) =>
        fileEntry(path, 'registry:file', configTarget(path)),
      ),
    ],
  };
}

function sharedItem(nested) {
  return {
    name: 'capacitor-shared',
    type: 'registry:item',
    title: 'Tailwind Capacitor shared tokens',
    description: 'Shared class and color maps for capacitor components.',
    registryDependencies: [dep('capacitor-tailwind', nested)],
    files: sharedClassColorFiles().map((path) => {
      const rel = path.replace(/^src\//, 'capacitor/');
      return fileEntry(path, 'registry:file', `src/${rel}`);
    }),
  };
}

function collectVueDeps(source, names, nested) {
  const registryDeps = [
    dep('capacitor-tailwind', nested),
    dep('capacitor-provider', !nested),
    dep('capacitor-shared', nested),
  ];
  if (!nested) {
    registryDeps[1] = dep('capacitor-provider', false);
  } else {
    registryDeps[1] = dep('capacitor-provider', true);
  }
  if (/components\/icons\/|\.\/icons\//.test(source)) {
    registryDeps.push(dep('capacitor-icons', nested));
  }
  for (const match of source.matchAll(/from\s+['"]\.\/([^'"]+\.vue)['"]/g)) {
    const imp = match[1];
    if (imp.startsWith('icons/')) continue;
    const imported = basename(imp, '.vue');
    if (!names.includes(imported)) continue;
    const sibling = dep(`capacitor-${toKebab(imported)}`, nested);
    if (!registryDeps.includes(sibling)) registryDeps.push(sibling);
  }
  return registryDeps;
}

function collectReactDeps(source, names, nested) {
  const registryDeps = [
    dep('capacitor-tailwind', nested),
    dep('capacitor-provider', nested),
    dep('capacitor-shared', nested),
  ];
  if (/components\/icons\/|\.\/icons\//.test(source)) {
    registryDeps.push(dep('capacitor-icons', nested));
  }
  for (const match of source.matchAll(/from\s+['"]\.\/([^'"]+\.tsx)['"]/g)) {
    const imp = match[1];
    if (imp.startsWith('icons/')) continue;
    const imported = basename(imp, '.tsx');
    if (!names.includes(imported)) continue;
    const sibling = dep(`capacitor-${toKebab(imported)}`, nested);
    if (!registryDeps.includes(sibling)) registryDeps.push(sibling);
  }
  return registryDeps;
}

function writeRegistry(path, registry) {
  writeFileSync(path, `${JSON.stringify(registry, null, 2)}\n`);
}

function makeRegistry(schema, nameSuffix, items) {
  return {
    $schema: schema,
    name: `capgo-tailwind-capacitor${nameSuffix}`,
    homepage: 'https://github.com/Cap-go/tailwind-capacitor/',
    items,
  };
}

const vueItems = [];
vueItems.push(tailwindItem());
vueItems.push(sharedItem(false));
vueItems.push({
  name: 'capacitor-provider',
  type: 'registry:item',
  title: 'Tailwind Capacitor provider (Vue)',
  description: 'Root provider and Vue composables for theme and context.',
  registryDependencies: [dep('capacitor-tailwind', false)],
  dependencies: ['vue'],
  files: vueProviderFiles.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});
vueItems.push({
  name: 'capacitor-icons',
  type: 'registry:item',
  title: 'Tailwind Capacitor icons (Vue)',
  description: 'Inline SVG icon components used by capacitor UI.',
  registryDependencies: [dep('capacitor-provider', false)],
  dependencies: ['vue'],
  files: iconFilesVue.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});

for (const name of vueNames) {
  const kebab = toKebab(name);
  const vuePath = `src/vue/components/${name}.vue`;
  const source = readFileSync(join(root, vuePath), 'utf8');
  vueItems.push({
    name: `capacitor-${kebab}`,
    type: 'registry:item',
    title: `Capacitor ${name} (Vue)`,
    description: `Capacitor ${name} Vue component.`,
    registryDependencies: collectVueDeps(source, vueNames, false),
    dependencies: ['vue'],
    files: [
      fileEntry(
        vuePath,
        'registry:file',
        `src/capacitor/vue/components/${name}.vue`,
      ),
    ],
  });
}

const reactItems = [];
reactItems.push(sharedItem(true));
reactItems.push({
  name: 'capacitor-provider',
  type: 'registry:item',
  title: 'Tailwind Capacitor provider (React)',
  description: 'Root provider and React hooks for theme and context.',
  registryDependencies: [dep('capacitor-tailwind', true)],
  dependencies: ['react', 'react-dom'],
  files: reactProviderFiles.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});
reactItems.push({
  name: 'capacitor-icons',
  type: 'registry:item',
  title: 'Tailwind Capacitor icons (React)',
  description: 'Inline SVG icon components used by capacitor UI.',
  registryDependencies: [dep('capacitor-provider', true)],
  dependencies: ['react', 'react-dom'],
  files: iconFilesReact.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});

for (const name of reactNames) {
  const kebab = toKebab(name);
  const reactPath = `src/react/components/${name}.tsx`;
  const source = readFileSync(join(root, reactPath), 'utf8');
  const files = [
    fileEntry(
      reactPath,
      'registry:file',
      `src/capacitor/react/components/${name}.tsx`,
    ),
  ];
  for (const match of source.matchAll(/from\s+['"]\.\/([^'"]+\.tsx)['"]/g)) {
    const helper = match[1];
    if (helper.startsWith('icons/')) continue;
    const helperName = basename(helper, '.tsx');
    if (reactNames.includes(helperName)) continue;
    const helperPath = `src/react/components/${helper}`;
    files.push(
      fileEntry(
        helperPath,
        'registry:file',
        `src/capacitor/react/components/${helper}`,
      ),
    );
  }
  reactItems.push({
    name: `capacitor-${kebab}`,
    type: 'registry:item',
    title: `Capacitor ${name} (React)`,
    description: `Capacitor ${name} React component.`,
    registryDependencies: collectReactDeps(source, reactNames, true),
    dependencies: ['react', 'react-dom'],
    files,
  });
}

const angularItems = [];
angularItems.push(sharedItem(true));
angularItems.push({
  name: 'capacitor-provider',
  type: 'registry:item',
  title: 'Tailwind Capacitor provider (Angular)',
  description: 'Root provider and Angular context for theme.',
  registryDependencies: [dep('capacitor-tailwind', true)],
  dependencies: ['@angular/core'],
  files: angularProviderFiles.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});

const angularIconsDir = join(root, 'src/angular/components/icons');
const iconFilesAngular = existsSync(angularIconsDir)
  ? readdirSync(angularIconsDir)
      .filter((name) => name.endsWith('.component.ts'))
      .map((name) => `src/angular/components/icons/${name}`)
  : [];

if (iconFilesAngular.length) {
  angularItems.push({
    name: 'capacitor-icons',
    type: 'registry:item',
    title: 'Tailwind Capacitor icons (Angular)',
    description: 'Inline SVG icon components used by capacitor UI.',
    registryDependencies: [dep('capacitor-provider', true)],
    dependencies: ['@angular/core'],
    files: iconFilesAngular.map((path) => {
      const rel = path.replace(/^src\//, 'capacitor/');
      return fileEntry(path, 'registry:file', `src/${rel}`);
    }),
  });
}

const angularNames = readdirSync(join(root, 'src/angular/components'))
  .filter((name) => name.endsWith('.component.ts'))
  .map((name) => basename(name, '.component.ts'))
  .sort();

for (const name of angularNames) {
  const kebab = toKebab(name);
  const angularPath = `src/angular/components/${name}.component.ts`;
  angularItems.push({
    name: `capacitor-${kebab}`,
    type: 'registry:item',
    title: `Capacitor ${name} (Angular)`,
    description: `Capacitor ${name} Angular component.`,
    registryDependencies: [
      dep('capacitor-tailwind', true),
      dep('capacitor-provider', true),
      dep('capacitor-shared', true),
    ],
    dependencies: ['@angular/core'],
    files: [
      fileEntry(
        angularPath,
        'registry:file',
        `src/capacitor/angular/components/${name}.component.ts`,
      ),
    ],
  });
}

const vueRegistry = makeRegistry(
  'https://ui.shadcn.com/schema/registry.json',
  '',
  vueItems,
);
const reactRegistry = makeRegistry(
  'https://ui.shadcn.com/schema/registry.json',
  '-react',
  reactItems,
);
const angularRegistry = makeRegistry(
  'https://ui.shadcn.com/schema/registry.json',
  '-angular',
  angularItems,
);

writeRegistry(join(root, 'registry.json'), vueRegistry);
writeRegistry(join(root, 'registry-vue.json'), vueRegistry);
writeRegistry(join(root, 'registry-react.json'), reactRegistry);
writeRegistry(join(root, 'registry-angular.json'), angularRegistry);

mkdirSync(join(root, 'public/r/react'), { recursive: true });
mkdirSync(join(root, 'public/r/angular'), { recursive: true });
mkdirSync(join(root, 'public/r/vue'), { recursive: true });

console.log(
  `registry: vue ${vueItems.length}, react ${reactItems.length}, angular ${angularItems.length}`,
);
