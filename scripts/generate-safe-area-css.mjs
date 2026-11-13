import { writeFileSync } from 'node:fs';

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
  { side: 'top', first: 't', upper: 'Top', areaSide: 'top' },
  { side: 'right', first: 'r', upper: 'Right', areaSide: 'right' },
  { side: 'bottom', first: 'b', upper: 'Bottom', areaSide: 'bottom' },
  { side: 'left', first: 'l', upper: 'Left', areaSide: 'left' },
];

function cssLength(key) {
  if (key === 'px') return '1px';
  if (key.includes('.')) return `${Number(key) * 0.25}rem`;
  return `${Number(key) * 0.25}rem`;
}

const lines = ['@layer utilities {'];

for (const { side, first, upper, areaSide } of sides) {
  for (const key of spacingKeys) {
    const len = cssLength(key);
    const selPt = joinSafeClassSelector(`p${first}`, key, 'safe');
    const selMt = joinSafeClassSelector(`m${first}`, key, 'safe');
    const selPos = joinSafeClassSelector(side, key, 'safe');
    lines.push(`  ${selPt} {`);
    lines.push(
      `    padding${upper}: calc(var(--c-safe-area-${areaSide}) + ${len});`,
    );
    lines.push('  }');
    lines.push(`  ${selMt} {`);
    lines.push(
      `    margin${upper}: calc(var(--c-safe-area-${areaSide}) + ${len});`,
    );
    lines.push('  }');
    lines.push(`  ${selPos} {`);
    lines.push(`    ${side}: calc(var(--c-safe-area-${areaSide}) + ${len});`);
    lines.push('  }');
  }
}

lines.push('}');

const outPath = new URL(
  '../registry/capacitor/styles/safe-areas-generated.css',
  import.meta.url,
);
writeFileSync(outPath, `${lines.join('\n')}\n`);
console.log(`wrote ${outPath.pathname}`);
