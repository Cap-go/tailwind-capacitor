import { cls } from '../../shared/cls.js';

const propClasses = (
  classesObj: Record<string, unknown>,
  theme: string,
  state?: string,
) => {
  if (typeof classesObj === 'string') return classesObj;
  const arr = [
    (classesObj as { common?: string }).common,
    (classesObj as Record<string, string>)[theme],
  ];
  if (state && (classesObj as Record<string, unknown>)[state]) {
    const stateObj = (classesObj as Record<string, unknown>)[state];
    if (typeof stateObj === 'string') arr.push(stateObj);
    else if (stateObj && typeof stateObj === 'object') {
      const so = stateObj as Record<string, string>;
      arr.push(so.common, so[theme]);
    }
  }
  return arr;
};

export const themeClasses = (
  classesObj: Record<string, unknown>,
  theme: string,
  addBaseClassName = '',
) => {
  const c: Record<string, unknown> = {};
  const themeSubKeys = ['common', 'ios', 'material'];
  Object.keys(classesObj).forEach((key) => {
    const addBaseClass = key === 'base' ? addBaseClassName : '';
    const segment = classesObj[key];
    if (typeof segment === 'string') {
      c[key] = segment;
      return;
    }
    const hasStates =
      typeof segment !== 'string' &&
      Object.keys(segment as Record<string, unknown>).filter(
        (state) => !themeSubKeys.includes(state),
      ).length > 0;
    if (!hasStates) {
      c[key] = cls(propClasses(segment as Record<string, unknown>, theme), addBaseClass);
      return;
    }
    c[key] = {};
    const defaultStateClasses = propClasses(segment as Record<string, unknown>, theme);
    (c[key] as Record<string, string>).default = cls(defaultStateClasses, addBaseClass);
    Object.keys(segment as Record<string, unknown>)
      .filter((state) => !themeSubKeys.includes(state))
      .forEach((state) => {
        (c[key] as Record<string, string>)[state] = cls(
          defaultStateClasses,
          propClasses(segment as Record<string, unknown>, theme, state),
          addBaseClass,
        );
      });
  });
  return c;
};

export function resolveTheme(
  ctx: { theme?: string },
  props: { ios?: boolean; material?: boolean },
) {
  let theme = ctx.theme || 'ios';
  if (props.ios) theme = 'ios';
  if (props.material) theme = 'material';
  return theme;
}
