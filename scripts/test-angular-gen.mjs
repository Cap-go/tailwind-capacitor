import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './repo-root.mjs';
import { ButtonColors } from '../src/shared/colors/ButtonColors.js';

const avatarPath = join(repoRoot, 'src/angular/components/Avatar.component.ts');
const avatarSource = readFileSync(avatarPath, 'utf8');

if (!avatarSource.includes('implements OnInit, OnChanges')) {
  throw new Error('Angular Avatar must initialize host classes in ngOnInit');
}
if (!avatarSource.includes('this.ctx.dark ? classNames :')) {
  throw new Error('Angular color factories must receive a dark-class callback');
}

const dark = (classNames) => (classNames ? classNames : '');
ButtonColors({}, dark);

console.log('test-angular-gen: ok');
