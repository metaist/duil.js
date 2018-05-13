#!/usr/bin/env node
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const PKG_NAME = pkg.name.replace('.js', '');
const banner = `/** \
${pkg.name} v${pkg.version} | @copyright ${new Date().getFullYear()} \
${pkg.author.name} <${pkg.author.url}> | @license ${pkg.license} */`


// Configuration data
const dest = `dist/${PKG_NAME}.js`;
const dest_min = `dist/${PKG_NAME}.min.js`
const plugins = [resolve(), json()];
const plugins_min = plugins.concat([uglify({
  mangle: true,
  output: {
    beautify: false,
    preamble: banner
  }
})]);

const input = {
  input: `src/${PKG_NAME}`,
  plugins: plugins
};

const output = {
  format: 'umd',
  file: dest,
  name: PKG_NAME,
  banner: banner,
  outro: `exports._build = "${new Date().toISOString()}";`
};

// Generate configuration.
const config = mode => {
  switch(mode) {
    case 'in': return input;
    case 'out': return output;
    case 'in_min':
      return Object.assign({}, input, {plugins: plugins_min});
    case 'out_min':
      return Object.assign({}, output, {file: dest_min});
    case 'watch':
      return Object.assign({}, input, {output: output});
    case 'watch_min':
      return Object.assign({}, input, {
        plugins: plugins_min,
        output: Object.assign({}, output, {file: dest_min})
      });
  }
};

// Build the outputs.
const build = async function () {
  const bundle = await rollup.rollup(config('in'));
  await bundle.write(config('out'));
  const bundle_min = await rollup.rollup(config('in_min'));
  await bundle_min.write(config('out_min'));
};

// Handle watch events.
const stderr = console.error.bind(console);
const onevent = (e, filename) => {
  switch (e.code) {
    case 'START': stderr(`starting (${new Date().toISOString()})...`); break;
    case 'BUNDLE_START': stderr(`bundling ${filename}...`); break;
    case 'BUNDLE_END': stderr(`bundled ${filename} (${e.duration}ms).`); break;
    case 'END': stderr(`watching...`); break;
    case 'ERROR': stderr(`error: ${e.error}`); break;
    case 'FATAL': stderr(`fatal: ${e.error}`); break;
    default: stderr(`unknown event: ${JSON.stringify(e)}`);
  }//end switch: processed the event
};

// Process args.
if ('-w' === process.argv[2]) {
  rollup.watch(config('watch')).on('event', e => onevent(e, dest));
  rollup.watch(config('watch_min')).on('event', e => onevent(e, dest_min));
} else {
  build();
}//end if: built or watched
