import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  Optional,
  ViewChild
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  Extractor,
  getProviderById,
  MEDIA_TYPE,
  MediaSource,
  Movie,
  Person,
  PlayProvider,
  SearchResult,
  TvEpisode,
  TvSeason,
  TvShow,
  Player, Watchlist, History
} from '@nwplay/core';
import { environment } from '../../environment';
import { ResolverPopoverComponent } from '../../elements/resolver-popover/resolver-popover.component';
import { SitemPopoverComponent } from '../../elements/sitem-popover/sitem-popover.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var nw: any;

@Component({
  selector: 'nwplay-page-item',
  templateUrl: './nwp-item.component.html',
  styleUrls: ['./nwp-item.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(0, style({ opacity: 0 }))
      ])
    ])]
})
export class NwpItemComponent implements OnInit, AfterViewInit {
  public provider: any;
  public item: TvShow | Movie = null;
  public type = MEDIA_TYPE.MOVIE;
  public seasons: TvSeason<any>[] = null;
  public currentSeason: TvSeason<any> = null;
  public episodes: TvEpisode<any>[] = null;
  public isFavorite = false;
  public isNotify = false;
  public player = Player.default;
  public loadingSeason = true;
  public MEDIA_TYPE: typeof MEDIA_TYPE = MEDIA_TYPE;
  public suggestions: SearchResult[] = null;
  public cast: Person[] = null;
  public env = environment;
  public trailerSrc: string = null;
  public trailerLoading = true;
  public visible = true;
  public isPopover = false;
  @ViewChild('rightContainer', { static: false }) pageContainer: ElementRef<HTMLDivElement>;
  @ViewChild('yaudiohack', { static: false }) yaudiohackEle: ElementRef;
  public loadedSeasons = new WeakMap<TvSeason<any>, TvEpisode<any>[]>();
  private trailerAudioTrack: string = null;
  private trailerSyncFc = 0;
  public newWatchlist = Watchlist.default;
  public newHistory = History.default;

  constructor(private bottomSheet: MatBottomSheet, public route: ActivatedRoute,
              public router: Router,
              public settings: SettingsService,
              private zone: NgZone,
              public ref: ChangeDetectorRef,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngAfterViewInit(): void {
    this.pageContainer.nativeElement.addEventListener('scroll', () => {
      if (this.trailerSrc) {
        const player = this.pageContainer.nativeElement.querySelector('video');
        if (!player) {
          return;
        }
        if (this.pageContainer.nativeElement.scrollTop >= 500) {
          player.pause();
        } else {
          player.play();
        }
        let vol = 1 - ((1 / 300) * this.pageContainer.nativeElement.scrollTop);
        vol = vol < 0 ? 0 : vol;
        player.volume = vol;
        if (this.yaudiohackEle) {
          this.yaudiohackEle.nativeElement.volume = vol;
        }
      }
    }, { passive: true });
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.provider && params.id) {
        this.zone.run(() => {
          this.loadItem(params.provider, params.id);
        });
      }
    });

    if (this.data && this.data.id && this.data.provider) {
      this.zone.run(() => {
        this.isPopover = true;
        this.loadItem(this.data.provider, this.data.id);
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      });
    }


  }

  public bgImageLoad(e: any) {
    e.target.className = e.target.naturalWidth > 0 && e.target.naturalWidth < 480 ? 'blur' : '';
    e.target.style.visibility = 'visible';
  }

  public showResolverPopup(item: PlayProvider) {
    if (typeof window !== 'undefined') {
      this.zone.run(() => {
        const bottomSheetRef = this.bottomSheet.open(ResolverPopoverComponent, {
          ariaLabel: 'Select Resolver',
          data: item
        });
        bottomSheetRef.afterDismissed().subscribe((resolver: any) => {
          if (!resolver) {
            return;
          }
          if (this.item instanceof TvEpisode) {
            this.play(this.item, this.episodes, [resolver], true);
          } else if (this.item instanceof Movie) {
            this.play(this.item, [this.item], [resolver]);
          }
        });
      });
    }
  }

  public showSitemPopup(item: PlayProvider, event: any, items?: any[]) {
    this.zone.run(() => {
      const bottomSheetRef = this.bottomSheet.open(SitemPopoverComponent, {
        ariaLabel: 'Select Resolver',
        data: {
          item: item,
          items: items,
          srp: () => {
            this.showResolverPopup(item);
          }
        }
      });
      bottomSheetRef.afterDismissed().subscribe(() => {
      });
    });
  }

  public async playBackdrop() {
    await this.playTrailer();
  }

  public async playTrailer(): Promise<any> {
    if (this.item.trailer) {
      this.trailerLoading = true;
      try {
        const res: MediaSource = await this.item.trailer();
        if (res && res.source) {
          this.trailerSrc = res.source;
          if (res.audio_track) {
            this.trailerAudioTrack = res.audio_track;
            if (this.yaudiohackEle) {

              this.yaudiohackEle.nativeElement.src = res.audio_track;
              this.yaudiohackEle.nativeElement.volume = 1;
            }
          }
        }
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  public trailerPaused() {
    if (this.yaudiohackEle) {

      this.yaudiohackEle.nativeElement.pause();
    }
  }

  public trailerTimeUpdate({ target }) {
    if (this.yaudiohackEle && this.yaudiohackEle.nativeElement.src) {
      if (this.trailerSyncFc > 7) {
        const ctm = target.currentTime;
        const xth = this.yaudiohackEle.nativeElement.currentTime;
        if ((ctm > xth + 0.3 || ctm < xth - 0.3)) {
          console.log('NEED AUDIO SYNC ' + (ctm - xth));
          this.yaudiohackEle.nativeElement.currentTime = ctm + 0.1;
        }
        this.trailerSyncFc = 0;
      } else {
        this.trailerSyncFc++;
      }
    }
  }

  public trailerLoaded() {
    this.trailerSyncFc = 15;
    if (this.yaudiohackEle && this.trailerAudioTrack && !this.yaudiohackEle.nativeElement.src) {
      this.yaudiohackEle.nativeElement.src = this.trailerAudioTrack;
    }
    if (this.yaudiohackEle && this.yaudiohackEle.nativeElement.src) {
      this.yaudiohackEle.nativeElement.play();
    }

    if (this.settings.autoCropTrailer) {
      let lastCropValue = 0;
      let lastVideoH = 0;
      this.updateCrop(document.querySelector('video.trailer') as any, (crop: number, video: any, ch: number) => {
        let cropValue = '0';
        // Do not crop black screens or if crop change < 15 px
        if ((crop > ch / 3 || Math.abs(crop - lastCropValue) < 15) && lastVideoH === ch) {
          return;
        } else {
          cropValue = (crop * -1) + 'px';
        }
        if (cropValue && crop !== lastCropValue) {
          video.style['margin-top'] = cropValue;
          lastCropValue = crop;
        }
        lastVideoH = ch;
      });
    }
    this.trailerLoading = false;
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  public updateCrop(v: any, cb: any) {
    const back = document.createElement('canvas');
    const backcontext = back.getContext('2d');
    const cw = v.clientWidth;
    const ch = v.clientHeight;
    back.width = cw;
    back.height = ch;

    function draw(_v: any, bc: any, w: any, h: any) {
      if (v.paused || v.ended) {
        return false;
      }
      // First, draw it into the backing canvas
      bc.drawImage(v, 0, 0, w, h);
      // Grab the pixel data from the backing canvas
      const idata = bc.getImageData(0, 0, w, h);
      const data = idata.data;
      // Loop through the pixels, turning them grayscale
      let rowCount = 0;
      let rowBrightness = 0;
      let pixelCount = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // tslint:disable-next-line: no-bitwise
        const brightness = (3 * r + 4 * g + b) >>> 3;
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
        rowBrightness += brightness;
        pixelCount++;
        if (pixelCount >= w) {
          if (rowBrightness > 20) {
            break;
          }
          pixelCount = 0;
          rowCount++;
          rowBrightness = 0;
        }
      }
      // STEP CROP row
      cb(rowCount + 15, v, ch);
      // Start over!
      setTimeout(draw, 150, v, bc, w, h);
    }

    draw(v, backcontext, cw, ch);
  }

  public toggleTrailerMuted() {
    this.settings.autoplayTrailerMuted = !this.settings.autoplayTrailerMuted;
    this.settings.save().then(() => {
    });
  }

  public toggleFullscreen() {
    (document.querySelector('video.trailer') as any).webkitRequestFullScreen();
  }

  public trailerError() {
    this.trailerSrc = null;
    if (this.yaudiohackEle) {
      this.yaudiohackEle.nativeElement.src = null;
    }
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  public async toggleFavorite() {
    if (!this.isFavorite) {
      await this.newWatchlist.addItem(this.item);
    } else {
      await this.newWatchlist.removeItem(this.item);
      this.isNotify = false;
    }
    this.isFavorite = this.newWatchlist.checkItem(this.item);
  }

  public async toggleNotify() {
    //this.watchlist.toggleNotify(this.item);
    //this.isNotify = this.watchlist.isNotify(this.item);
  }

  public showInBrowser(url: string) {
    if (window['nw']) {
      nw.Shell.openExternal(url);
    }
  }


  public async showSeason(season: TvSeason<any>, episodeId?: string) {
    this.loadingSeason = true;
    this.currentSeason = season;
    if (!this.loadedSeasons.has(season)) {
      const episodes = await season.episodes();
      this.loadedSeasons.set(season, episodes);
      this.episodes = episodes;
    } else {
      this.episodes = this.loadedSeasons.get(season);
    }
    this.loadingSeason = false;
    if (episodeId) {
      setTimeout(() => {
        const ele = document.getElementById(episodeId);
        if (ele) {
          this.pageContainer.nativeElement.scrollTo(0, ele.offsetTop - 45);
        }
      }, 500);
    }
  }

  public async playMovie(item: Movie, showResolver: boolean = true) {
    if (item.resolvers && showResolver) {
      this.showResolverPopup(item);
    } else {
      await this.play(item, [item]);
    }

  }

  // tslint:disable-next-line:max-line-length
  public async play(item: TvEpisode<any> | Movie, items: (TvEpisode<any> | Movie)[] = [], resolvers?: Extractor[], force?: boolean) {
    this.trailerSrc = null;
    if (this.yaudiohackEle) {
      this.yaudiohackEle.nativeElement.src = null;
    }
    this.player.playlist.clear();
    this.player.playlist.add(...items);
    await this.player.play(item);
  }

  public async reset(item: any) {
    History.default.setProgress(item, 0);
  }

  public async watched(item: any) {
    History.default.setProgress(item, 1);
  }

  public async watchedAllBefore(item: any) {
    const index = this.episodes.indexOf(item);
    if (index !== -1) {
      const pitems = this.episodes.slice(0, index + 1);
      for (const sitem of pitems) {
        History.default.setProgress(sitem, 1);
      }
    }
  }

  private async loadItem(providerId: string, id: string) {
    this.item = null;
    this.seasons = [];
    this.currentSeason = null;
    this.episodes = null;
    this.suggestions = [];
    this.cast = [];
    this.trailerSrc = null;
    this.trailerAudioTrack = null;
    if (this.yaudiohackEle && this.yaudiohackEle.nativeElement) {
      this.yaudiohackEle.nativeElement.src = null;
    }
    this.provider = getProviderById(providerId);
    if (!this.provider) {
      return;
    }
    try {
      await this.load(id);
      if (typeof window !== 'undefined') {
        this.pageContainer.nativeElement.scrollTop = 0;
      }
      if (this.item instanceof Movie && this.item.autoplay) {
        await this.playMovie(this.item);
        return;
      }
      if (this.settings.autoplayTrailer) {
        await this.playTrailer();
      }
    } catch (e) {
      alert(e.message);
      console.error(e);
      window.history.back();
    }
  }

  private async load(id: string): Promise<void> {
    let item = await this.provider.get(id);
    if (!item) {
      throw new Error('Item nicht gefunden');
    }
    let season: TvSeason<any>;
    let episode: TvEpisode<any>;

    if (item instanceof TvEpisode) {
      season = item.parent;
      episode = item;
      item = item.parent.parent;
    } else if (item instanceof TvSeason) {
      season = item;
      item = item.parent;
    }
    this.isFavorite = this.newWatchlist.checkItem(item);
    //this.isNotify = this.watchlist.isNotify(item);
    this.item = item;
    if (item instanceof TvShow) {
      this.type = MEDIA_TYPE.TV_SHOW;
      this.seasons = await item.seasons();
      if (season) {
        season = this.seasons.find(e => e.id === season.id);
      } else {
        season = this.seasons[0];
      }
      this.showSeason(season, episode ? episode.id : null).catch(console.error);
    } else {
      this.type = MEDIA_TYPE.MOVIE;
    }
    if (item.suggestions) {
      item.suggestions().then((suggestions: SearchResult[]) => {
        this.suggestions = suggestions;
        this.ref.detectChanges();
      }, () => this.suggestions = []);
    }
    if (item.cast) {
      item.cast().then((persons: Person[]) => {
        this.cast = persons;
        this.ref.detectChanges();
      }, () => this.cast = []);
    }
  }
}
