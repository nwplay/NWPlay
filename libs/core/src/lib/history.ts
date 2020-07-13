import { getProviderById, MediaProvider, PlayProvider, TvEpisode, TvShow } from './nwp-media';
import { deserializeArray, serialize, Transform } from 'class-transformer';
import { TransformationType } from 'class-transformer/TransformOperationExecutor';

// @dynamic
export class HistoryItem {
  public id: string;
  public season?: number;
  public episode?: number;
  public showId?: any;
  public onDeck = false;

  public poster?: string = null;
  public title?: string = null;
  public progress = 0;
  public date: number;

  @Transform((value, obj, transformationType) => {
    if (transformationType === TransformationType.PLAIN_TO_CLASS) {
      return getProviderById(value);
    } else {
      return (value as MediaProvider).id;
    }
  })
  public provider: MediaProvider;
}

export class History {
  public static default = new History();
  public name = 'watch_history';
  public items: HistoryItem[];
  private itemIndex: Record<string, HistoryItem> = {};

  public async init() {
    try {
      if (localStorage[this.name]) {
        this.items = deserializeArray(HistoryItem, localStorage[this.name]);
      } else {
        this.items = [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async save() {
    localStorage[this.name] = serialize(this.items);
  }

  public setProgress(item: PlayProvider, progress: number) {
    let historyItem = this.itemIndex[item.id] || this.items.find(e => e.id === item.id);
    if (!historyItem) {
      historyItem = new HistoryItem();
      historyItem.title = item.title;
      if (item instanceof TvEpisode) {
        const show = item.parent.parent as TvShow;
        historyItem.provider = show.provider;
        historyItem.title = `${show.title} - ${historyItem.title}`;
        historyItem.season = item.parent.season;
        historyItem.episode = item.episode;
        historyItem.showId = show.id;
      }
      this.items.push(historyItem);
    }
    historyItem.id = item.id;
    historyItem.poster = item.poster;
    historyItem.progress = progress;
    historyItem.date = Date.now();
    historyItem.onDeck = progress < 0.925 && progress > 0.025;
    this.itemIndex[item.id] = historyItem;
    if (item instanceof TvEpisode) {
      const show = item.parent.parent as TvShow;
      this.items
        .filter(e => e.showId === show.id && e !== historyItem).forEach(e => {
        e.onDeck = false;
      });
    }
    this.save();
    return historyItem;
  }

  public getProgress(item: PlayProvider) {
    const historyItem = this.itemIndex[item.id] || this.items.find(e => e.id === item.id);
    this.itemIndex[item.id] = historyItem;
    return historyItem ? historyItem.progress : 0;
  }
}
