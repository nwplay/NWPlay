const pkg = require('../package');
const path = require('path');
const fs = require('fs-extra');
const { execFile } = require('child_process');
const got = require('got');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
process.chdir(__dirname);
fs.ensureDirSync('../dist/apps/dist');
fs.ensureDirSync('../.cache');
process.chdir('../dist/apps/dist');

async function createIssFile(ta = 'x64') {
  if (!fs.existsSync('../../../.cache/vcredist_x86.exe')) {
    console.log('Downloading vcredist_x86');
    await pipeline(got.stream('https://download.microsoft.com/download/5/B/C/5BC5DBB3-652D-4DCE-B14A-475AB85EEF6E/vcredist_x86.exe'), fs.createWriteStream('../../../.cache/vcredist_x86.exe'));
  }
  const filesToCopy = ['../../../.cache/vcredist_x86.exe', ...(await fs.readdir(`NWPlay-${pkg.version}-win-${ta}`)).map((e) => path.join(`NWPlay-${pkg.version}-win-${ta}`, e))];
  const fcpStrings = [];
  for (const f of filesToCopy) {
    const p = path.win32.resolve(f);
    const stat = await fs.lstat(p);
    if (stat.isDirectory()) {
      fcpStrings.push(
        `Source: "${p}\\*"; DestDir: "{app}\\${path.parse(p).name}"; Flags: ignoreversion recursesubdirs`
      );
    } else {
      fcpStrings.push(`Source: "${p}"; DestDir: "{app}"; Flags: ignoreversion`);
    }
  }
  return `
#define MyAppName "${pkg.productName}"
#define MyAppVersion "${pkg.version}"
#define MyAppPublisher "${pkg.productName}"
#define MyAppURL "https:/nwplay.org/"
#define MyAppExeName "NWPlay.exe"

[Setup]
AppId={{1617EFC7-1E81-40E9-9699-CBA03711B410}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\\{#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=nwplay-win-${ta}
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "german"; MessagesFile: "compiler:Languages\\German.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
${fcpStrings.join('\n')}

[Run]
Filename: "{app}\\vcredist_x86.exe"; StatusMsg: "Microsoft Visual C++ 2010 Redistributable Package (x86)"; Flags: skipifsilent

[Icons]
Name: "{autoprograms}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon
  `.trim();
}

async function createBatFile() {
  return `
  "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe" "setup.iss"
  `.trim();
}

async function installInoSetup() {
  if (!fs.existsSync('../.cache/is.exe')) {
    console.log('Downloading is');
    await pipeline(got.stream('https://jrsoftware.org/download.php/is.exe'), fs.createWriteStream('../.cache/is.exe'));
  }
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  const pwd = process.cwd();
  process.chdir('../.cache/');
  await exec('is.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART');
  process.chdir(pwd);
}

async function main() {
  // await installInoSetup();
  await fs.writeFile('setup.iss', await createIssFile());
  await fs.writeFile('setup.bat', await createBatFile());
  const child = execFile('setup.bat', (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
  child.stdout.on('data', function(data) {
    console.log(data.toString());
  });
}

main().catch(console.error);  
