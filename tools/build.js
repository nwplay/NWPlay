const { findExecutable, findFFmpeg, spawnAsync, findRuntimeRoot } = require('nwjs-builder-phoenix/dist/lib/util');
const { copy, exists, writeFile, chmod, remove, ensureDir } = require('fs-extra');
const fs = require('fs-extra');
const path = require('path');
const { Builder } = require('nwjs-builder-phoenix');

const rootDir = path.join(__dirname, '..');

async function buildWindows() {
  const buildDir = 'out/tmp/win';
  await ensureDir(buildDir);
  await spawnAsync('ng', ['build', '-c', 'production', '--output-path', buildDir], {
    detached: false
  });
  const pkg = getPackage('win');
  fs.writeFileSync(path.join(buildDir, 'package.json'), JSON.stringify(pkg));
  process.chdir(buildDir);
  await spawnAsync('npm', ['install', '--production'], {
    detached: false
  });
  const builder = new Builder(
    {
      win: true,
      tasks: ['win-x64']
    },
    buildDir
  );
  await builder.build();
  process.chdir(rootDir);
}

function getPackage(platform) {
  const data = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  data.main = 'index.html';
  delete data.scripts;
  fs.ensureDirSync('./www');
  fs.removeSync('./dist');
  fs.ensureDirSync('./dist');
  const distDeps = {};
  for (const dep of data.distDependencies) {
    distDeps[dep] = data.dependencies[dep] || data.devDependencies[dep];
  }
  data.dependencies = distDeps;
  delete data.devDependencies;
  delete data.distDependencies;
  return data;
}

(async () => {
  process.chdir(rootDir);
  await buildWindows();
  process.chdir(rootDir);
  process.exit(0);
})();
