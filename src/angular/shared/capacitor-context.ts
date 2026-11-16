import { InjectionToken, signal } from '@angular/core';

export type CapacitorContextValue = {
  theme: 'ios' | 'material';
  dark: boolean;
  touchRipple: boolean;
};

export const CAPACITOR_CONTEXT = new InjectionToken<CapacitorContextValue>(
  'CapacitorContext',
  {
    factory: () => ({
      theme: 'material',
      dark: true,
      touchRipple: true,
    }),
  },
);

export function readCapacitorContext() {
  const injected = signal<CapacitorContextValue | null>(null);
  return injected;
}
