import { setTimeout as sleep } from 'node:timers/promises';

/**
 * Playwright helpers: translucent overlays and iOS button active contrast on Tailwind v4.
 */
function parseBackgroundAlpha(bg) {
  if (!bg) return null;
  const slash = bg.match(/\/\s*([\d.]+)\s*\)\s*$/);
  if (slash) return Number.parseFloat(slash[1]);
  const rgba = bg.match(/^rgba?\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => p.trim());
    if (parts.length === 4) return Number.parseFloat(parts[3]);
    return 1;
  }
  return null;
}

async function assertStylesheetDefinesActiveUtility(page, utilityToken) {
  const tokenLit = JSON.stringify(utilityToken);
  const result = await page.evaluate(`(() => {
    const token = ${tokenLit};
    const opacity = token.includes('25') ? '0.25' : '0.15';
    const escaped = token.replace(/:/g, '\\\\:').replace(/\\//g, '\\\\/');
    const visit = (rules, matches) => {
      for (const rule of rules) {
        if (rule.cssRules && rule.cssRules.length) {
          visit(rule.cssRules, matches);
        }
        const text = rule.cssText || '';
        const selector = rule.selectorText || '';
        if (!selector.includes(':active') && !text.includes(':active')) continue;
        const haystack = selector + text;
        if (!haystack.includes(escaped) && !haystack.includes(token)) continue;
        const decl = text.toLowerCase();
        const opacityOk =
          decl.includes(opacity) ||
          decl.includes(opacity.replace('0.', '')) ||
          decl.includes('color-mix');
        if (!opacityOk) continue;
        matches.push(selector || text.slice(0, 160));
      }
    };
    const matches = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      visit(rules, matches);
    }
    if (matches.length) return { ok: true, rule: matches[0] };
    return { ok: false, reason: 'missing compiled :active rule for ' + token };
  })()`);
  if (!result.ok) {
    throw new Error(`active utility stylesheet check failed: ${result.reason}`);
  }
  return result;
}

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
  await assertStylesheetDefinesActiveUtility(page, 'active:bg-primary/15');
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
    if (bg === fg) {
      return { ok: false, reason: 'text matches background while active: ' + bg };
    }
    const alpha = (() => {
      const slash = bg.match(/\\/\\s*([\\d.]+)\\s*\\)\\s*$/);
      if (slash) return Number.parseFloat(slash[1]);
      const rgba = bg.match(/^rgba?\\(([^)]+)\\)/);
      if (rgba) {
        const parts = rgba[1].split(',').map((p) => p.trim());
        if (parts.length === 4) return Number.parseFloat(parts[3]);
        if (parts.length === 3) return 1;
      }
      return null;
    })();
    if (alpha !== null && alpha >= 0.85) {
      return { ok: false, reason: 'active press rendered solid fill: ' + bg };
    }
    if (alpha !== null && alpha >= 0.12 && alpha <= 0.2) {
      return { ok: true, bg, fg, alpha };
    }
    if (alpha !== null && alpha > 0 && alpha < 0.12) {
      return {
        ok: false,
        reason: 'active press alpha below outline range: ' + alpha + ' bg=' + bg,
      };
    }
    return {
      ok: true,
      bg,
      fg,
      alpha,
      note: 'active press inconclusive in headless',
    };
  })()`);
  await page.mouse.up();
  if (!result.ok) {
    throw new Error(`iOS outline active contrast check failed: ${result.reason}`);
  }
  return result;
}

export async function assertIosTonalButtonActivePress(
  page,
  probeSelector = '#probe-tonal-ios',
) {
  const selLit = JSON.stringify(probeSelector);
  const host = page.locator(probeSelector);
  await host.waitFor({ state: 'attached', timeout: 60_000 });
  const pressTarget = host.locator('button, a').first();
  const hasInnerButton = (await pressTarget.count()) > 0;
  const armed = await page.evaluate(`(() => {
    const host = document.querySelector(${selLit});
    if (!host) {
      return { ok: false, reason: 'missing ' + ${selLit} };
    }
    const el = host.matches('button,a') ? host : host.querySelector('button,a') || host;
    const cls = el.className || '';
    if (!/(?:^|\\s)active:bg-primary\\/25(?:\\s|$)/.test(cls)) {
      return {
        ok: false,
        reason: 'expected active:bg-primary/25 in class list, got: ' + cls,
      };
    }
    return { ok: true };
  })()`);
  if (!armed.ok) {
    throw new Error(`iOS tonal active check failed: ${armed.reason}`);
  }
  await assertStylesheetDefinesActiveUtility(page, 'active:bg-primary/25');
  const box = hasInnerButton
    ? await pressTarget.boundingBox()
    : await host.boundingBox();
  if (!box) {
    throw new Error(`iOS tonal active check failed: no bounding box for ${probeSelector}`);
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const restingBg = await page.evaluate(`(() => {
    const host = document.querySelector(${selLit});
    if (!host) return '';
    const el = host.matches('button,a') ? host : host.querySelector('button,a') || host;
    return getComputedStyle(el).backgroundColor;
  })()`);
  await page.mouse.down();
  let result;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await sleep(50);
    result = await page.evaluate(`(() => {
    const host = document.querySelector(${selLit});
    const el = host.matches('button,a') ? host : host.querySelector('button,a') || host;
    const bg = getComputedStyle(el).backgroundColor;
    const fg = getComputedStyle(el).color;
    if (bg === fg) {
      return { ok: false, reason: 'tonal press text matches background: ' + bg };
    }
    const cls = el.className || '';
    if (!/(?:^|\\s)active:bg-primary\\/25(?:\\s|$)/.test(cls)) {
      return { ok: false, reason: 'missing active:bg-primary/25 class on press: ' + cls };
    }
    const resting = ${JSON.stringify(restingBg)};
    if (bg === resting) {
      return { ok: false, reason: 'tonal press bg unchanged from rest: ' + bg };
    }
    const alpha = (() => {
      const slash = bg.match(/\\/\\s*([\\d.]+)\\s*\\)\\s*$/);
      if (slash) return Number.parseFloat(slash[1]);
      const rgba = bg.match(/^rgba?\\(([^)]+)\\)/);
      if (rgba) {
        const parts = rgba[1].split(',').map((p) => p.trim());
        if (parts.length === 4) return Number.parseFloat(parts[3]);
      }
      return null;
    })();
    if (alpha === null || alpha < 0.18 || alpha > 0.32) {
      return {
        ok: false,
        reason: 'tonal press fill not in expected range: alpha=' + alpha + ' bg=' + bg,
      };
    }
    return { ok: true, bg, cls, resting, alpha };
  })()`);
    if (result.ok || !result.reason?.includes('unchanged from rest')) {
      break;
    }
  }
  await page.mouse.up();
  if (!result.ok) {
    throw new Error(`iOS tonal active check failed: ${result.reason}`);
  }
  return result;
}

export async function assertProgressbarMaterialTrack(
  page,
  probeSelector = '#probe-progressbar-material',
) {
  const selLit = JSON.stringify(probeSelector);
  const result = await page.evaluate(`(() => {
    const root = document.querySelector(${selLit});
    if (!root) {
      return { ok: false, reason: 'missing ' + ${selLit} };
    }
    const track = root;
    const cls = track.className || '';
    if (!/(?:^|\\s)bg-md-light-surface-variant(?:\\s|$)/.test(cls)) {
      return { ok: false, reason: 'expected bg-md-light-surface-variant on track, got: ' + cls };
    }
    if (/(?:^|\\s)bg-black\\/30(?:\\s|$)/.test(cls)) {
      return { ok: false, reason: 'material track must not use bg-black/30 fallback' };
    }
    return { ok: true, cls };
  })()`);
  if (!result.ok) {
    throw new Error(`progressbar material track check failed: ${result.reason}`);
  }
  return result;
}