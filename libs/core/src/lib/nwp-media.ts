// TVShow
import {Transform} from 'class-transformer';
import {TransformationType} from 'class-transformer/TransformOperationExecutor';
import {Plugin} from './plugin';

export enum VIDEO_QUALITY {
  LW = 120,
  MD = 360,
  SD = 480,
  HD = 720,
  FULL_HD = 1080,
  ULTRA_HD = 2160,
}

export enum SOURCE_TYPE {
  HTTP = 'http',
  HLS = 'hls',
  DASH = 'dash',
}

export enum MEDIA_TYPE {
  MOVIE = 0,
  TV_SHOW = 1,
  TV_EPISODE = 2,
  TV_SEASON = 3,
  PLAYLIST = 6,
  SUBTITLE = 7,
  COLLECTION = 8,
  PERSON = 9,
}

export enum IMAGE_SIZE {
  DEFAULT = '',
  POSTER = 'poster',
  COVER = 'cover',
  THUMB = 'thumb',
}

export interface MediaSource {
  source: any;
  type: SOURCE_TYPE;
  live?: boolean;
  hdr?: boolean;
  video_quality?: VIDEO_QUALITY;
  resolver?: Extractor;
  start?: number;
  image?: string;
  title?: string;
  audio_track?: string;
  info?: any;
}

export interface IMediaVersion {
  name: string;
  data: any;
  id: string;
  default: boolean;
  sources: { name: string, id: any }[];
}

export abstract class PlayProvider {
  resolvers?: Extractor[];
  id: string;
  disabled?: boolean;
  versions?: IMediaVersion[] = [];
  overview?: string = null;
  poster?: string = null;
  title?: string = null;
  subtitle?: string = null;
  public sources: { name: string, id: any, data?: Record<string, any> }[] = [];

  abstract play(resolvers?: Extractor[], languages?: string[]): Promise<MediaSource>;
}

// @dynamic
export class SearchResult<Provider extends MediaProvider = MediaProvider> {
  type: MEDIA_TYPE = MEDIA_TYPE.MOVIE;
  title: string;
  image?: string;
  id: string;
  size?: IMAGE_SIZE;
  hideContext?: boolean;
  progress?: number;

  @Transform((value, obj, transformationType) => {
    if (transformationType === TransformationType.PLAIN_TO_CLASS) {
      return getProviderById(value);
    } else {
      return (value as Provider).id;
    }
  })
  public provider?: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }
}

export interface IMediaCollectionOptions {
  offset: number;
  limit: number;
  random?: boolean;
  sorting?: any;
}

export interface MediaCollection {
  sorting?: { value: any, name: string, default?: boolean }[];
}

export abstract class MediaCollection<Provider extends MediaProvider = MediaProvider> {
  title: string;
  id: string;
  sort?: number;

  constructor(
    public provider: Provider,
    data?: Partial<MediaCollection<any>>
  ) {
    if (data) {
      Object.assign(this, data);
    }
  }

  abstract items(opts: IMediaCollectionOptions): Promise<SearchResult<Provider>[]>;
}

export class Person {
  public name: string;
  public id: string;
  public image?: string;
}

export abstract class Movie<Provider extends MediaProvider = MediaProvider> extends PlayProvider {
  public title: string;
  public overview?: string;
  public id: string;
  public subtitle?: string;
  public info?: { [key: string]: string };
  public url?: string;
  public poster?: string;
  public backdrop?: string;
  public tags?: { name: string; color?: string; id?: string }[];
  public autoplay?: boolean;

  public cast?(): Promise<Person[]>;

  protected constructor(public provider: Provider) {
    super();
  }

  public trailer?(): Promise<MediaSource>;

  public suggestions?(offset?: number, limit?: number, page?: number): Promise<SearchResult<Provider>[]>;
}


export interface ISearchOptions {
  query: string;
  take: number;
  offset: number;
}


export abstract class MediaProvider extends Plugin {
  isAdult?: boolean;

  abstract get(
    id: string
  ): Promise<TvShow | Movie | TvSeason<any> | TvEpisode<any> | MediaCollection<any>>;

  abstract search(options: ISearchOptions): Promise<SearchResult[]>;

  abstract feature(limit?: number, isHome?: boolean): Promise<SearchResult[]>;

  abstract home(isHome?: boolean): Promise<MediaCollection<MediaProvider>[]>;
}

export const providers: MediaProvider[] = [];

export function addProvider(provider: MediaProvider) {
  const index = providers.findIndex(e => e.id === provider.id);
  if (index !== -1) {
    providers.splice(index, 1);
  }
  providers.push(provider);
}

export function getProviderById(id: string): MediaProvider {
  return providers.find((e) => e.id === id);
}

export abstract class Extractor extends Plugin {
  public url?: string;
  public icon?: string;
  public hidden?: boolean;

  abstract test(url: string): boolean | Promise<boolean>;

  abstract init(setMessage: (msg: string) => void): Promise<void>;

  abstract extract(url: string): Promise<MediaSource>;
}

export class ResolverError extends Error {
  public userAborted = false;
}

export abstract class TvShow<Provider extends MediaProvider = MediaProvider> {
  public id: string;
  public title: string;
  public overview?: string;
  public subtitle?: string;
  public info?: { [key: string]: string };
  public url?: string;
  public poster?: string = null;
  public backdrop?: string;
  public tags?: { name: string; color?: string; id?: string }[];
  public languages: string[] = [];
  public year: number = null;
  public runtime: string = null;
  public autoplay?: boolean;

  public cast?(): Promise<Person[]>;

  constructor(public provider: Provider, data?: Partial<TvShow>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  public trailer?(): Promise<MediaSource>;

  public suggestions?(offset?: number, limit?: number, page?: number): Promise<SearchResult<Provider>[]>;

  abstract seasons(): Promise<TvSeason<any>[]>;
}

export abstract class TvSeason<Parent extends TvShow = TvShow> {
  public title: string;
  public overview?: string;
  public id: string;
  public subtitle?: string;
  public poster: string;
  public season: number;
  public languages: string[] = [];

  public cast?(): Promise<Person[]>;

  protected constructor(public parent: Parent, data?: Partial<TvSeason>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  abstract episodes(): Promise<TvEpisode[]>;
}

export abstract class TvEpisode<Parent extends TvSeason = TvSeason> extends PlayProvider {
  public title: string;
  public overview?: string;
  public id: string;
  public subtitle?: string;
  public poster?: string;
  public date?: Date;
  public episode: number;

  public cast?(): Promise<Person[]>;

  constructor(public parent: Parent, data?: Partial<TvEpisode>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
