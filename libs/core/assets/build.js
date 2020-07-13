#!/usr/bin/env node
const { rollup } = require('rollup');
const { config, pkg } = require('./config');
console.log(`Building ${pkg.name} (${pkg.version})`)
rollup(config).then(e => {
  e.write(config.output).then(out => {
    console.log(`Build "${out.output[0].fileName}"`);
  });
});
