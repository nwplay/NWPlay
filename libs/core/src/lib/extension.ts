import { PluginSetting } from './nwp-media';

export abstract class Extension {
  public id: string;
  public name: string;
  public settings: PluginSetting[] = [];
  public abstract async init(): Promise<void>;
}
