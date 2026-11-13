import { writeFileSync } from 'node:fs';

const lines = [];
for (let i = 1; i <= 12; i++) {
  lines.push(`@utility line-clamp-${i} {`);
  lines.push('  overflow: hidden;');
  lines.push('  display: -webkit-box;');
  lines.push('  -webkit-box-orient: vertical;');
  lines.push(`  -webkit-line-clamp: ${i};`);
  lines.push('}');
}

const out = new URL('../registry/capacitor/styles/line-clamp.css', import.meta.url);
writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`wrote ${out.pathname}`);
