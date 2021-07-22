import { Extractor, MediaSource, SOURCE_TYPE, VIDEO_QUALITY } from '../nwp-media';
import { Environment } from '../environment';
import { v5 as uuidV5 } from 'uuid';
import { extractorService } from './extractorService';
import { onPlatformReady, Platform } from '../platform.abstract';

let updated = false;

export class GenericExtractor implements Extractor {
  public id = '28B302E7-CDEB-4364-94C9-22407C8B7C2D';
  public name = 'Generic (youtube-dl)';
  private readonly binPath: string = null;
  private readonly ydlUrl: string = null;
  public version = '0.0.1';

  constructor() {
    if (!updated) {
      updated = true;
    }
    if (Platform.default.type === 'nwjs') {
      const path = (window as any).nw.require('path');
      const dataPath = Platform.default.dataPath;
      this.binPath = path.join(dataPath, `ydl`);
      this.ydlUrl = 'https://youtube-dl.org/downloads/latest/youtube-dl';
      if (Environment.default.platform === 'windows') {
        this.ydlUrl += '.exe';
        this.binPath += '.exe';
      }
    }
  }

  public url?: string;
  public hidden?: boolean;

  async exec(cmd: string) {
    const isWindows = navigator.platform.toLowerCase() === 'win32';
    const util = (window as any).nw.require('util');
    const exec = util.promisify((window as any).nw.require('child_process').exec);
    const cmdArray: string[] = [];
    if (!isWindows) {
      cmdArray.push('python');
    }
    cmdArray.push(`"${this.binPath}"`);
    cmdArray.push(cmd);
    return await exec(cmdArray.join(' '));
  }

  async init(setMessage): Promise<void> {
    try {
      if (Platform.default.type === 'nwjs') {
        if (this.id === '28B302E7-CDEB-4364-94C9-22407C8B7C2D') {
          setMessage('Updating youtube-dl…');
          await this.updateBin();
          setMessage('Loading extractors…');
          const res = await this.exec('--list-extractors --print-json --encoding utf8');
          const extractors = res.stdout.trim().split('\n').filter(e => !e.includes(':'));
          for (const extractor of extractors) {
            const id = uuidV5(extractor, '28B302E7-CDEB-4364-94C9-22407C8B7C2D');
            const aliasExtractorInstance = new GenericExtractor();
            aliasExtractorInstance.name = extractor;
            aliasExtractorInstance.id = id;
            extractorService.addExtractor(aliasExtractorInstance as any, true);
          }
          extractorService.restoreSort();
        }
      }
    } catch (e) {
      alert(e);
    }
  }

  public test(url: string) {
    return /.*/gim.test(url);
  }

  public async updateBin() {
    const fs = Platform.default.Filesystem;

    if (await fs.exists(this.binPath)) {
      if (window.localStorage.ydld && parseInt(window.localStorage.ydld, 10) > Date.now()) {
        return;
      }
    }
    const res = await fetch(this.ydlUrl);
    try {
      await fs.deleteFile(this.binPath);
    } catch (e) {
    }
    await fs.writeFile(this.binPath, Buffer.from(await res.arrayBuffer()));
    await fs.chmod(this.binPath, 777);
    window.localStorage.ydld = Date.now() + 1000 * 60 * 60 * 24;
  }


  public async extract(url: string): Promise<MediaSource> {
    const self = this;
    let res = await this.exec(`--dump-json -f best "${url}"`);
    res = JSON.parse(res.stdout.trim());
    if (!res) {
      throw new Error('not supported');
    }


    const quality = {
      '720p': VIDEO_QUALITY.HD,
      '1080p': VIDEO_QUALITY.FULL_HD,
      '2160p': VIDEO_QUALITY.ULTRA_HD
    }[res.format_note] || VIDEO_QUALITY.MD;

    if (res.protocol === 'http_dash_segments') {
      return {
        source: res.manifest_url,
        type: SOURCE_TYPE.DASH,
        resolver: self,
        title: res.title,
        image: res.thumbnail,
        video_quality: quality
      };
    } else if (res.protocol === 'm3u8') {
      return {
        source: res.manifest_url,
        type: SOURCE_TYPE.HLS,
        resolver: self,
        title: res.title,
        image: res.thumbnail,
        video_quality: quality
      };
    } else if (res.url) {
      return {
        source: res.url,
        type: SOURCE_TYPE.HTTP,
        resolver: self,
        title: res.title,
        image: res.thumbnail,
        video_quality: quality
      };
    }
    throw new Error('not supported');
  }
}

onPlatformReady(() => {
  extractorService.addExtractor(new GenericExtractor());
});
