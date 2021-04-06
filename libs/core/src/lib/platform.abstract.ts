import { FilesystemEncoding } from '@capacitor/core';

export type PlatformType = 'capacitor' | 'nwjs'

export interface IFilesystemStat {
  ctime: number;
  mtime: number;
  size: number;
  type: string;
}

// @dynamic
export interface IFilesystem {
  deleteFile: (path: string) => Promise<void>;
  readFile: (path: string, encoding?: 'utf-8') => Promise<string>;
  appendFile: (path: string, data: any, encoding?: 'utf-8') => Promise<void>;
  writeFile: (path: string, data: any, encoding?: 'utf-8') => Promise<void>;
  mkdir: (path: string) => Promise<void>;
  rmdir: (path: string) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  joinPath: (...path: string[]) => string;
  stat: (path: string) => Promise<IFilesystemStat>;
  rename: (from: string, to: string) => Promise<void>;
  copy: (from: string, to: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  chmod: (path: string, perm: any) => Promise<void>;

}

// @dynamic
export abstract class PlatformAbstract {
  public static default: PlatformAbstract;
  public abstract type: PlatformType;
  public abstract fetch: typeof fetch;
  public abstract dataPath: string;
  public abstract Filesystem: IFilesystem;
  public abstract cheerio: any;
}

export let Platform: typeof PlatformAbstract;
const onPlatformSetHandlers: CallableFunction[] = [];

export function setPlatform(e: typeof PlatformAbstract) {
  Platform = e;
  while (onPlatformSetHandlers.length > 0) {
    const c = onPlatformSetHandlers.pop();
    if (typeof c === 'function') {
      c(e.default);
    }
  }
}

export function onPlatformReady(e: (platform: PlatformAbstract) => void) {
  onPlatformSetHandlers.push(e);
}

