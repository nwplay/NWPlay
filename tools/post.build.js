const fs = require('fs-extra');
process.chdir(require('path').join(__dirname, '..'));

const path = require('upath');
const { spawn } = require('child_process');
const data = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
data.main = 'index.html';
delete data.scripts;
const distDeps = {};

for (const dep of data.distDependencies) {
  distDeps[dep] = data.dependencies[dep] || data.devDependencies[dep];
}
data.dependencies = distDeps;
delete data.devDependencies;
delete data.distDependencies;
fs.writeFileSync(path.normalize('./dist/apps/ui/package.json'), JSON.stringify(data));

function execAsync(code, ...a) {
  return new Promise((resolve) => {
    const proc = spawn(code, a, {
      stdio: 'inherit',
      shell: true
    });
    proc.addListener('exit', resolve);
  });
}

async function main() {
  process.chdir('./dist/apps/ui');
  await execAsync('npm', 'install', '--production');
}

main().catch(() => process.exit(0));
