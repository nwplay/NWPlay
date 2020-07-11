const CopyPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const pathToPackageJson = path.join(__dirname, '../../package.json');
const packageJson = require(pathToPackageJson);

/**
 * Extend the default Webpack configuration from nx / ng.
 */
module.exports = (config, context) => {
  // Extract output path from context
  const {
    options: { outputPath }
  } = context;

  // Install additional plugins
  config.plugins = config.plugins || [];
  config.plugins.push(...extractRelevantNodeModules(outputPath));
  return config;
};


class NpmInstallPlugin {
  constructor(outPath) {
    this.outPath = outPath;
  }

  async apply(compiler) {
    compiler.hooks.done.tap('npm i', () => {
      const result = require('child_process').execSync('npm i', { cwd: this.outPath }).toString().trim();
      console.log(result);
      const mainFilePath = path.join(this.outPath, 'main.js');
      const data = '#!/usr/bin/env node\n' + fs.readFileSync(mainFilePath, 'utf-8');
      fs.writeFileSync(mainFilePath, data);
    });
  }
}

/**
 * This repository only contains one single package.json file that lists the dependencies
 * of all its frontend and backend applications. When a frontend application is built,
 * its external dependencies (aka Node modules) are bundled in the resulting artifact.
 * However, it is not the case for a backend application (for various valid reasons).
 * Installing all the production dependencies would dramatically increase the size of the
 * artifact. Instead, we need to extract the dependencies which are actually used by the
 * backend application. We have implemented this behavior by complementing the default
 * Webpack configuration with additional plugins.
 *
 * @param {String} outputPath The path to the bundle being built
 * @returns {Array} An array of Webpack plugins
 */
function extractRelevantNodeModules(outputPath) {
  return [copyPackageLockFile(outputPath), generatePackageJson(), new NpmInstallPlugin(outputPath)];
}

/**
 * Copy the Yarn lock file to the bundle to make sure that the right dependencies are
 * installed when running `npm install`.
 *
 * @param {String} outputPath The path to the bundle being built
 * @returns {*} A Webpack plugin
 */
function copyPackageLockFile(outputPath) {
  return new CopyPlugin({
    patterns: [{
      from: 'package-lock.json',
      to: path.join(outputPath, 'package-lock.json')
    }]
  });
}

/**
 * Generate a package.json file that contains only the dependencies which are actually
 * used in the code.
 *
 * @returns {*} A Webpack plugin
 */
function generatePackageJson() {
  const implicitDeps = [];
  const dependencies = implicitDeps.reduce((acc, dep) => {
    acc[dep] = packageJson.dependencies[dep];
    return acc;
  }, {});
  delete packageJson['dependencies'];
  delete packageJson['devDependencies'];
  packageJson['name'] = '@nwplay/cli';
  packageJson['scripts'] = {
    start: 'node main'
  };
  packageJson['bin'] = {
    'nwplay-cli': 'main.js'
  };
  packageJson['main'] = 'main.js';
  let gitRev = '';
  try {
    gitRev = child_process.execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
  }
  const basePackageJson = {
    ...packageJson,
    dependencies,
    build: gitRev
  };
  return new GeneratePackageJsonPlugin(basePackageJson, pathToPackageJson);
}
