import { MediaSource, PlayProvider } from './nwp-media';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { History } from './history';

export class Playlist {
  public static readonly default: Playlist = new Playlist();
  public name: string;
  public items: PlayProvider[] = [];

  public add(...items: PlayProvider[]) {
    this.items.push(...items);
  }

  public remove(...items: PlayProvider[]) {
    for (const item of items) {
      const index = this.items.indexOf(item);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    }
  }

  public clear() {
    this.items = [];
  }
}

export class Player {
  public static readonly default: Player = new Player();
  public readonly playlist = Playlist.default;
  public currentTime = 0;
  public duration = 0;
  public currentSource: MediaSource;
  public currentItem: PlayProvider;
  public loading: boolean;
  public disableControls = false;
  public onPlay = new Subject<MediaSource>();
  public onPause = new Subject<boolean>();
  public onSeek = new Subject<number>();
  public onStop = new Subject<any>();
  public onLoading = new Subject<boolean>();
  public onEnd = new Subject<boolean>();
  public onTimeupdate = new Subject<number>();

  constructor() {
    this.onTimeupdate.subscribe((pos) => {
      this.currentTime = pos;
    });
    this.onTimeupdate.pipe(throttleTime(10000)).subscribe((pos) => {
      if (this.currentItem) {
        History.default.setProgress(this.currentItem, pos / this.duration);
      }
    });
  }

  public pause() {
    this.onPause.next(true);
  }

  public seekToPosition(pos: number) {
    this.onSeek.next(pos);
  }

  public async playNextItem() {
    const nextItemIndex = this.playlist.items.indexOf(this.currentItem) + 1;
    if (nextItemIndex > 0) {
      await this.play(this.playlist.items[nextItemIndex]);
    } else {
      this.playlist.clear();
    }
  }

  public async playPrevItem() {
    const nextItemIndex = this.playlist.items.indexOf(this.currentItem) - 1;
    if (nextItemIndex >= 0) {
      await this.play(this.playlist.items[nextItemIndex]);
    } else {
      this.playlist.clear();
    }
  }

  public async play(item?: PlayProvider) {
    this.currentItem = item;
    this.loading = true;
    this.onLoading.next(this.loading);
    this.currentSource = await item.play();
    this.loading = false;
    this.onLoading.next(this.loading);
  }

  public stop() {
    this.playlist.clear();
    this.currentSource = null;
    this.currentItem = null;
    this.onStop.next();

  }
}
