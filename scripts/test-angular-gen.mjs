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
  if (!source.includes('@Input(') || !source.includes('@Output(')) {
    throw new Error(`${rel} must declare inputs and outputs`);
  }
}

const avatarPath = join(repoRoot, 'src/angular/components/Avatar.component.ts');
const avatarSource = readFileSync(avatarPath, 'utf8');
if (!avatarSource.includes('implements OnInit, OnChanges')) {
  throw new Error('Angular Avatar must initialize host classes in ngOnInit');
}

const dark = (classNames) => (classNames ? classNames : '');
ButtonColors({}, dark);

if (existsSync(join(repoRoot, 'public/r/angular/capacitor-button.json'))) {
  const strict = spawnSync('node', ['scripts/test-angular-strict-build.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (strict.status !== 0) process.exit(strict.status ?? 1);
}

console.log('test-angular-gen: ok');
