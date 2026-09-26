/**
 * The WebInspect checks that run on a plain web page, bundled from the
 * extension source so the demo and the extension can never disagree.
 */
import {
  parseColor,
  flatten,
  contrastRatio,
  wcagLevel,
  formatRatio,
} from '@ext/inspectors/accessibility/contrast';
import { collect } from '@ext/content/dom-inspector';
import { collectSubresources, collectIframes } from '@ext/content/collect-elements';
import { runInspection } from '@ext/inspectors/engine';
import { scoreLabel, scoreBand } from '@ext/scoring/score-engine';
import { CATEGORY_LABELS } from '@shared/constants';
import type { InspectionCategory, PageSnapshot, SnapshotField } from '@shared/types';
import { useFrame, releaseFrame } from './frame-shim';

export { scoreLabel, scoreBand, CATEGORY_LABELS };

export function checkContrast(foreground: string, background: string) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  // A translucent background sits on white, as it would on a blank page.
  const base = flatten(bg, { r: 255, g: 255, b: 255, a: 1 });
  const ratio = contrastRatio(flatten(fg, base), base);
  return {
    ratio,
    label: formatRatio(ratio),
    normal: wcagLevel(ratio, false),
    large: wcagLevel(ratio, true),
  };
}

/* ------------------------------------------------------------ url check --- */

/**
 * A browser page cannot read another site's HTML directly, so it is fetched
 * through Jina Reader, which renders the page first and returns the resulting
 * HTML with CORS headers.
 */
const READER = 'https://r.jina.ai/';

/** Everything except the resource timeline, which a fetched page does not have. */
const FIELDS: SnapshotField[] = [
  'meta', 'headings', 'images', 'links', 'forms', 'text',
  'structuredData', 'accessibility', 'contrast', 'layout', 'technology',
];

const LOAD_TIMEOUT = 8000;

export function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchHtml(url: URL): Promise<string> {
  let response: Response;
  try {
    response = await fetch(READER + url.href, { headers: { 'X-Return-Format': 'html' } });
  } catch {
    throw new Error('The page could not be fetched. Check your connection and try again.');
  }
  if (response.status === 429) {
    throw new Error('Too many checks in a short time. Wait a minute and try again.');
  }
  if (!response.ok) {
    throw new Error('That page could not be fetched. It may be offline or blocking automated visits.');
  }
  return response.text();
}

/**
 * The fetched markup, made safe to render: a base URL so relative images and
 * stylesheets resolve against the real site, and no meta refresh. Executable
 * scripts get an inert type. The sandbox would block them anyway, but it logs
 * an error for each one; the tags stay, since technology detection reads them.
 */
function prepare(html: string, url: URL): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('meta[http-equiv="refresh" i]').forEach((node) => node.remove());
  parsed.querySelectorAll('script').forEach((node) => {
    const type = (node.getAttribute('type') ?? '').trim().toLowerCase();
    if (!type || type === 'module' || /(java|ecma)script/.test(type)) {
      node.setAttribute('type', 'text/x-inert');
    }
  });
  parsed.querySelectorAll('base').forEach((node) => node.remove());
  const base = parsed.createElement('base');
  base.href = url.href;
  parsed.head.prepend(base);
  return `<!DOCTYPE html>${parsed.documentElement.outerHTML}`;
}

/**
 * Renders the page in a sandboxed iframe. No allow-scripts, so nothing on the
 * fetched page runs; allow-same-origin only so the collectors can read it.
 *
 * 375px wide, a small phone. The extension measures in whatever window it is
 * open in; here there is a choice, and at phone width the overflow check is a
 * real mobile result and a full-width block does not read as a fixed width.
 */
function render(html: string): Promise<HTMLIFrameElement> {
  const host = (globalThis as any).document as Document;
  const frame = host.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText =
    'position:absolute;left:-10000px;top:0;width:375px;height:812px;border:0;pointer-events:none;';

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(frame);
    };
    frame.addEventListener('load', finish, { once: true });
    setTimeout(finish, LOAD_TIMEOUT);
    frame.srcdoc = html;
    host.body.append(frame);
  });
}

export async function inspectUrl(input: string) {
  const url = normalizeUrl(input);
  if (!url) throw new Error('That does not look like a web address.');

  const html = await fetchHtml(url);
  const frame = await render(prepare(html, url));

  let snapshot: PageSnapshot;
  try {
    useFrame(frame.contentWindow, url);
    snapshot = collect(FIELDS);
    const https = url.protocol === 'https:';
    snapshot.subresources = collectSubresources(url.href, https);
    snapshot.iframes = collectIframes(url.href);
    // The sandboxed frame shares this site's cookie jar, not the target's.
    if (snapshot.technology) snapshot.technology.cookieNames = [];
  } finally {
    releaseFrame();
    frame.remove();
  }

  return runInspection(snapshot, {
    stage: 2,
    settings: {
      // No resource timeline, so performance is left out rather than scored.
      enabled: { performance: false } as Record<InspectionCategory, boolean>,
      contrastChecks: true,
    },
  });
}
