import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { readFileSync } from 'node:fs';

const css = readFileSync(
  new URL('../registry/capacitor/styles/tailwind-capacitor.css', import.meta.url),
  'utf8',
);

const from = new URL(
  '../registry/capacitor/styles/tailwind-capacitor.css',
  import.meta.url,
).pathname;
const result = await postcss([tailwindcss()]).process(css, { from });
if (!result.css.includes('.top-safe')) {
  console.error('missing top-safe utility');
  process.exit(1);
}
console.log('smoke-tailwind-v4: ok', result.css.length);
