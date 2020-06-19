const nwDownloader = require('nwjs-builder-phoenix');

const { BuildConfig } = require('nwjs-builder-phoenix/dist/lib/config');
const { findExecutable, findFFmpeg, spawnAsync, findRuntimeRoot } = require('nwjs-builder-phoenix/dist/lib/util');
const { FFmpegDownloader } = require('nwjs-builder-phoenix/dist/lib/FFmpegDownloader');
const { copy, exists, writeFile, chmod, remove, ensureDir } = require('fs-extra');
const { join, resolve } = require('path');

const Downloader = nwDownloader.Downloader;
const pkg = require('../package.json');
const config = new BuildConfig(pkg);
const cacheDir = resolve(__dirname, '../.cache');

const downloader = new Downloader({
  platform: process.platform,
  arch: process.arch,
  version: config.nwVersion,
  flavor: 'sdk',
  useCaches: true,
  showProgress: true,
  forceCaches: true,
  destination: cacheDir
});

const ffmpegDownloader = new FFmpegDownloader({
  platform: process.platform,
  arch: process.arch,
  version: config.nwVersion,
  useCaches: true,
  showProgress: true,
  forceCaches: true,
  destination: cacheDir
});

(async () => {
  await ensureDir(cacheDir);
  const runtimeDir = await downloader.fetchAndExtract();
  const runtimeRoot = await findRuntimeRoot(process.platform, runtimeDir);
  const executable = await findExecutable(process.platform, runtimeDir);
  if (!(await exists(join(cacheDir, 'ffmpeg.patched')))) {
    const ffmpegDir = await ffmpegDownloader.fetchAndExtract();
    if (await exists(join(runtimeRoot, 'libffmpeg.dylib'))) {
      await remove(join(runtimeRoot, 'libffmpeg.dylib'));
    }
    const src = await findFFmpeg(process.platform, ffmpegDir);
    const dest = await findFFmpeg(process.platform, runtimeDir);
    await copy(src, dest);
    await writeFile(join(cacheDir, 'ffmpeg.patched'), 'OK');
  }
  await chmod(executable, 0o555);
  await spawnAsync(executable, [resolve(cacheDir, '..')], {
    detached: true
  });
  process.exit(0);
})();
