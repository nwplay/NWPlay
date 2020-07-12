// TVShow
import { Subject } from 'rxjs';
import { Transform } from 'class-transformer';
import { TransformationType } from 'class-transformer/TransformOperationExecutor';

export interface TvSeasonDetail {
  id: string;
  title: string;
  air_date?: Date;
  overview?: string;
  poster?: string;
  episodes: TvEpisodeDetail[];
}

// Episode
export interface TvEpisodeDetail {
  id: string;
  title: string;
  air_date?: Date;
  overview?: string;
  poster?: string;
  thumb?: string;
  cover?: string;
}

export enum VIDEO_QUALITY {
  LW = 120,
  MD = 360,
  SD = 480,
  HD = 720,
  FULL_HD = 1080,
  ULTRA_HD = 2160,
}

export enum SOURCE_TYPE {
  HTTP = 0,
  HLS = 1,
  DASH = 2,
}

export enum MEDIA_TYPE {
  MOVIE = 0,
  TV_SHOW = 1,
  TV_EPISODE = 2,
  TV_SEASON = 3,
  MUSIC_ALBUM = 4,
  MUSIC_TRACK = 5,
  PLAYLIST = 6,
  AUDIO_BOOK = 7,
  SUBTITLE = 8,
  COLLECTION = 9,
  PERSON = 10,
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

export interface IAudioTrack {
  language: string;
  name: string;
  default?: boolean;
}

export interface ISubtitleTrack {
  language: string;
  name: string;
  default?: boolean;
}

export abstract class PlayProvider {
  resolvers?: Extractor[];
  id: string;
  disabled?: boolean;
  audioTracks?: IAudioTrack[] = null;
  subtitleLanguages?: ISubtitleTrack[] = null;
  overview?: string = null;
  poster?: string = null;
  title?: string = null;
  subtitle?: string = null;

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
  typeText?: string;
  progress?: number;

  @Transform((value, obj, transformationType) => {
    if (transformationType === TransformationType.PLAIN_TO_CLASS) {
      return getProviderById(value);
    } else {
      return (value as Provider).id;
    }
  })

  provider?: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  preview?(): Promise<MediaSource>;
}

export interface IMediaCollectionOptions {
  offset: number;
  limit: number;
  random?: boolean;
  sorting?: any;
}


export interface MediaCollection {
  sorting?: {value: any, name: string, default?: boolean}[];
}

export abstract class MediaCollection<Provider extends MediaProvider = MediaProvider> {
  title: string;
  id: string;
  sort?: number;

  constructor(public provider: Provider, data?: Partial<MediaCollection<any>>) {
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

export interface MediaInfo {
  year?: string | number;
  runtime?: string | number;
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
  public tags?: any[];
  public autoplay?: boolean;

  protected constructor(public provider: Provider) {
    super();
  }

  public trailer?(): Promise<MediaSource>;

  public suggestions?(offset?: number, limit?: number, page?: number): Promise<SearchResult<Provider>[]>;
}

export class Menu {
  public children: any;

  constructor() {
    this.children = [];
  }
}

export interface IProgress {
  text: string;
  value?: number;
}

export const currentProgressChange = new Subject<Map<MediaProvider, IProgress>>();
export const currentProgress = new Map<MediaProvider, IProgress>();

export function setProgress(provider: MediaProvider, progress: IProgress) {
  currentProgress.set(provider, progress);
  currentProgressChange.next(currentProgress);
}

export interface ISearchOptions {
  query: string;
  take: number;
  offset: number;
}

export abstract class PluginSetting<T = any> {
  label: string;
  value: T;
  id: string;
  public abstract type: string;
}

export class PluginInputSetting extends PluginSetting<string> {
  constructor(options: Partial<PluginInputSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'input';
}

export class PluginButtonSetting extends PluginSetting<string> {
  constructor(options: Partial<PluginButtonSetting>) {
    super();
    Object.assign(this, options);
  }

  click: CallableFunction;
  type = 'button';
}


export class PluginCheckboxSetting extends PluginSetting<boolean> {
  constructor(options: Partial<PluginCheckboxSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'checkbox';
}

export interface PluginSettingSelectItem {
  value: any;
  label: string;
}

export class PluginSelectSetting extends PluginSetting<any> {
  constructor(options: Partial<PluginSelectSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'select';
  public items: PluginSettingSelectItem[];
}

export class PluginMultiSelectSetting extends PluginSetting<any> {
  constructor(options: Partial<PluginMultiSelectSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'multi-select';
  public items: PluginSettingSelectItem[];
}

export abstract class MediaProvider {
  menue?: Menu;
  icon?: string;
  icon_url?: string;
  abstract id: string;
  disabled?: boolean;
  abstract name: string;
  customFooter: string;
  name_translations: { [key: string]: string } = {};
  settings: PluginSetting[] = [];
  isAdult?: boolean;
  dynamic?: boolean;
  description?: string;
  version?: string;
  loadingProgress: {
    text: string;
    value?: number;
  };

  abstract get(
    id: string
  ): Promise<TvShow<MediaProvider> | Movie<MediaProvider> | TvSeason<any> | TvEpisode<any> | MediaCollection<any>>;

  abstract init(setProgress: (text: string) => void): Promise<void>;

  abstract search(options: ISearchOptions): Promise<SearchResult<MediaProvider>[]>;

  abstract feature(limit?: number, isHome?: boolean): Promise<SearchResult<MediaProvider>[]>;

  abstract home(isHome?: boolean): Promise<MediaCollection<MediaProvider>[]>;

  abstract toolbar(): Promise<any[]>;
}

export const providers: MediaProvider[] = [];

export function addProvider(provider: MediaProvider) {
  const index = providers.findIndex(e => e.id === provider.id);
  if (index !== -1) {
    providers.splice(index, 1);
  }
  providers.push(provider);
}

const serviceInstances = new WeakMap<object, any>();

export function getService<T extends new (...args: any) => any>(service: T): InstanceType<T> {
  if (serviceInstances.has(service)) {
    return serviceInstances.get(service);
  }
  const instance = new service() as InstanceType<T>;
  serviceInstances.set(service, instance);
  return instance;
}

export function getProviderById(id: string): MediaProvider {
  return providers.find((e) => e.id === id);
}

export abstract class Extractor {
  public id: string;
  public name: string;
  public version?: string;
  public url?: string;
  public hidden?: boolean;
  public isAdult = false;
  public settings?: PluginSetting[] = [];

  abstract test(url: string): boolean;

  abstract init(): Promise<void>;

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

  protected constructor(public provider: Provider, data?: Partial<TvShow<any>>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  public trailer?(): Promise<MediaSource>;

  public suggestions?(offset?: number, limit?: number, page?: number): Promise<SearchResult<Provider>[]>;

  abstract seasons(): Promise<TvSeason<any>[]>;
}

export abstract class TvSeason<Parent extends TvShow<any>> {
  public title: string;
  public overview?: string;
  public id: string;
  public subtitle?: string;
  public poster: string;
  public season: number;
  public languages: string[] = [];

  protected constructor(public parent: Parent, data?: Partial<TvSeason<any>>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  abstract episodes(): Promise<TvEpisode<any>[]>;
}

export abstract class TvEpisode<Parent extends TvSeason<any>> extends PlayProvider {
  public title: string;
  public overview?: string;
  public id: string;
  public subtitle?: string;
  public poster?: string;
  public date?: Date;
  public episode: number;
  public hosters: any[] = [];

  constructor(public parent: Parent, data?: Partial<TvEpisode<any>>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}

export interface ScrubPreviewProvider {
  scrubPreview(position: number, source: MediaSource): Promise<string>;
}

export interface CastProvider {
  cast(): Promise<Person[]>;
}

export interface ToolbarItem {
  id: string;
  title: string;
}

export interface ToolbarProvider {
  toolbar(): Promise<ToolbarItem[]>;
}

export abstract class Plugin {
  public abstract name: string;
  public abstract id: string;
  public abstract version: string;
  public description: string;
  public disabled = false;
  public settings: PluginSetting[] = [];

  public async init() {
  }
}

export abstract class MediaPlugin extends Plugin {
  public abstract isAdult: boolean;

  public abstract search(options: ISearchOptions): Promise<SearchResult[]>;

  public abstract feature(limit?: number, isHome?: boolean): Promise<SearchResult[]>;

  public abstract home(isHome?: boolean): Promise<MediaCollection[]>;

  /**
   * Get Media Item by id
   */
  public abstract get(
    id: string
  ): Promise<TvShow | Movie | TvSeason<any> | TvEpisode<any>>;
}
