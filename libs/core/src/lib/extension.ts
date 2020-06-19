export abstract class Extension {
  public id: string;
  public name: string;

  public abstract async init(): Promise<void>;
}
