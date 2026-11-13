import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

const konstaReact = process.env.KONSTA_ROOT || '/tmp/konsta/src/react';
const outRoot = join(repoRoot, 'src/react');

if (process.env.PORT_KONSTA !== '1') {
  console.log(
    'port-konsta-react: skip (committed src/react is source of truth; set PORT_KONSTA=1 and KONSTA_ROOT to refresh)',
  );
  process.exit(0);
}

function transformSource(text) {
  const replacements = [
    ['KonstaContext', 'CapacitorContext'],
    ['KonstaProvider', 'TailwindCapacitorProvider'],
    ['materialTouchRipple', 'touchRipple'],
    ['iosHoverHighlight', 'touchHighlight'],
    [".jsx'", ".tsx'"],
    ['.jsx"', '.tsx"'],
    ['./KonstaContext.js', './CapacitorContext.js'],
    ['from \'./KonstaContext.js\'', 'from \'./CapacitorContext.js\''],
  ];
  let out = text;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  if (!out.startsWith('/* @ts-nocheck */')) {
    out = `/* @ts-nocheck */\n${out}`;
  }
  return out;
}

function walkCopy(srcDir, destDir, extFrom, extTo) {
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    if (statSync(src).isDirectory()) {
      walkCopy(src, join(destDir, name), extFrom, extTo);
      continue;
    }
    if (!name.endsWith(extFrom)) continue;
    if (['ListGroupInner', 'ToolbarPane'].includes(basename(name, extFrom))) {
      continue;
    }
    let base = basename(name, extFrom);
    if (base === 'KonstaProvider') base = 'TailwindCapacitorProvider';
    if (base === 'KonstaContext') base = 'CapacitorContext';
    const dest = join(destDir, `${base}${extTo}`);
    let text = readFileSync(src, 'utf8');
    if (extFrom === '.jsx' || extFrom === '.js') text = transformSource(text);
    writeFileSync(dest, text);
  }
}

if (!existsSync(konstaReact)) {
  console.log(
    `port-konsta-react: skip (no konsta at ${konstaReact}, using committed src/react)`,
  );
  process.exit(0);
}

mkdirSync(outRoot, { recursive: true });
walkCopy(join(konstaReact, 'shared'), join(outRoot, 'shared'), '.js', '.ts');
walkCopy(join(konstaReact, 'shared'), join(outRoot, 'shared'), '.jsx', '.tsx');
walkCopy(join(konstaReact, 'components'), join(outRoot, 'components'), '.jsx', '.tsx');
walkCopy(
  join(konstaReact, 'components', 'icons'),
  join(outRoot, 'components', 'icons'),
  '.jsx',
  '.tsx',
);

for (const legacy of ['KonstaProvider.tsx', 'KonstaContext.ts', 'KonstaContext.js']) {
  try {
    unlinkSync(join(outRoot, 'shared', legacy));
  } catch {
    // ignore
  }
}

if (!existsSync(join(outRoot, 'shared/CapacitorContext.ts'))) {
  writeFileSync(
    join(outRoot, 'shared/CapacitorContext.ts'),
    `import React from 'react';

export const CapacitorContext = React.createContext({
  theme: 'material',
  dark: true,
  touchRipple: true,
});
`,
  );
}

writeFileSync(
  join(outRoot, 'shared/TailwindCapacitorProvider.tsx'),
  `/* @ts-nocheck */
import React from 'react';
import { CapacitorContext } from './CapacitorContext.js';
import { useAutoTheme } from './use-auto-theme.js';

const TailwindCapacitorProvider = (props) => {
  const {
    theme,
    dark,
    touchRipple = true,
    autoThemeDetection = true,
    children,
  } = props;

  const currentTheme = useAutoTheme(theme, autoThemeDetection);

  return (
    <CapacitorContext.Provider
      value={{
        theme: currentTheme,
        dark,
        touchRipple,
      }}
    >
      {children}
    </CapacitorContext.Provider>
  );
};

export { TailwindCapacitorProvider };
`,
);

console.log(`port-konsta-react: wrote ${outRoot}`);
