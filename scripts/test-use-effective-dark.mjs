import { effectiveDarkValue } from '../src/vue/shared/effective-dark-value.js';

const cases = [
  { dark: undefined, prefers: false, want: false, label: 'unset+light OS' },
  { dark: undefined, prefers: true, want: true, label: 'unset+dark OS' },
  { dark: true, prefers: false, want: true, label: 'explicit true' },
  { dark: false, prefers: true, want: false, label: 'explicit false' },
];

for (const c of cases) {
  const got = effectiveDarkValue(c.dark, c.prefers);
  if (got !== c.want) {
    throw new Error(`${c.label}: expected ${c.want}, got ${got}`);
  }
}

console.log('test-use-effective-dark: ok');
