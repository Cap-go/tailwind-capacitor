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
import { dirname, join, relative, resolve } from 'node:path';
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
    installOrder: [
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
    installOrder: [
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
    installOrder: [
      '../capacitor-tailwind.json',
      '../capacitor-shared.json',
      'capacitor-provider.json',
    ],
  },
};

function resolveInstalled(rootDir, target) {
  const primary = join(rootDir, target);
  if (existsSync(primary) && readFileSync(primary, 'utf8').trim()) {
    return primary;
  }
  const alt = join(rootDir, target.replace(/^src\//, ''));
  if (existsSync(alt) && readFileSync(alt, 'utf8').trim()) {
    return alt;
  }
  return primary;
}

const cfg = configByFramework[framework];
if (!cfg) {
  console.error(`unknown REGISTRY_FRAMEWORK=${framework}`);
  process.exit(1);
}

const publicRoot = join(repoRoot, 'public/r');
const frameworkDir = join(publicRoot, cfg.registrySub);
const dir = mkdtempSync(join(tmpdir(), `tc-registry-${framework}-`));
const shadcnTag = process.env.SHADCN_VERSION || 'latest';
const addScript = join(repoRoot, 'scripts/registry-add.mjs');

function localizeRegistryFile(path, baseDir) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep !== 'string') return dep;
      let resolved = dep;
      if (dep.startsWith('http')) {
        const name = dep.split('/').pop();
        const frameworkRoot =
          baseDir.endsWith('/angular') || baseDir.endsWith('/react');
        if (
          frameworkRoot &&
          (name === 'capacitor-tailwind.json' ||
            name === 'capacitor-shared.json')
        ) {
          resolved = join(dirname(baseDir), name);
        } else {
          resolved = join(baseDir, name);
        }
      } else if (dep.startsWith('./') || dep.startsWith('../')) {
        resolved = join(baseDir, dep);
      }
      if (framework === 'react' || framework === 'vue') {
        return resolve(resolved);
      }
      let rel = relative(baseDir, resolved).replaceAll('\\', '/');
      if (!rel.startsWith('.')) rel = `./${rel}`;
      return rel;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

mkdirSync(join(dir, 'src'), { recursive: true });

cpSync(join(publicRoot, 'capacitor-tailwind.json'), join(dir, 'capacitor-tailwind.json'));
cpSync(join(publicRoot, 'capacitor-shared.json'), join(dir, 'capacitor-shared.json'));

if (cfg.registrySub) {
  const sub = join(dir, cfg.registrySub);
  mkdirSync(sub, { recursive: true });
  for (const name of readdirSync(frameworkDir)) {
    if (name.endsWith('.json')) {
      cpSync(join(frameworkDir, name), join(sub, name));
    }
  }
  for (const name of readdirSync(sub)) {
    if (name.endsWith('.json')) {
      localizeRegistryFile(join(sub, name), sub);
    }
  }
} else {
  for (const name of readdirSync(publicRoot)) {
    if (name.startsWith('capacitor-') && name.endsWith('.json')) {
      if (name === 'capacitor-shared.json') continue;
      cpSync(join(publicRoot, name), join(dir, name));
    }
  }
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.json')) {
      localizeRegistryFile(join(dir, name), dir);
    }
  }
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
writeFileSync(
  join(dir, 'src/style.css'),
  '@import "@/capacitor/styles/tailwind-capacitor.css";\n',
);
cpSync(join(repoRoot, cfg.componentsJson), join(dir, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(dir, 'jsconfig.json'));

const npmCi = spawnSync('npm', ['install'], { cwd: dir, stdio: 'inherit' });
if (npmCi.status !== 0) process.exit(npmCi.status ?? 1);

const itemDir = cfg.registrySub ? join(dir, cfg.registrySub) : dir;
const allItems = readdirSync(itemDir)
  .filter((name) => name.startsWith('capacitor-') && name.endsWith('.json'))
  .map((name) => join(itemDir, name));

const orderIndex = (path) => {
  const base = path.split('/').pop();
  const rel =
    cfg.registrySub && !base.startsWith('capacitor-tailwind')
      ? `../${base}`
      : base;
  const idx = cfg.installOrder.indexOf(rel);
  const idx2 = cfg.installOrder.indexOf(base);
  const hit = idx !== -1 ? idx : idx2;
  return hit === -1 ? 999 : hit;
};

const items = allItems.sort((a, b) => {
  const d = orderIndex(a) - orderIndex(b);
  return d !== 0 ? d : a.localeCompare(b);
});

if (framework === 'angular') {
  for (const item of items) {
    const result = spawnSync('node', [addScript, item], {
      cwd: dir,
      stdio: 'pipe',
      encoding: 'utf8',
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
    const addArgs = [...shadcnCmd, item, '-y'];
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
  const parsed = JSON.parse(readFileSync(item, 'utf8'));
  for (const file of parsed.files || []) {
    if (file.target?.endsWith('.d.ts')) continue;
    if (!resolveInstalled(dir, file.target)) {
      console.error(`missing or empty after install (${framework}): ${file.target}`);
      process.exit(1);
    }
  }
}

if (!resolveInstalled(dir, cfg.buildTarget)) {
  console.error(`missing sample file (${framework}): ${cfg.buildTarget}`);
  process.exit(1);
}

rmSync(dir, { recursive: true, force: true });
console.log(
  `test-registry-install (${framework}): ok (${items.length} items)`,
);
