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
      /(const theme(?:Classes|ClassesFn) = useThemeClasses\([^)]*\);)/,
      `$1\n  const dark = useDarkClasses();`,
    );
  }
  return src;
}

function collapseDuplicateColors(src) {
  let prev;
  do {
    prev = src;
    src = src.replace(/,\s*colors(\s*,\s*colors)+/g, ', colors');
  } while (src !== prev);
  return src;
}

const classNameObj = "{ className: className ?? '' }";

function fixClassesCalls(src, fn, params) {
  const props = '(.+?)';
  if (params.length === 4) {
    const p2 = params[2];
    const p3 = params[3];
    if (p2 === 'classes' && (p3 === 'darkClasses' || p3 === 'dark')) {
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\s*,\\s*\\{\\s*className[^}]+\\}\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, className ?? '', dark)`,
      );
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\s*,\\s*className\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, className ?? '', dark)`,
      );
    } else if (p3.startsWith('{')) {
      if (fn === 'DialogClasses') {
        src = src.replace(
          new RegExp(
            `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\)(?!,)`,
            'gs',
          ),
          `${fn}($1, colors, className ?? '', { hasButtons: Boolean(buttons) })`,
        );
      }
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\s*,\\s*(\\{\\s*className[^}]+\\})\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, $2, dark)`,
      );
    } else {
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\s*,\\s*(\\{\\s*className[^}]+\\})\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, $2, dark)`,
      );
    }
  } else if (params.length === 3) {
    const p2 = params[2];
    if (p2 === 'darkClasses' || p2 === 'dark') {
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors(?:\\s*,\\s*colors)*\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, dark)`,
      );
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*(\\{\\s*className[^}]+\\})\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, dark)`,
      );
    } else if (p2 === 'classes') {
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors\\s*,\\s*\\{\\s*className[^}]+\\}\\)`,
          'gs',
        ),
        `${fn}($1, colors, className ?? '')`,
      );
      src = src.replace(
        new RegExp(`${fn}\\(${props},\\s*colors\\)`, 'gs'),
        `${fn}($1, colors, className ?? '')`,
      );
    } else {
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*(\\{\\s*className[^}]+\\})\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, $2)`,
      );
      src = src.replace(
        new RegExp(
          `${fn}\\(${props},\\s*colors\\s*,\\s*dark\\)`,
          'gs',
        ),
        `${fn}($1, colors, ${classNameObj})`,
      );
    }
  } else if (params.length === 2) {
    src = src.replace(
      new RegExp(
        `${fn}\\(${props},\\s*(\\{\\s*className[^}]+\\})(?:\\s*,\\s*dark)?\\)`,
        'gs',
      ),
      `${fn}($1, colors)`,
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

  src = collapseDuplicateColors(src);

  const colorsM = src.match(
    /import \{ (\w+) \} from '\.\.\/\.\.\/shared\/colors\/(\w+)Colors\.js'/,
  );
  const classesM = src.match(
    /import \{ (\w+) \} from '\.\.\/\.\.\/shared\/classes\/(\w+)Classes\.js'/,
  );

  if (colorsM && colorsNeedsDark(colorsM[1])) {
    src = ensureDarkHook(src);
    if (!src.includes(`${colorsM[1]}(colorsProp, dark)`)) {
      src = src.replace(
        new RegExp(`${colorsM[1]}\\(colorsProp\\)`, 'g'),
        `${colorsM[1]}(colorsProp, dark)`,
      );
    }
  }

  if (classesM) {
    const fn = classesM[1];
    const params = classesArity(fn);
    src = fixClassesCalls(src, fn, params);
    src = collapseDuplicateColors(src);
  }

  if (src !== before) {
    writeFileSync(path, src);
    fixed += 1;
  }
}

console.log(`fix-react-konsta-dark: ${fixed} files`);