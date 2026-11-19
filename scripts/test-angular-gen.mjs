import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './repo-root.mjs';
import { ButtonColors } from '../src/shared/colors/ButtonColors.js';

const required = [
  'src/angular/components/Toggle.component.ts',
  'src/angular/components/Checkbox.component.ts',
  'src/angular/components/ListInput.component.ts',
];

for (const rel of required) {
  const path = join(repoRoot, rel);
  if (!existsSync(path)) {
    throw new Error(`missing generated Angular file: ${rel}`);
  }
  const source = readFileSync(path, 'utf8');
  if (!source.includes('@Input(') || !source.includes('checkedChange')) {
    throw new Error(`${rel} must declare inputs and checkedChange output`);
  }
}

const providerPath = join(
  repoRoot,
  'src/angular/shared/tailwind-capacitor-provider.component.ts',
);
const providerSource = readFileSync(providerPath, 'utf8');
if (!providerSource.includes('get dark()')) {
  throw new Error('Angular provider context must expose reactive dark getter');
}
if (providerSource.includes('appRef.tick')) {
  throw new Error('Angular provider must not call appRef.tick (NG0101)');
}
if (
  !providerSource.includes('ngOnChanges') ||
  !providerSource.includes('refreshEffectiveDark')
) {
  throw new Error('Angular provider must refresh effectiveDark on input changes');
}

const togglePath = join(repoRoot, 'src/angular/components/Toggle.component.ts');
const toggleSource = readFileSync(togglePath, 'utf8');
if (
  !toggleSource.includes('ngDoCheck') ||
  !toggleSource.includes('markForCheck')
) {
  throw new Error('Toggle must react to provider dark via ngDoCheck');
}

const avatarPath = join(repoRoot, 'src/angular/components/Avatar.component.ts');
const avatarSource = readFileSync(avatarPath, 'utf8');
if (!avatarSource.includes('implements OnInit, OnChanges')) {
  throw new Error('Angular Avatar must initialize host classes in ngOnInit');
}

const dark = (classNames) => (classNames ? classNames : '');
ButtonColors({}, dark);

const buttonPath = join(repoRoot, 'src/angular/components/Button.component.ts');
if (existsSync(buttonPath)) {
  const buttonSource = readFileSync(buttonPath, 'utf8');
  const variantInputs = ['@Input() outline', '@Input() clear', '@Input() tonal'];
  for (const needle of variantInputs) {
    if (!buttonSource.includes(needle)) {
      throw new Error('Angular Button must declare outline, clear, and tonal inputs');
    }
  }
  if (
    !buttonSource.includes("c['style']") ||
    !buttonSource.includes('styleClasses') ||
    !buttonSource.includes('?.[style]')
  ) {
    throw new Error('Angular Button must apply style segment classes on the host');
  }
}

if (existsSync(join(repoRoot, 'public/r/angular/capacitor-button.json'))) {
  const strict = spawnSync('node', ['scripts/test-angular-strict-build.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (strict.status !== 0) process.exit(strict.status ?? 1);
}

console.log('test-angular-gen: ok');
