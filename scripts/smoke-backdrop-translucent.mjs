/**
 * Playwright helper: opened Sheet and Actions backdrops must be translucent on Tailwind v4.
 */
export async function assertOpenBackdropsTranslucent(page, probeSelector = '#backdrop-probe') {
  const selLit = JSON.stringify(probeSelector);
  const result = await page.evaluate(`(() => {
    const sel = ${selLit};
    const root = document.querySelector(sel);
    if (!root) {
      return { ok: false, reason: 'missing probe ' + sel };
    }
    const backdrops = root.querySelectorAll('.backdrop-probe-layer').length
      ? [...root.querySelectorAll('.backdrop-probe-layer')]
      : [...root.querySelectorAll('div')].filter(
          (el) => getComputedStyle(el).position === 'fixed',
        );
    const parseBackgroundAlpha = (bg) => {
      const slash = bg.match(/\\/\\s*([\\d.]+)\\s*\\)\\s*$/);
      if (slash) return Number.parseFloat(slash[1]);
      const rgba = bg.match(/^rgba?\\(([^)]+)\\)/);
      if (rgba) {
        const parts = rgba[1].split(',').map((p) => p.trim());
        if (parts.length === 4) return Number.parseFloat(parts[3]);
        return 1;
      }
      return null;
    };
    const parsed = backdrops.map((el) => {
      const bg = getComputedStyle(el).backgroundColor;
      const alpha = parseBackgroundAlpha(bg);
      return { bg, alpha };
    });
    if (parsed.length < 2) {
      return {
        ok: false,
        reason: 'expected at least 2 backdrop divs under ' + sel + ', got ' + parsed.length,
        parsed,
      };
    }
    const bad = parsed.slice(0, 2).filter((p) => p.alpha === null || p.alpha >= 0.99);
    if (bad.length) {
      return {
        ok: false,
        reason: 'backdrop not translucent: ' + bad.map((b) => b.bg).join('; '),
        parsed,
      };
    }
    return { ok: true, parsed: parsed.slice(0, 2) };
  })()`);
  if (!result.ok) {
    throw new Error(`backdrop translucency check failed: ${result.reason}`);
  }
  return result;
}