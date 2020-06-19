import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { getProviderById, IMAGE_SIZE, MEDIA_TYPE, Movie, SearchResult, TvShow } from '@nwplay/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Type } from 'class-transformer';

class WatchlistItemNewEpisodes {
  id: string;
  uniq_id: string;
  title: string;
  episode: number;
  season: number;
}

class WatchlistItem extends SearchResult {
  public notify = false;
  public lastSeason = 0;
  public lastEpisode = 0;
  public date: Date;
  public lastCheckDate: Date = null;
  @Type(() => WatchlistItemNewEpisodes)
  public newEpisodes: WatchlistItemNewEpisodes[] = [];
}

@Injectable()
export class WatchlistService {
  public _watchlist: WatchlistItem[] = [];
  public watchlistChange = new EventEmitter<any>();

  constructor(
    public settings: SettingsService,
    private zone: NgZone,
    public translate: TranslateService,
    public snackBar: MatSnackBar
  ) {
  }

  public async loadWatchlist() {
    try {
      if (localStorage['new_watchlist']) {
        const data = JSON.parse(localStorage['new_watchlist']);
        this._watchlist = data.map(e => {
          e.provider = getProviderById(e.provider);
          return e;
        }).filter(e => !!e.provider);
      } else {
        this._watchlist = [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async save(): Promise<void> {
    const data = this._watchlist.map(e => {
      return {
        ...e,
        provider: e.provider.id
      };
    });
    window.localStorage['new_watchlist'] = JSON.stringify(data);
    this.watchlistChange.emit();
  }

  public async add(item: SearchResult | Movie | TvShow): Promise<any> {
    const watchlistItem = new WatchlistItem(item.provider);
    if (item instanceof SearchResult) {
      Object.assign(watchlistItem, item);
    } else if (item instanceof TvShow) {
      watchlistItem.type = MEDIA_TYPE.TV_SHOW;
      watchlistItem.title = item.title;
      watchlistItem.size = IMAGE_SIZE.POSTER;
      watchlistItem.image = item.poster || item.backdrop;
      watchlistItem.id = item.id;
      watchlistItem.date = new Date();
    } else if (item instanceof Movie) {
      watchlistItem.type = MEDIA_TYPE.MOVIE;
      watchlistItem.title = item.title;
      watchlistItem.size = IMAGE_SIZE.POSTER;
      watchlistItem.image = item.poster || item.backdrop;
      watchlistItem.id = item.id;
      watchlistItem.date = new Date();
    }
    watchlistItem.notify = false;
    if (!this.isFavorite(item)) {
      this._watchlist.push(watchlistItem);
    }
    await this.save();
    let message: any;
    if (item instanceof TvShow || (item instanceof SearchResult && item.type === MEDIA_TYPE.TV_SHOW)) {
      message = await this.translate.get('watchlist_success_add_tv', item).toPromise();
    } else if (item instanceof Movie || (item instanceof SearchResult && item.type === MEDIA_TYPE.MOVIE)) {
      message = await this.translate.get('watchlist_success_add_movie', item).toPromise();
    } else {
      message = await this.translate.get('watchlist_success_add', item).toPromise();
    }
    const action = await this.translate.get('hide').toPromise();
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration: 3500
      });
    });

    this.watchlistChange.emit();
  }

  public async remove(item: Movie | SearchResult | TvShow): Promise<any> {
    const i = this._watchlist.findIndex((w) => w.provider.id === item.provider.id && w.id === item.id);
    if (i !== -1) {
      const message = await this.translate.get('watchlist_success_remove', item).toPromise();
      const action = await this.translate.get('hide').toPromise();
      this.zone.run(() => {
        this.snackBar.open(message, action, {
          duration: 3500
        });
      });
      this._watchlist.splice(i, 1);
      this.save();
    }
    this.watchlistChange.emit();
  }

  public async checkNotifications(item: WatchlistItem, silent = false) {
    let e;
    let s;
    if (!item.notify) {
      return;
    }
    const initLength = item.newEpisodes.length;
    const res = await item.provider.get(item.id);
    if (res instanceof TvShow) {
      const seasons = await res.seasons();
      if (silent) {
        item.lastSeason = seasons.length - 1;
      }
      for (s = item.lastSeason; s < seasons.length; s++) {
        const season = seasons[s];
        const episodes = await season.episodes();
        for (e = s === item.lastSeason ? item.lastEpisode : 0; e < episodes.length; e++) {
          const episode = episodes[e];
          const ep = new WatchlistItemNewEpisodes();
          ep.title = episode.title;
          ep.id = episode.id;
          ep.uniq_id = [item.id, season.id, episode.id].join('_');
          ep.season = s;
          ep.episode = e;
          if (!silent) {
            item.newEpisodes.push(ep);
          }
        }
      }
      item.lastEpisode = e;
      item.lastSeason = s;

      await this.save();
    }
  }

  public toggleNotify(item: SearchResult | TvShow | Movie) {
    const c = this._watchlist.find((w) => w.provider.id === item.provider.id && w.id === item.id);
    if (c) {
      c.notify = !c.notify;
      if (c.notify) {
        this.checkNotifications(c, true).catch(console.error);
      } else {
        c.newEpisodes = [];
        c.lastSeason = 0;
        c.lastEpisode = 0;
      }
    }
    return c && c.notify;
  }

  public isNotify(item: SearchResult | TvShow | Movie): boolean {
    const c = this._watchlist.find((w) => w.provider.id === item.provider.id && w.id === item.id);
    return c && c.notify;
  }

  public isFavorite(item: SearchResult | TvShow | Movie): boolean {
    const i = this._watchlist.findIndex((w) => w.provider.id === item.provider.id && w.id === item.id);
    return i !== -1;
  }
}
