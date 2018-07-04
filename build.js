#!/usr/bin/env node
// std
const path = require('path');

// libs
const rollup = require('rollup');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');

// project
const pkg = require('./package.json');

const PKG_NAME = pkg.name.replace('.js', '');
const banner = `/** \
${pkg.name} v${pkg.version} | @copyright ${new Date().getFullYear()} \
${pkg.author.name} <${pkg.author.url}> | @license ${pkg.license} */`

// Configuration data
const config = {
  input: `src/${PKG_NAME}`,
  external: ['jquery'],
  plugins: [resolve(), json()],
  output: {
    format: 'umd',
    file: `dist/${PKG_NAME}.js`,
    name: PKG_NAME,
    banner: banner,
    globals: {
      jquery: '$'
    },
    outro: `exports._build = "${new Date().toISOString()}";`
  }
};

const plugins_min = config.plugins.concat([uglify({
  mangle: true,
  output: {beautify: false, preamble: banner}
})]);

const config_min = Object.assign({}, config, {
  plugins: plugins_min,
  output: Object.assign({}, config.output, {
    file: `dist/${PKG_NAME}.min.js`,
    sourcemap: true
  })
});

// Handle watch events.
var isWatch = false;
var built = 0;

const stderr = console.error.bind(console); // eslint-disable-line no-console
const onevent = (e) => {
  const filename = path.basename(`${e.output}`);
  const duration = (e.duration / 1000).toFixed(1);
  switch (e.code) {
    case 'START':
      stderr(`starting (${new Date().toISOString()})...`);
      break;
    case 'BUNDLE_START':
      stderr(`bundling ${filename}...`);
      break;
    case 'BUNDLE_END':
      stderr(`bundled ${filename} in [${duration}s].`);
      break;
    case 'END':
      built += 1;
      if (isWatch) {
        stderr(`watching...${0 === built % 2 ? '\n' : ''}`);
      } else if (2 === built) {
        process.exit(0); // eslint-disable-line no-process-exit
      }// end if: checked if we're ready to exit
      break;
    case 'ERROR': stderr(`error: ${e.error}`); break;
    case 'FATAL': stderr(`fatal: ${e.error}`); break;
    default: stderr(`unknown event: ${JSON.stringify(e)}`);
  }// end switch: processed the event
};

// Process args.
if ('-w' === process.argv[2]) { isWatch = true; }
rollup.watch(config).on('event', onevent);
rollup.watch(config_min).on('event', onevent);
