import { IFilesystem, IFilesystemStat, PlatformAbstract, PlatformType } from '@nwplay/core';

declare var nw: any;

class NWjsFileSystem implements IFilesystem {

  private fs = nw.require('fs').promises;
  private path = nw.require('path');

  appendFile(path: string, data: any, encoding: 'utf-8' | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  copy(from: string, to: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  async deleteFile(path: string) {
    await this.fs.unlink(path);
  }

  joinPath(...path: string[]): string {
    return this.path.join(...path);
  }

  async mkdir(path: string) {
    await this.fs.mkdir(path);
  }

  async readFile(path: string, encoding?: 'utf-8' | 'base64') {
    const fs = nw.require('fs').promises;
    return (await fs.readFile(path)).toString(encoding || 'base64');
  }

  async readdir(path: string): Promise<string[]> {
    return (await this.fs.readdir(path)) as string[];
  }

  rename(from: string, to: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rmdir(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  stat(path: string): Promise<IFilesystemStat> {
    return Promise.resolve(undefined);
  }

  async writeFile(path: string, data: any, encoding: 'utf-8' | 'base64' = 'utf-8'): Promise<void> {
    await this.fs.writeFile(path, data, { encoding });
  }

  async chmod(path: string, perm: any) {
    await this.fs.chmod(path, perm);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.fs.access(path, nw.require('fs').F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

}

export class PlatformNwjs extends PlatformAbstract {
  public static default = new PlatformNwjs();
  public type: PlatformType = 'nwjs';

  public fetch = fetch.bind(window);
  public dataPath = window['nw']['App'].dataPath;
  public Filesystem = new NWjsFileSystem();
  public cheerio = nw.require('cheerio');
}

export const Platform = PlatformNwjs;
