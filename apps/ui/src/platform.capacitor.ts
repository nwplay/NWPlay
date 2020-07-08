import { IFilesystem, IFilesystemStat, PlatformAbstract, PlatformType } from '@nwplay/core';
import '@capacitor-community/http';
import { Plugins } from '@capacitor/core';
import { HttpPluginWeb } from '@capacitor-community/http';
import { HttpOptions } from '@capacitor-community/http/dist/esm/definitions';

import * as cheerio from './cheerio';

const Http = Plugins.Http as HttpPluginWeb;

async function CapFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const opts: HttpOptions = {} as any;
  const fetchOpts: RequestInit = {};
  if (typeof input === 'string') {
    opts.url = input;
    opts.method = 'get';
  } else {
    opts.url = input.url;
    Object.assign(fetchOpts, input);
  }
  if (init) {
    Object.assign(fetchOpts, init);
  }

  if (fetchOpts.headers) {
    opts.headers = fetchOpts.headers as any;
  }

  if (fetchOpts.body) {
    opts.data = fetchOpts.body;
  }

  opts.method = fetchOpts.method || 'GET';
  const res = await Http.request(opts);
  return new Response(typeof res.data === 'string' ? res.data : JSON.stringify(res.data), {
    headers: res.headers,
    status: res.status
  });
}

class CapacitorFileSystem implements IFilesystem {
  appendFile(path: string, data: any, encoding: 'utf-8' | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  copy(from: string, to: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteFile(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  joinPath(...path: string[]): string {
    return path.join('/');
  }

  mkdir(path: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  readFile(path: string, encoding?: 'utf-8'): Promise<string> {
    return Promise.resolve(undefined);
  }

  readdir(path: string): Promise<string[]> {
    return Promise.resolve([]);
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

  writeFile(path: string, data: any, encoding: 'utf-8' | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

}

class PlatformCapacitor extends PlatformAbstract {
  public static default = new PlatformCapacitor();
  public type: PlatformType = 'capacitor';
  public fetch = CapFetch;
  public dataPath = '';
  public Filesystem = new CapacitorFileSystem();
  public cheerio = cheerio;
}

export const Platform = PlatformCapacitor;
