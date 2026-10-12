/**
 * The 11:11 brand mark, as shapes rather than text.
 *
 * Every generator and the site icons draw it from here, so it looks the same
 * everywhere and never depends on which fonts happen to be installed. The
 * geometry is traced from the original Segoe UI Bold 171px "11:11" on a
 * 512x512 grid: rounded outline, four 1s, two colon dots.
 */

// Left edge of each 1's stem. Each stem is 26 wide; the flag reaches 25 left.
const STEMS = [72, 171, 329, 428];

const one = (x) => `<path d="M${x + 5} 202H${x + 26}V323H${x}V229L${x - 25} 243V219Z"/>`;

/**
 * The mark's shapes in 512x512 space, for use inside a <g transform>.
 * `fill` is any paint ("url(#accent)", "#22c55e"). `stroke` is the outline
 * width: 12 matches the watermarks on the social cards; icons use more so
 * the outline survives at 16px.
 */
function markShapes(fill, stroke = 12) {
  const inset = stroke / 2;
  return `<rect x="${inset}" y="${inset}" width="${512 - stroke}" height="${512 - stroke}" rx="${116 - inset}" fill="none" stroke="${fill}" stroke-width="${stroke}"/>`
    + `<g fill="${fill}">${STEMS.map(one).join('')}`
    + `<circle cx="256" cy="209" r="13"/><circle cx="256" cy="303" r="13"/></g>`;
}

/** Faint watermark: the mark at `scale` from (x, y), at `opacity`. */
const watermark = (x, y, scale, fill, opacity) =>
  `<g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">${markShapes(fill)}</g>`;

const GRADIENT = '<linearGradient id="mark" x1="0%" y1="0%" x2="100%" y2="100%">'
  + '<stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#22c55e"/></linearGradient>';

/** Standalone app icon: dark rounded tile with the mark. */
function iconSvg(size) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"${dims}>
  <defs>${GRADIENT}</defs>
  <rect width="512" height="512" rx="116" fill="#0b0a10"/>
  ${markShapes('url(#mark)', 16)}
</svg>
`;
}

module.exports = { markShapes, watermark, iconSvg, GRADIENT };
