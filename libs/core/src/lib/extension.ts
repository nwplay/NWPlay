import { Movie, SearchResult, TvEpisode, TvSeason, TvShow } from './nwp-media';
import { PluginSetting } from './plugin';

export type OnMediaItemType = Movie | TvShow | TvSeason<any> | TvEpisode<any> | SearchResult;

export interface IGetWatchlistItemsOptions {
  skip: number;
  take: number;
}

export interface WatchlistExtension {
  getWatchlistItems: (opts: IGetWatchlistItemsOptions) => Promise<SearchResult[]>;
}

export interface Extension {
  onMediaItem?(item: OnMediaItemType): Promise<void>
}

export abstract class Extension {
  public id: string;
  public name: string;
  public settings: PluginSetting[] = [];

  public abstract init(setMessage: (msg: string) => void): Promise<void>;
}
