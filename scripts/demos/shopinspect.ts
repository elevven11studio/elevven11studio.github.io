/**
 * The ShopInspect pipeline, bundled from the extension source so the demo and
 * the extension can never disagree: the same collectors, store adapters,
 * inspectors and score engine, pointed at a fetched page in a sandboxed iframe
 * instead of the tab you have open.
 *
 * What differs from the extension, and why:
 *  - The page comes from Jina Reader, rendered by a browser that is not yours,
 *    so there is no signed-in view, no chosen variant and no cookies.
 *  - A store recognised from its markup (Shopify, WooCommerce and the rest) has
 *    its selectors gathered on a second pass whenever it matches. The extension
 *    only re-reads when the first pass missed a confident price, to save a round
 *    trip to the tab; here the page is already in memory, and store selectors
 *    add candidates rather than replace any.
 */
import { collect } from '@ext/content/product-detector';
import { findAdapter, matchInputOf, selectorsFor } from '@ext/platforms';
import { requiredFields, selectionFrom } from '@ext/inspectors';
import { runInspection } from '@ext/inspectors/engine';
import { verdictBand, verdictLabel, coverageLabel } from '@ext/scoring/score-engine';
import {
  AFFILIATE_DISCLOSURE,
  CATEGORY_LABELS,
  DEFAULT_SETTINGS,
  MIN_COVERAGE_FOR_VERDICT,
  PROMO_TAG,
  SEVERITY_LABELS,
  VERDICT_MEANINGS,
  earnsFromStore,
} from '@shared/constants';
import { formatMoney, isFree } from '@shared/utilities';
import type { ProductSnapshot, SnapshotField } from '@shared/types';
import { useFrame, releaseFrame } from './shop-frame-shim';

export {
  verdictBand,
  verdictLabel,
  coverageLabel,
  formatMoney,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  VERDICT_MEANINGS,
  MIN_COVERAGE_FOR_VERDICT,
  PROMO_TAG,
  AFFILIATE_DISCLOSURE,
};

/** Whether the popup would print the affiliate disclosure beside this verdict. */
export function disclosed(report: { hostname: string; product?: { price?: { value: Parameters<typeof isFree>[0] } } }): boolean {
  return earnsFromStore(report.hostname) && !isFree(report.product?.price?.value);
}

/** Renders the page first and returns the resulting HTML with CORS headers. */
const READER = 'https://r.jina.ai/';

const LOAD_TIMEOUT = 10000;

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
    throw new Error('That page could not be fetched. The store may be blocking automated visits.');
  }
  return response.text();
}

/**
 * The fetched markup, made safe to render: a base URL so images and styles
 * resolve against the store, no refresh, and inert scripts. Structured data is
 * left alone, because it is where most good readings come from.
 */
function prepare(html: string, url: URL): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('meta[http-equiv="refresh" i], base').forEach((node) => node.remove());
  parsed.querySelectorAll('script').forEach((node) => {
    const type = (node.getAttribute('type') ?? '').trim().toLowerCase();
    if (!type || type === 'module' || /(java|ecma)script/.test(type)) {
      node.setAttribute('type', 'text/x-inert');
    }
  });
  // The sandbox blocks inline handlers too, but logs an error for each one.
  parsed.querySelectorAll('*').forEach((node) => {
    for (const { name } of Array.from(node.attributes)) {
      if (/^on/i.test(name)) node.removeAttribute(name);
    }
  });
  const base = parsed.createElement('base');
  base.href = url.href;
  parsed.head.prepend(base);
  return `<!DOCTYPE html>${parsed.documentElement.outerHTML}`;
}

/**
 * No allow-scripts, so nothing on the page runs; allow-same-origin only so the
 * collectors can read it. Laptop width, because the product-page check looks
 * for a visible add-to-basket control and some stores hide it on phones.
 */
function render(html: string): Promise<HTMLIFrameElement> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText =
    'position:absolute;left:-10000px;top:0;width:1280px;height:900px;border:0;pointer-events:none;';

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
    document.body.append(frame);
  });
}

/** The browser's address wins over the page's, as it does in the extension. */
function trust(snapshot: ProductSnapshot, url: URL): ProductSnapshot {
  return { ...snapshot, url: url.href, hostname: url.hostname, protocol: url.protocol };
}

export async function inspectUrl(input: string) {
  const url = normalizeUrl(input);
  if (!url) throw new Error('That does not look like a web address.');

  const html = await fetchHtml(url);
  const frame = await render(prepare(html, url));
  const needs: SnapshotField[] = requiredFields(selectionFrom(DEFAULT_SETTINGS, 2));

  let snapshot: ProductSnapshot;
  try {
    useFrame(frame.contentWindow, url);
    const byHost = findAdapter({ hostname: url.hostname, url: url.href, meta: undefined, platformMarkers: undefined });
    snapshot = trust(collect({ needs, selectors: selectorsFor(byHost) }), url);

    if (snapshot.looksLikeProductPage && !byHost) {
      const byMarkup = findAdapter(matchInputOf(snapshot));
      if (byMarkup?.selectors) snapshot = trust(collect({ needs, selectors: byMarkup.selectors }), url);
    }
  } finally {
    releaseFrame();
    frame.remove();
  }

  return runInspection(snapshot, {
    stage: 2,
    thresholds: DEFAULT_SETTINGS.thresholds,
    settings: { enabled: DEFAULT_SETTINGS.enabled, reviewAnalysis: DEFAULT_SETTINGS.reviewAnalysis },
  });
}
