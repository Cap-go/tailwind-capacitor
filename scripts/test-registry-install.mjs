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

const framework = process.env.REGISTRY_FRAMEWORK || 'vue';
const configByFramework = {
  vue: {
    componentsJson: 'components-vue.json',
    registrySub: '',
    cli: ['shadcn-vue@latest', 'add'],
    install: { vue: '^3.5.17' },
    buildTarget: 'src/capacitor/vue/components/Button.vue',
    rootItems: ['capacitor-tailwind.json'],
    priority: [
      'capacitor-tailwind.json',
      'capacitor-provider.json',
      'capacitor-shared.json',
      'capacitor-icons.json',
    ],
  },
  react: {
    componentsJson: 'components-react.json',
    registrySub: 'react',
    cli: ['shadcn@latest', 'add'],
    install: { react: '^19.0.0', 'react-dom': '^19.0.0' },
    buildTarget: 'src/capacitor/react/components/Button.tsx',
    rootItems: ['../capacitor-tailwind.json', '../capacitor-shared.json'],
    priority: [
      '../capacitor-tailwind.json',
      '../capacitor-shared.json',
      'capacitor-provider.json',
      'capacitor-icons.json',
    ],
  },
  angular: {
    componentsJson: 'components-angular.json',
    registrySub: 'angular',
    cli: null,
    install: { '@angular/core': '^19.0.0', '@angular/common': '^19.0.0' },
    buildTarget: 'src/capacitor/angular/components/Button.component.ts',
    rootItems: ['../capacitor-tailwind.json', '../capacitor-shared.json'],
    priority: [
      '../capacitor-tailwind.json',
      '../capacitor-shared.json',
      'capacitor-provider.json',
    ],
  },
};

const cfg = configByFramework[framework];
if (!cfg) {
  console.error(`unknown REGISTRY_FRAMEWORK=${framework}`);
  process.exit(1);
}

const registryDir = join(
  repoRoot,
  'public/r',
  cfg.registrySub || '',
);
const rootRegistryDir = join(repoRoot, 'public/r');
const dir = mkdtempSync(join(tmpdir(), `tc-registry-${framework}-`));
const shadcnTag = process.env.SHADCN_VERSION || 'latest';

function localizeRegistryFile(path, baseDir) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep !== 'string') return dep;
      if (dep.startsWith('http')) {
        const name = dep.split('/').pop();
        return join(dir, name);
      }
      if (dep.startsWith('../')) {
        return join(baseDir, dep);
      }
      if (dep.startsWith('./')) {
        return join(baseDir, dep);
      }
      return dep;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

mkdirSync(dir, { recursive: true });

for (const name of cfg.rootItems) {
  const resolved =
    name.startsWith('../')
      ? join(rootRegistryDir, name.replace('../', ''))
      : join(registryDir, name);
  const destName = name.replace('../', '');
  const dest = join(dir, destName);
  cpSync(resolved, dest);
  localizeRegistryFile(dest, dir);
}

for (const name of readdirSync(registryDir)) {
  if (!name.startsWith('capacitor-') || !name.endsWith('.json')) continue;
  const dest = join(dir, name);
  cpSync(join(registryDir, name), dest);
  localizeRegistryFile(dest, dir);
}

writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify(
    {
      name: `registry-install-smoke-${framework}`,
      private: true,
      type: 'module',
      dependencies: cfg.install,
      devDependencies: {
        tailwindcss: '^4.1.11',
        '@tailwindcss/vite': '^4.1.11',
        vite: '^7.0.2',
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
cpSync(join(repoRoot, cfg.componentsJson), join(dir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(dir, 'jsconfig.json'));

const npmCi = spawnSync('npm', ['install'], { cwd: dir, stdio: 'inherit' });
if (npmCi.status !== 0) process.exit(npmCi.status ?? 1);

const items = readdirSync(dir)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .sort((a, b) => {
    const ai = cfg.priority.indexOf(a);
    const bi = cfg.priority.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

if (framework === 'angular') {
  const addScript = join(repoRoot, 'scripts/registry-add.mjs');
  for (const item of items) {
    const result = spawnSync('node', [addScript, join(dir, item)], {
      cwd: dir,
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, REGISTRY_ROOT: dir },
    });
    if (result.status !== 0) {
      console.error(`registry-add failed: ${item}`);
      console.error(result.stdout);
      console.error(result.stderr);
      process.exit(1);
    }
  }
} else {
  const shadcnCmd =
    framework === 'vue'
      ? [`shadcn-vue@${shadcnTag}`, 'add']
      : [`shadcn@${shadcnTag}`, 'add'];
  for (const item of items) {
    const addArgs = [...shadcnCmd, join(dir, item), '-y'];
    const result = spawnSync('npx', addArgs, {
      cwd: dir,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    if (result.status !== 0) {
      console.error(`shadcn add failed (${framework}): ${item}`);
      console.error(result.stdout);
      console.error(result.stderr);
      process.exit(1);
    }
  }
}

for (const item of items) {
  const parsed = JSON.parse(readFileSync(join(dir, item), 'utf8'));
  for (const file of parsed.files || []) {
    const target = join(dir, file.target);
    if (!existsSync(target) || !readFileSync(target, 'utf8').trim()) {
      console.error(`missing or empty after install (${framework}): ${file.target}`);
      process.exit(1);
    }
  }
}

const sample = join(dir, cfg.buildTarget);
if (!existsSync(sample)) {
  console.error(`missing sample file (${framework}): ${cfg.buildTarget}`);
  process.exit(1);
}

rmSync(dir, { recursive: true, force: true });
console.log(
  `test-registry-install (${framework}): ok (${items.length} items)`,
);
