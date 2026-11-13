import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const componentsDir = join(root, 'src/vue/components');
const sharedDir = join(root, 'src/shared');

const componentNames = readdirSync(componentsDir)
  .filter((name) => name.endsWith('.vue'))
  .map((name) => basename(name, '.vue'))
  .sort();

const iconFiles = readdirSync(join(componentsDir, 'icons'))
  .filter((name) => name.endsWith('.vue'))
  .map((name) => `src/vue/components/icons/${name}`);

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

const providerFiles = [
  'src/vue/shared/TailwindCapacitorProvider.vue',
  'src/vue/shared/use-auto-theme.js',
  'src/vue/shared/use-context.js',
  'src/vue/shared/use-dark-classes.js',
  'src/vue/shared/use-theme-classes.js',
  'src/vue/shared/use-theme.js',
  'src/vue/shared/use-touch-ripple.js',
];

function styleTarget(path) {
  const base = basename(path);
  return `src/capacitor/styles/${base}`;
}

function configTarget(path) {
  return `src/capacitor/config/${basename(path)}`;
}

function fileEntry(path, type, target) {
  return { path, type, target };
}

function dep(name) {
  return `./${name}.json`;
}

const items = [];

items.push({
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
});

items.push({
  name: 'capacitor-provider',
  type: 'registry:item',
  title: 'Tailwind Capacitor provider',
  description: 'Root provider and Vue composables for theme and context.',
  registryDependencies: [dep('capacitor-tailwind')],
  dependencies: ['vue'],
  files: providerFiles.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:file', `src/${rel}`);
  }),
});

items.push({
  name: 'capacitor-shared',
  type: 'registry:lib',
  title: 'Tailwind Capacitor shared tokens',
  description: 'Shared class and color maps for capacitor components.',
  files: sharedClassColorFiles().map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:lib', `src/${rel}`);
  }),
});

items.push({
  name: 'capacitor-icons',
  type: 'registry:lib',
  title: 'Tailwind Capacitor icons',
  description: 'Inline SVG icon components used by capacitor UI.',
  files: iconFiles.map((path) => {
    const rel = path.replace(/^src\//, 'capacitor/');
    return fileEntry(path, 'registry:lib', `src/${rel}`);
  }),
});

for (const name of componentNames) {
  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  const vuePath = `src/vue/components/${name}.vue`;
  const source = readFileSync(join(root, vuePath), 'utf8');
  const registryDeps = [
    dep('capacitor-tailwind'),
    dep('capacitor-provider'),
    dep('capacitor-shared'),
  ];
  if (/components\/icons\//.test(source)) {
    registryDeps.push(dep('capacitor-icons'));
  }
  items.push({
    name: `capacitor-${kebab}`,
    type: 'registry:item',
    title: `Capacitor ${name}`,
    description: `Capacitor ${name} Vue component.`,
    registryDependencies: registryDeps,
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

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'capgo-tailwind-capacitor',
  homepage: 'https://github.com/Cap-go/tailwind-capacitor/',
  items,
};

writeFileSync(
  join(root, 'registry.json'),
  `${JSON.stringify(registry, null, 2)}\n`,
);
console.log(`registry items: ${items.length} (components: ${componentNames.length})`);
