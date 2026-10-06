/**
 * The SiteExtract pipeline, bundled from the extension source so the demo and
 * the extension can never disagree. Snapshot mode only: the extension reads the
 * live tab, and here the rendered page comes from Jina Reader instead.
 *
 * What differs from the extension, and why:
 *  - No host permissions, so a file only downloads when its server allows
 *    cross-origin requests. The rest keep their remote URLs, exactly as they
 *    do in the extension when host access is declined.
 *  - No cookies are sent anywhere. The extension sends them to the page's own
 *    site; this page has no business carrying a visitor's session elsewhere.
 *  - Tighter limits: 5 MB and 8 seconds a file, no retry. A refused
 *    cross-origin request fails the same way twice, and a visitor trying a
 *    demo should not pull down a page's videos or wait on a slow server.
 */
import { buildProject } from '@ext/pipeline/project';
import type { BuildResult } from '@ext/pipeline/project';
import { createFetcher, isPrivateHost } from '@ext/pipeline/fetcher';
import { zipProject } from '@ext/pipeline/zip';
import { sampleTokens } from '@ext/content/tokens-sample';
import { classifySite, skipReason } from '@ext/data/common-sites';
import { DEFAULT_SETTINGS } from '@shared/constants';
import { formatBytes, plural, projectName } from '@shared/utilities';
import type { ExtractOptions, PageCapture, Progress, TokenSamples } from '@shared/types';

export { formatBytes, plural };

/** Renders the page first, so the HTML is what a visitor sees. Sends CORS headers. */
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
    throw new Error('Too many extracts in a short time. Wait a minute and try again.');
  }
  if (!response.ok) {
    throw new Error('That page could not be fetched. It may be offline or blocking automated visits.');
  }
  return response.text();
}

/**
 * A copy of the page that is safe to render for token sampling: scripts made
 * inert, no refresh, and a base URL so its stylesheets resolve against the real
 * site. The project itself is built from the untouched HTML.
 */
function renderable(html: string, url: URL): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script').forEach((node) => node.setAttribute('type', 'text/x-inert'));
  // The sandbox blocks inline handlers too, but logs an error for each one.
  parsed.querySelectorAll('*').forEach((node) => {
    for (const { name } of Array.from(node.attributes)) {
      if (/^on/i.test(name)) node.removeAttribute(name);
    }
  });
  parsed.querySelectorAll('meta[http-equiv="refresh" i], base').forEach((node) => node.remove());
  const base = parsed.createElement('base');
  base.href = url.href;
  parsed.head.prepend(base);
  return `<!DOCTYPE html>${parsed.documentElement.outerHTML}`;
}

/**
 * Samples computed styles from the page rendered in a sandboxed iframe. No
 * allow-scripts, so nothing on the page runs; allow-same-origin only so its
 * styles can be read. 1280px wide, a laptop, where most people would open the
 * page they want to copy.
 */
function sample(html: string): Promise<TokenSamples | null> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText =
    'position:absolute;left:-10000px;top:0;width:1280px;height:800px;border:0;pointer-events:none;';

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        resolve(frame.contentDocument ? sampleTokens(frame.contentDocument) : null);
      } catch {
        resolve(null);
      } finally {
        frame.remove();
      }
    };
    frame.addEventListener('load', finish, { once: true });
    setTimeout(finish, LOAD_TIMEOUT);
    frame.srcdoc = html;
    document.body.append(frame);
  });
}

export interface Extracted extends BuildResult {
  name: string;
  blob: Blob;
}

export async function extractUrl(
  input: string,
  options: Omit<ExtractOptions, 'mode'>,
  onProgress?: (progress: Progress) => void,
): Promise<Extracted> {
  const url = normalizeUrl(input);
  if (!url) throw new Error('That does not look like a web address.');

  // The extension's own block list, with no override, checked before anything is fetched.
  const blocked = classifySite(url.hostname);
  if (blocked) throw new Error(skipReason(blocked));
  if (isPrivateHost(url.hostname)) throw new Error('That is a private network address, which this page cannot reach.');

  const html = await fetchHtml(url);
  const tokens = options.tokens ? await sample(renderable(html, url)) : null;
  const title = new DOMParser().parseFromString(html, 'text/html').title;

  const capture: PageCapture = {
    url: url.href,
    baseUrl: url.href,
    title,
    html,
    linkedCss: {},
    notes: { shadowRoots: 0, shadowRootsMissed: 0, canvasCaptured: 0, canvasFailed: 0, iframes: [] },
    tokens,
  };

  const fetcher = createFetcher({
    pageUrl: url.href,
    timeoutMs: 8000,
    retries: 0,
    maxBytes: 5 * 1024 * 1024,
    fetchImpl: (target, init) => fetch(target, { ...init, credentials: 'omit' }),
  });

  const result = await buildProject({
    capture,
    html,
    options: { ...options, mode: 'snapshot' },
    fetcher,
    onProgress,
    branding: {
      credit: DEFAULT_SETTINGS.creditComment,
      badge: DEFAULT_SETTINGS.showBadge,
      promo: DEFAULT_SETTINGS.showPromotions,
    },
  });

  const name = projectName(url.href);
  const zip = zipProject(result.files, name);
  return { ...result, name, blob: new Blob([zip], { type: 'application/zip' }) };
}
