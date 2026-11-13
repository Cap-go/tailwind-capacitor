import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function joinSafeClassSelector(...parts) {
  const className = parts.join('-');
  return (
    '.' +
    className.replace(/\\/g, '\\\\').replace(/([.#:[\]])/g, '\\$1')
  );
}

const spacingKeys = [
  '0',
  'px',
  '0.5',
  '1',
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '20',
  '24',
  '28',
  '32',
  '36',
  '40',
  '44',
  '48',
  '52',
  '56',
  '60',
  '64',
  '72',
  '80',
  '96',
];

const sides = [
  { side: 'top', pad: 'padding-top', margin: 'margin-top', areaSide: 'top' },
  { side: 'right', pad: 'padding-right', margin: 'margin-right', areaSide: 'right' },
  { side: 'bottom', pad: 'padding-bottom', margin: 'margin-bottom', areaSide: 'bottom' },
  { side: 'left', pad: 'padding-left', margin: 'margin-left', areaSide: 'left' },
];

function cssLength(key) {
  if (key === 'px') return '1px';
  if (key.includes('.')) return `${Number(key) * 0.25}rem`;
  return `${Number(key) * 0.25}rem`;
}

function utilityNameFromSelector(selector) {
  return selector.slice(1).replace(/\\/g, '');
}

const lines = [];

for (const { side, pad, margin, areaSide } of sides) {
  for (const key of spacingKeys) {
    const len = cssLength(key);
    const selPt = joinSafeClassSelector(`p${side[0]}`, key, 'safe');
    const selMt = joinSafeClassSelector(`m${side[0]}`, key, 'safe');
    const selPos = joinSafeClassSelector(side, key, 'safe');

    const blocks = [
      [selPt, `${pad}: calc(var(--c-safe-area-${areaSide}) + ${len});`],
      [selMt, `${margin}: calc(var(--c-safe-area-${areaSide}) + ${len});`],
      [selPos, `${side}: calc(var(--c-safe-area-${areaSide}) + ${len});`],
    ];

    for (const [sel, decl] of blocks) {
      if (!key.includes('.')) {
        lines.push(`@utility ${utilityNameFromSelector(sel)} {`);
        lines.push(`  ${decl}`);
        lines.push('}');
      } else {
        lines.push(`@layer utilities {`);
        lines.push(`  ${sel} {`);
        lines.push(`    ${decl}`);
        lines.push('  }');
        lines.push('}');
      }
    }
  }
}

const outPath = fileURLToPath(
  new URL('../registry/capacitor/styles/safe-areas-generated.css', import.meta.url),
);
writeFileSync(outPath, `${lines.join('\n')}\n`);
console.log(`wrote ${outPath}`);
