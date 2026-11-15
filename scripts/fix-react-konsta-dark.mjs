import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';

function classesArity(classesFn) {
  const path = join(repoRoot, `src/shared/classes/${classesFn}.js`);
  try {
    const src = readFileSync(path, 'utf8');
    const m = src.match(
      new RegExp(`export const ${classesFn} = \\(([\\s\\S]*?)\\)\\s*=>`),
    );
    if (!m) return [];
    return m[1]
      .split(',')
      .map((p) => p.trim().split('=')[0].trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function colorsNeedsDark(colorsFn) {
  const path = join(repoRoot, `src/shared/colors/${colorsFn}.js`);
  try {
    const src = readFileSync(path, 'utf8');
    return /export const \w+ = \(colorsProp[^,]*,\s*dark\)/.test(src);
  } catch {
    return false;
  }
}

function ensureDarkHook(src) {
  if (!src.includes('useDarkClasses()')) {
    if (!src.includes('use-dark-classes')) {
      src = src.replace(
        /import \{ useThemeClasses \} from '\.\.\/shared\/use-theme-classes\.js';/,
        `import { useThemeClasses } from '../shared/use-theme-classes.js';\nimport { useDarkClasses } from '../shared/use-dark-classes.js';`,
      );
    }
    src = src.replace(
      /(const theme(?:Classes|ClassesFn) = useThemeClasses\(\{ ios, material \}\);)/,
      `$1\n  const dark = useDarkClasses();`,
    );
  }
  return src;
}

const componentsDir = join(repoRoot, 'src/react/components');
let fixed = 0;

for (const file of readdirSync(componentsDir)) {
  if (!file.endsWith('.tsx')) continue;
  const path = join(componentsDir, file);
  let src = readFileSync(path, 'utf8');
  const before = src;

  const colorsM = src.match(
    /import \{ (\w+) \} from '\.\.\/\.\.\/shared\/colors\/(\w+)Colors\.js'/,
  );
  const classesM = src.match(
    /import \{ (\w+) \} from '\.\.\/\.\.\/shared\/classes\/(\w+)Classes\.js'/,
  );

  if (colorsM && colorsNeedsDark(colorsM[1])) {
    src = ensureDarkHook(src);
    src = src.replace(
      new RegExp(`${colorsM[1]}\\(colorsProp\\)`, 'g'),
      `${colorsM[1]}(colorsProp, dark)`,
    );
  }

  if (classesM) {
    const fn = classesM[1];
    const params = classesArity(fn);
    const classNameObj = '{ className: className ?? \'\' }';

    if (params.length === 2) {
      src = src.replace(
        new RegExp(`${fn}\\(([^;]+?),\\s*\\{\\s*className[^}]+\\}\\s*(?:,\\s*dark\\s*)?\\)`, 'g'),
        `${fn}($1, colors)`,
      );
    } else if (
      params.length === 3 &&
      (params[2] === 'darkClasses' || params[2] === 'dark')
    ) {
      src = src.replace(
        new RegExp(`${fn}\\(([^;]+?),\\s*\\{\\s*className[^}]+\\}\\s*,\\s*dark\\)`, 'g'),
        `${fn}($1, colors, dark)`,
      );
    } else if (params.length === 3) {
      src = src.replace(
        new RegExp(`${fn}\\(([^;]+?),\\s*\\{\\s*className[^}]+\\}\\s*,\\s*dark\\)`, 'g'),
        `${fn}($1, colors, ${classNameObj})`,
      );
      src = src.replace(
        new RegExp(`${fn}\\(([^;]+?),\\s*colors,\\s*dark\\)`, 'g'),
        `${fn}($1, colors, ${classNameObj})`,
      );
    } else if (params.length === 4) {
      src = src.replace(
        new RegExp(
          `${fn}\\(([^;]+?),\\s*\\{\\s*className[^}]+\\}\\s*,\\s*dark\\)`,
          'g',
        ),
        `${fn}($1, colors, ${classNameObj}, dark)`,
      );
    }
  }

  if (src !== before) {
    writeFileSync(path, src);
    fixed += 1;
  }
}

console.log(`fix-react-konsta-dark: ${fixed} files`);