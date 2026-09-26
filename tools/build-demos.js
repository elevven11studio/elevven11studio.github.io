/**
 * Bundles the in-browser extension demos from the extension repos, which are
 * expected to sit beside this one:
 *   ../Project-WebGuard   ../Project-WebInspect
 * Output goes to /assets/demos/, which the site serves as plain scripts.
 */
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const SIBLINGS = path.resolve(ROOT, '..');

const demos = [
  { name: 'webguard', repo: 'Project-WebGuard', global: 'WebGuardDemo' },
  {
    name: 'webinspect',
    repo: 'Project-WebInspect',
    global: 'WebInspectDemo',
    // Lets the extension's DOM collectors read a sandboxed iframe.
    inject: [path.join(__dirname, 'demos', 'frame-shim.ts')],
  },
];

for (const demo of demos) {
  const repo = path.join(SIBLINGS, demo.repo);
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'demos', `${demo.name}.ts`)],
    outfile: path.join(ROOT, 'assets', 'demos', `${demo.name}.js`),
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: demo.global,
    target: 'es2020',
    alias: {
      '@ext': path.join(repo, 'extension'),
      '@shared': path.join(repo, 'shared'),
    },
    inject: demo.inject,
    tsconfigRaw: {},
    legalComments: 'none',
  });
  console.log(`assets/demos/${demo.name}.js`);
}
