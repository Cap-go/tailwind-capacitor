import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';

const registryDir = join(repoRoot, 'public/r');
const dir = mkdtempSync(join(tmpdir(), 'tc-registry-'));
const shadcnTag = process.env.SHADCN_VERSION || 'latest';
const shadcnCmd = [`shadcn@${shadcnTag}`, 'add'];

function localizeRegistryFile(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep === 'string' && dep.startsWith('http')) {
        return `./${dep.split('/').pop()}`;
      }
      return dep;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (Array.isArray(item.registryDependencies)) {
        item.registryDependencies = toLocal(item.registryDependencies);
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

for (const name of readdirSync(registryDir)) {
  if (name.endsWith('.json')) {
    const dest = join(dir, name);
    cpSync(join(registryDir, name), dest);
    localizeRegistryFile(dest);
  }
}

writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify(
    {
      name: 'registry-install-smoke',
      private: true,
      type: 'module',
      dependencies: {
        vue: '^3.5.17',
      },
      devDependencies: {
        tailwindcss: '^4.1.11',
        '@tailwindcss/vite': '^4.1.11',
        vite: '^7.0.2',
        '@vitejs/plugin-vue': '^6.0.0',
      },
    },
    null,
    2,
  ),
);
mkdirSync(join(dir, 'src'), { recursive: true });
writeFileSync(
  join(dir, 'src/style.css'),
  '@import "@/capacitor/styles/tailwind-capacitor.css";\n',
);
cpSync(join(repoRoot, 'components.json'), join(dir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(dir, 'jsconfig.json'));
writeFileSync(
  join(dir, 'vite.config.js'),
  `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
`,
);

const npmCi = spawnSync('npm', ['install'], { cwd: dir, stdio: 'inherit' });
if (npmCi.status !== 0) {
  process.exit(npmCi.status ?? 1);
}

const priority = [
  'capacitor-tailwind.json',
  'capacitor-provider.json',
  'capacitor-shared.json',
  'capacitor-icons.json',
];

const items = readdirSync(dir)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

for (const item of items) {
  const addArgs = [...shadcnCmd, join(dir, item), '-y'];
  const result = spawnSync('npx', addArgs, {
    cwd: dir,
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(`shadcn add failed: ${item}`);
    console.error(`command: npx ${addArgs.join(' ')}`);
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }

  const parsed = JSON.parse(readFileSync(join(dir, item), 'utf8'));
  for (const file of parsed.files || []) {
    const target = join(dir, file.target);
    if (!existsSync(target) || !readFileSync(target, 'utf8').trim()) {
      console.error(`missing or empty after shadcn add: ${file.target}`);
      process.exit(1);
    }
  }
}

const buttonPath = join(dir, 'src/capacitor/vue/components/Button.vue');
if (!existsSync(buttonPath)) {
  console.error('missing Button.vue after registry install');
  process.exit(1);
}

rmSync(dir, { recursive: true, force: true });
console.log(`test-registry-install: ok (${items.length} items via npx shadcn add)`);
