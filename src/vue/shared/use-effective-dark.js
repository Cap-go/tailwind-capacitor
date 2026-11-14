import { computed, onMounted, onUnmounted, ref, toValue } from 'vue';

import { effectiveDarkValue } from './effective-dark-value.js';

export function useEffectiveDark(darkProp) {
  const prefersDark = ref(false);
  let media;
  let listener;

  onMounted(() => {
    if (typeof window === 'undefined') return;
    media = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.value = media.matches;
    listener = () => {
      prefersDark.value = media.matches;
    };
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }
  });

  onUnmounted(() => {
    if (media && listener) {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    }
  });

  return computed(() =>
    effectiveDarkValue(toValue(darkProp), prefersDark.value),
  );
}
