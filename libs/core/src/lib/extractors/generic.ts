import { MediaSource, Extractor, SOURCE_TYPE } from '../nwp-media';
import { extractorService } from '../../index';
import { v5 as uuidV5 } from 'uuid';

let updated = false;
const dataPath = window['nw']['App'].dataPath;

export class GenericExtractor implements Extractor {
  public id = '28B302E7-CDEB-4364-94C9-22407C8B7C2D';
  public name = 'Generic (youtube-dl)';
  public isAdult = false;

  constructor() {
    if (!updated) {
      updated = true;
    }
  }

  public version?: string;
  public url?: string;
  public hidden?: boolean;

  async init(): Promise<void> {
    if (this.id === '28B302E7-CDEB-4364-94C9-22407C8B7C2D') {
      await this.updateBin();

      const mdl = (window as any).nw.require('youtube-dl');
      const res: any = await new Promise((resolve, reject) => {
        mdl.getExtractors(true, (err, info) => {
          if (err) {
            return reject(err);
          }
          resolve(info);
        });
      });
      for (const reso of res) {
        const id = uuidV5(reso, '28B302E7-CDEB-4364-94C9-22407C8B7C2D');
        const aliasExtractorInstance = new GenericExtractor();
        aliasExtractorInstance.name = reso;
        aliasExtractorInstance.id = id;
        extractorService.addExtractor(aliasExtractorInstance as any);
      }
    }
  }

  public test(url: string): boolean {
    return /.*/gim.test(url);
  }

  public async updateBin() {
    try {
      const fs = (window as any).nw.require('fs');
      const youtubedl = (window as any).nw.require('youtube-dl');
      const downloader = (window as any).nw.require('youtube-dl/lib/downloader');
      const path = (window as any).nw.require('path');
      const binPath = youtubedl.getYtdlBinary();
      const ydlPath = path.join(dataPath, binPath.split('/').pop());
      if (fs.existsSync(ydlPath)) {
        youtubedl.setYtdlBinary(ydlPath);
      }
      if (window.localStorage.ydld && parseInt(window.localStorage.ydld, 10) > Date.now()) {
        return;
      }
      try {
        fs.unlinkSync(ydlPath);
      } catch (e) {
      }
      await new Promise((resolve, reject) => {
        downloader(dataPath, function error(err, done) {
          if (err) {
            console.error(err);
            return reject(err);
          }
          window.localStorage.ydld = Date.now() + 1000 * 60 * 60 * 24;
          youtubedl.setYtdlBinary(ydlPath);
          resolve(done);
        });
      });
    } catch (e) {
      console.error(e);
    }
  }


  public async extract(url: string): Promise<MediaSource> {
    const self = this;
    const mdl = (window as any).nw.require('youtube-dl');
    const res: any = await new Promise((resolve, reject) => {
      mdl.getInfo(url, [], (err, info) => {
        if (err) {
          return reject(err);
        }
        resolve(info);
      });
    });
    if (!res) {
      throw new Error('not supported');
    }
    if (res.protocol === 'http_dash_segments') {
      return {
        source: res.manifest_url,
        type: SOURCE_TYPE.DASH,
        resolver: self
      };
    } else if (res.protocol === 'm3u8') {
      return {
        source: res.manifest_url,
        type: SOURCE_TYPE.HLS,
        resolver: self
      };
    } else if (res.url) {
      return {
        source: res.url,
        type: SOURCE_TYPE.HTTP,
        resolver: self
      };
    }
    throw new Error('not supported');
  }
}
