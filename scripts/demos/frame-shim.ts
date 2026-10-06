/**
 * Injected into the WebInspect bundle by build-demos.js.
 *
 * The extension's collectors read the page through bare globals: `document`,
 * `location`, `getComputedStyle`, `instanceof HTMLElement` and so on. esbuild
 * rewrites every free reference to those names into these live bindings, so
 * the same collectors can be pointed at a sandboxed iframe holding a fetched
 * page instead of the page they run in. Outside a run they are the real ones.
 */
const real = globalThis as any;

export var document: Document = real.document;
export var window: any = real.window;
export var location: { href: string; hostname: string; protocol: string } = real.location;
export var getComputedStyle: any = real.getComputedStyle?.bind(real);
export var performance: Performance = real.performance;
export var Node: any = real.Node;
export var Text: any = real.Text;
export var Element: any = real.Element;
export var HTMLElement: any = real.HTMLElement;
export var SVGElement: any = real.SVGElement;
export var HTMLAnchorElement: any = real.HTMLAnchorElement;
export var HTMLInputElement: any = real.HTMLInputElement;
export var HTMLLinkElement: any = real.HTMLLinkElement;
export var HTMLScriptElement: any = real.HTMLScriptElement;

function point(frame: any): void {
  document = frame.document;
  window = frame;
  getComputedStyle = frame.getComputedStyle.bind(frame);
  Node = frame.Node;
  Text = frame.Text;
  Element = frame.Element;
  HTMLElement = frame.HTMLElement;
  SVGElement = frame.SVGElement;
  HTMLAnchorElement = frame.HTMLAnchorElement;
  HTMLInputElement = frame.HTMLInputElement;
  HTMLLinkElement = frame.HTMLLinkElement;
  HTMLScriptElement = frame.HTMLScriptElement;
}

/** Points every binding at `frame`, reporting `url` as the page address. */
export function useFrame(frame: any, url: URL): void {
  point(frame);
  location = { href: url.href, hostname: url.hostname, protocol: url.protocol };
  // The fetched page never ran, so it has no resource timeline or paint timing.
  performance = { getEntriesByType: () => [] } as unknown as Performance;
}

export function releaseFrame(): void {
  point(real);
  location = real.location;
  performance = real.performance;
}
