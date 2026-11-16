import { inject } from '@angular/core';
import { CAPACITOR_CONTEXT } from './capacitor-context.js';

export function useThemeClasses(
  ios?: boolean,
  material?: boolean,
): (base: Record<string, unknown>, className?: string) => Record<string, unknown> {
  const ctx = inject(CAPACITOR_CONTEXT);
  const theme =
    ios === true ? 'ios' : material === true ? 'material' : ctx.theme || 'material';
  return (base, className) => {
    const merge = (segment: Record<string, string>) => {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(segment)) {
        const common = (base.common as Record<string, string>) || {};
        const themed = (base[theme] as Record<string, string>) || {};
        out[key] = [common[key], themed[key], value, className]
          .filter(Boolean)
          .join(' ');
      }
      return out;
    };
    if (base.base && typeof base.base === 'object') {
      return { base: merge(base.base as Record<string, string>) };
    }
    return base;
  };
}
