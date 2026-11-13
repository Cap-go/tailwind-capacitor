import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const componentsDir = join(root, 'example/src/capacitor/vue/components');

const names = readdirSync(componentsDir)
  .filter((name) => name.endsWith('.vue'))
  .map((name) => name.replace(/\.vue$/, ''))
  .sort();

const lines = [
  "import tcProvider from './vue/shared/TailwindCapacitorProvider.vue';",
  "export { tcProvider as TailwindCapacitorProvider, tcProvider as Provider };",
  '',
];

for (const name of names) {
  const ident = name[0].toLowerCase() + name.slice(1);
  const cName = `c${name}`;
  lines.push(`import ${cName} from './vue/components/${name}.vue';`);
  lines.push(`export { ${cName} as ${name} };`);
}

writeFileSync(join(root, 'example/src/capacitor/index.js'), `${lines.join('\n')}\n`);
console.log(`example barrel: ${names.length} components`);
