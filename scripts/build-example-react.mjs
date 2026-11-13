import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const exampleReact = join(repoRoot, 'example-react');
const registryRoot = join(repoRoot, 'public/r');
const registryReact = join(registryRoot, 'react');

mkdirSync(join(exampleReact, 'src'), { recursive: true });

writeFileSync(
  join(exampleReact, 'package.json'),
  JSON.stringify(
    {
      name: 'tailwind-capacitor-example-react',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      devDependencies: {
        '@tailwindcss/vite': '^4.1.11',
        '@vitejs/plugin-react': '^4.4.1',
        tailwindcss: '^4.1.11',
        vite: '^7.0.2',
      },
    },
    null,
    2,
  ),
);

writeFileSync(
  join(exampleReact, 'vite.config.js'),
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
`,
);

writeFileSync(
  join(exampleReact, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tailwind Capacitor React Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
);

cpSync(join(repoRoot, 'components-react.json'), join(exampleReact, 'components.json'));
cpSync(join(repoRoot, 'jsconfig.json'), join(exampleReact, 'jsconfig.json'));
writeFileSync(
  join(exampleReact, 'src/style.css'),
  '@import "@/capacitor/styles/tailwind-capacitor.css";\n',
);

function localize(path, dir) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep === 'string' && dep.startsWith('http')) {
        const name = dep.split('/').pop();
        if (dep.includes('/public/r/react/')) {
          return join(dir, 'react', name);
        }
        return join(dir, name);
      }
      if (dep.startsWith('../')) {
        const name = dep.replace('../', '');
        return join(dir, name);
      }
      if (dep.startsWith('./')) {
        return join(path, '..', dep);
      }
      return dep;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  const out = join(dir, 'local', readFileSync(path, 'utf8') ? '' : '');
  return data;
}

const localDir = join(exampleReact, '.registry');
mkdirSync(join(localDir, 'react'), { recursive: true });

for (const name of readdirSync(registryRoot)) {
  if (name.startsWith('capacitor-') && name.endsWith('.json')) {
    cpSync(join(registryRoot, name), join(localDir, name));
  }
}
for (const name of readdirSync(registryReact)) {
  if (name.endsWith('.json')) {
    cpSync(join(registryReact, name), join(localDir, 'react', name));
  }
}

function localizeFile(filePath, baseDir) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const toLocal = (deps) =>
    (deps || []).map((dep) => {
      if (typeof dep !== 'string') return dep;
      if (dep.startsWith('http')) {
        const name = dep.split('/').pop();
        if (dep.includes('/public/r/react/')) {
          return join(baseDir, 'react', name);
        }
        return join(baseDir, name);
      }
      if (dep.startsWith('../')) {
        return join(baseDir, dep.replace('../', ''));
      }
      return dep;
    });
  if (Array.isArray(data.registryDependencies)) {
    data.registryDependencies = toLocal(data.registryDependencies);
  }
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

for (const name of readdirSync(localDir)) {
  if (!name.endsWith('.json')) continue;
  localizeFile(join(localDir, name), localDir);
}
for (const name of readdirSync(join(localDir, 'react'))) {
  if (!name.endsWith('.json')) continue;
  localizeFile(join(localDir, 'react', name), localDir);
}

const addList = [
  join(localDir, 'capacitor-tailwind.json'),
  join(localDir, 'capacitor-shared.json'),
  join(localDir, 'react/capacitor-provider.json'),
  join(localDir, 'react/capacitor-app.json'),
  join(localDir, 'react/capacitor-page.json'),
  join(localDir, 'react/capacitor-navbar.json'),
  join(localDir, 'react/capacitor-block.json'),
  join(localDir, 'react/capacitor-block-title.json'),
  join(localDir, 'react/capacitor-button.json'),
  join(localDir, 'react/capacitor-alert.json'),
  join(localDir, 'react/capacitor-badge.json'),
];

writeFileSync(
  join(exampleReact, 'src/main.jsx'),
  `import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

createRoot(document.getElementById('root')).render(<App />);
`,
);

writeFileSync(
  join(exampleReact, 'src/App.jsx'),
  `import React, { useState } from 'react';
import { TailwindCapacitorProvider } from '@/capacitor/react/shared/TailwindCapacitorProvider.tsx';
import App from '@/capacitor/react/components/App.tsx';
import Page from '@/capacitor/react/components/Page.tsx';
import Navbar from '@/capacitor/react/components/Navbar.tsx';
import Block from '@/capacitor/react/components/Block.tsx';
import BlockTitle from '@/capacitor/react/components/BlockTitle.tsx';
import Button from '@/capacitor/react/components/Button.tsx';
import Alert from '@/capacitor/react/components/Alert.tsx';
import Badge from '@/capacitor/react/components/Badge.tsx';

export default function Demo() {
  const [dark, setDark] = useState(false);
  const [theme, setTheme] = useState('ios');

  return (
    <TailwindCapacitorProvider theme={theme} dark={dark}>
      <App theme={theme} dark={dark}>
        <Page className="safe-areas">
          <Navbar title="React demo" />
          <Block strong inset>
            <BlockTitle>Theme</BlockTitle>
            <Button small onClick={() => setTheme(theme === 'ios' ? 'material' : 'ios')}>
              Toggle platform
            </Button>
            <Button small clear onClick={() => setDark(!dark)}>
              Toggle dark
            </Button>
          </Block>
          <Alert>New React registry item</Alert>
          <Badge>React Badge</Badge>
        </Page>
      </App>
    </TailwindCapacitorProvider>
  );
}
`,
);

const install = spawnSync('npm', ['install'], { cwd: exampleReact, stdio: 'inherit' });
if (install.status !== 0) process.exit(install.status ?? 1);

for (const item of addList) {
  const result = spawnSync(
    'node',
    [join(repoRoot, 'scripts/registry-add.mjs'), item],
    {
      cwd: exampleReact,
      stdio: 'inherit',
      env: { ...process.env, REGISTRY_ROOT: localDir },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const build = spawnSync('npm', ['run', 'build'], { cwd: exampleReact, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

console.log('build-example-react: ok');
