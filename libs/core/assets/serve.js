#!/usr/bin/env node
const { watch } = require('rollup');
const { config, pkg } = require('./config');
const serve = require('rollup-plugin-serve');
console.log(`Serving ${pkg.name} (${pkg.version})`)

config.plugins.push(serve({
  port: 8065,
  host: 'localhost',
  contentBase: 'dist',
  historyApiFallback: '/' + config.output.file.split('/').pop()
}));

const watcher = watch(config);

watcher.on('change', (e) => {
  console.log(`${e} changed.`)
});

watcher.on('restart', (e) => {
  console.log(`Reloaded`);
});
