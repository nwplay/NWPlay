import { deserializeArray, serialize } from 'class-transformer';
import { EventEmitter } from '@angular/core';
import { IMAGE_SIZE, MEDIA_TYPE, Movie, SearchResult, TvShow } from './nwp-media';

export class WatchlistItem extends SearchResult {
  public notify = false;
  public lastSeason = 0;
  public lastEpisode = 0;
  public date?: Date;
  public lastCheckDate: Date = null;
}


export class Watchlist {
  public static default = new Watchlist();
  private name = 'default_watchlist';
  public onAddItem = new EventEmitter<WatchlistItem>();
  public onRemoveItem = new EventEmitter<WatchlistItem>();


  public items: WatchlistItem[] = [];

  public async init() {
    try {
      if (localStorage[this.name]) {
        this.items = deserializeArray(WatchlistItem, localStorage[this.name]);
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

  public async addItem(item: SearchResult | Movie | TvShow) {
    const watchlistItem = new WatchlistItem(item.provider);
    if (item instanceof SearchResult) {
      Object.assign(watchlistItem, item);
    } else if (item instanceof TvShow) {
      watchlistItem.type = MEDIA_TYPE.TV_SHOW;
      watchlistItem.title = item.title;
      watchlistItem.size = IMAGE_SIZE.POSTER;
      watchlistItem.image = item.poster || item.backdrop;
      watchlistItem.id = item.id;
    } else if (item instanceof Movie) {
      watchlistItem.type = MEDIA_TYPE.MOVIE;
      watchlistItem.title = item.title;
      watchlistItem.size = IMAGE_SIZE.POSTER;
      watchlistItem.image = item.poster || item.backdrop;
      watchlistItem.id = item.id;
    }
    watchlistItem.date = new Date();
    this.items.push(watchlistItem);
    this.onAddItem.emit(watchlistItem);
    await this.save();
    return watchlistItem;
  }

  public async removeItem(item: SearchResult | Movie | TvShow) {
    const i = this.items.findIndex((w) => w.provider.id === item.provider.id && w.id === item.id);
    if (i !== -1) {
      const itemToRemove = this.items[i];
      this.items.splice(i, 1);
      this.onRemoveItem.emit(itemToRemove);
      await this.save();
    }
  }

  public checkItem(item: SearchResult | Movie | TvShow) {
    const i = this.items.findIndex((w) => item.provider && w.provider && w.provider.id === item.provider.id && w.id === item.id);
    return i !== -1;
  }
}
