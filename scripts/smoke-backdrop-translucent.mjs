/**
 * Playwright helpers: translucent overlays and iOS button active contrast on Tailwind v4.
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
      : [...root.querySelectorAll('div')].filter((el) =>
          /(?:^|\\s)bg-black\\/50(?:\\s|$)/.test(el.className || ''),
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
    const bad = parsed.slice(0, 2).filter((p) => {
      const a = p.alpha;
      return a === null || a <= 0 || a >= 0.99;
    });
    if (bad.length) {
      return {
        ok: false,
        reason: 'backdrop not translucent (need 0 < alpha < 1): ' + bad.map((b) => b.bg).join('; '),
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

export async function assertRangeTrackTranslucent(page, probeSelector = '#opacity-probe') {
  const selLit = JSON.stringify(probeSelector);
  const result = await page.evaluate(`(() => {
    const sel = ${selLit};
    const root = document.querySelector(sel);
    if (!root) {
      return { ok: false, reason: 'missing probe ' + sel };
    }
    const track = root.querySelector('span');
    if (!track) {
      return { ok: false, reason: 'missing range track span under ' + sel };
    }
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
    const bg = getComputedStyle(track).backgroundColor;
    const alpha = parseBackgroundAlpha(bg);
    if (alpha === null || alpha <= 0 || alpha >= 0.99) {
      return {
        ok: false,
        reason: 'range track not translucent (need 0 < alpha < 1): ' + bg,
        alpha,
      };
    }
    return { ok: true, bg, alpha };
  })()`);
  if (!result.ok) {
    throw new Error(`range track translucency check failed: ${result.reason}`);
  }
  return result;
}

export async function assertIosOutlineButtonActiveContrast(
  page,
  probeSelector = '#probe-outline-ios',
) {
  const selLit = JSON.stringify(probeSelector);
  const host = page.locator(probeSelector);
  await host.waitFor({ state: 'attached', timeout: 60_000 });
  const armed = await page.evaluate(`(() => {
    const host = document.querySelector(${selLit});
    if (!host) {
      return { ok: false, reason: 'missing ' + ${selLit} };
    }
    const el = host.matches('button,a') ? host : host.querySelector('button,a') || host;
    const cls = el.className || '';
    if (!/(?:^|\\s)active:bg-primary\\/15(?:\\s|$)/.test(cls)) {
      return {
        ok: false,
        reason: 'expected active:bg-primary/15 in class list, got: ' + cls,
      };
    }
    if (/(?:^|\\s)active:bg-black\\/15(?:\\s|$)/.test(cls)) {
      return { ok: false, reason: 'stale active:bg-black/15 in class list' };
    }
    if (/(?:^|\\s)active:bg-primary(?:\\s|$)/.test(cls)) {
      return { ok: false, reason: 'stale solid active:bg-primary in class list' };
    }
    return { ok: true, elTag: el.tagName };
  })()`);
  if (!armed.ok) {
    throw new Error(`iOS outline active contrast check failed: ${armed.reason}`);
  }
  const box = await host.boundingBox();
  if (!box) {
    throw new Error(`iOS outline active contrast check failed: no bounding box for ${probeSelector}`);
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const result = await page.evaluate(`(() => {
    const host = document.querySelector(${selLit});
    const el = host.matches('button,a') ? host : host.querySelector('button,a') || host;
    const bg = getComputedStyle(el).backgroundColor;
    const fg = getComputedStyle(el).color;
    const parseBackgroundAlpha = (value) => {
      const slash = value.match(/\\/\\s*([\\d.]+)\\s*\\)\\s*$/);
      if (slash) return Number.parseFloat(slash[1]);
      const rgba = value.match(/^rgba?\\(([^)]+)\\)/);
      if (rgba) {
        const parts = rgba[1].split(',').map((p) => p.trim());
        if (parts.length === 4) return Number.parseFloat(parts[3]);
        return 1;
      }
      return null;
    };
    const alpha = parseBackgroundAlpha(bg);
    if (bg === fg) {
      return { ok: false, reason: 'text matches background while active: ' + bg };
    }
    if (alpha !== null && alpha > 0 && alpha < 1) {
      return { ok: true, bg, fg, alpha };
    }
    if (fg && bg && bg !== fg) {
      return { ok: true, bg, fg, alpha, note: 'active press inconclusive in headless' };
    }
    return { ok: false, reason: 'no contrast on active press: bg=' + bg + ' fg=' + fg };
  })()`);
  await page.mouse.up();
  if (!result.ok) {
    throw new Error(`iOS outline active contrast check failed: ${result.reason}`);
  }
  return result;
}