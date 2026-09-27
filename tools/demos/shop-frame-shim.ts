/**
 * Injected into the ShopInspect bundle by build-demos.js. The same idea as
 * frame-shim.ts, with the bindings ShopInspect's collectors use: they read the
 * page through bare globals, and esbuild rewrites every free reference to these
 * names into live bindings that can be pointed at a sandboxed iframe.
 *
 * Kept apart from frame-shim.ts so a change here cannot alter the WebInspect
 * bundle.
 */
const real = globalThis as any;

export var document: Document = real.document;
export var window: any = real.window;
export var location: { href: string; hostname: string; protocol: string; pathname: string; search: string } =
  real.location;
export var getComputedStyle: any = real.getComputedStyle?.bind(real);
export var Node: any = real.Node;
export var Element: any = real.Element;
export var HTMLElement: any = real.HTMLElement;
export var SVGElement: any = real.SVGElement;
export var HTMLAnchorElement: any = real.HTMLAnchorElement;
export var HTMLImageElement: any = real.HTMLImageElement;
export var HTMLLinkElement: any = real.HTMLLinkElement;
export var HTMLMetaElement: any = real.HTMLMetaElement;
export var HTMLScriptElement: any = real.HTMLScriptElement;
export var HTMLTimeElement: any = real.HTMLTimeElement;

function point(frame: any): void {
  document = frame.document;
  window = frame;
  getComputedStyle = frame.getComputedStyle.bind(frame);
  Node = frame.Node;
  Element = frame.Element;
  HTMLElement = frame.HTMLElement;
  SVGElement = frame.SVGElement;
  HTMLAnchorElement = frame.HTMLAnchorElement;
  HTMLImageElement = frame.HTMLImageElement;
  HTMLLinkElement = frame.HTMLLinkElement;
  HTMLMetaElement = frame.HTMLMetaElement;
  HTMLScriptElement = frame.HTMLScriptElement;
  HTMLTimeElement = frame.HTMLTimeElement;
}

/** Points every binding at `frame`, reporting `url` as the page address. */
export function useFrame(frame: any, url: URL): void {
  point(frame);
  location = {
    href: url.href,
    hostname: url.hostname,
    protocol: url.protocol,
    pathname: url.pathname,
    search: url.search,
  };
}

export function releaseFrame(): void {
  point(real);
  location = real.location;
}
