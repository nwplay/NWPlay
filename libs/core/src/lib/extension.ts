import { Movie, PluginSetting, TvEpisode, TvSeason, TvShow } from './nwp-media';

export type OnMediaItemType = Movie | TvShow | TvSeason<any> | TvEpisode<any>;

export interface Extension {
  onMediaItem?(item: OnMediaItemType): Promise<void>
}
export abstract class Extension {
  public id: string;
  public name: string;
  public settings: PluginSetting[] = [];
  public abstract async init(): Promise<void>;
}
