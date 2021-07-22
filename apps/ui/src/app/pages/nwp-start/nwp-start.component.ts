import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  getProviderById,
  History,
  IMAGE_SIZE,
  IMediaCollectionOptions,
  MEDIA_TYPE,
  MediaCollection,
  MediaProvider,
  Movie,
  providers,
  SearchResult,
  SOURCE_TYPE,
  TvShow,
  VIDEO_QUALITY
} from '@nwplay/core';
import { screen } from './nwp-start.helpers';
import { environment } from '../../environment';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { ItemService } from '../../services/item.service';
import _ from 'lodash';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, multicast, skip, take } from 'rxjs/operators';

interface IHomeData {
  rows: { items: SearchResult[]; collection: MediaCollection }[];
  features: SearchResult[];
  scrollTop?: number;
}

class NewItemsPersonalCollection extends MediaCollection {
  title = 'Neue Sachen für dich';

  async items(opts: IMediaCollectionOptions): Promise<SearchResult[]> {
    return [];
  }
}

@Component({
  selector: 'nwplay-page-start',
  templateUrl: './nwp-start.component.html',
  styleUrls: ['./nwp-start.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate(250, style({ opacity: 1 }))]),
      transition(':leave', [animate(250, style({ opacity: 0 }))])
    ])
  ]
})
export class NwpStartComponent implements OnInit, AfterViewChecked, OnDestroy {
  public static cache = new WeakMap<Object, any>();
  private static homeSymbol = Object();
  public groups: MediaCollection[];
  public provider: MediaProvider = null;
  public data: IHomeData = null;
  public env = environment;
  public loading = true;
  public screenWidth = 0;
  public initScroll = true;
  public featureItem: SearchResult;
  public history = History.default;
  public historyItems: SearchResult[] = [];
  @ViewChild('mcont', { static: false }) public mcont: ElementRef<HTMLDivElement>;
  @ViewChild('scrollView', { static: false }) public scrollView: ElementRef<HTMLDivElement>;
  public featureChange = new Subject<number>();
  private featureItemImage: string;
  private featureItemImageLow = false;
  private featureItemVideo: string;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private itemService: ItemService
  ) {
  }

  public async showItem(item: SearchResult) {
    await this.itemService.show(item);
  }

  public showEpisode(id: string) {

  }

  ngOnDestroy(): void {
    if (this.data) {
      this.data.scrollTop = this.scrollView.nativeElement.scrollTop;
    }
    this.featureChange.unsubscribe();
  }

  public loadWatchHistory() {
    this.historyItems = History.default.items
      .filter(e => (!this.provider || this.provider === e.provider) && e.onDeck)
      .sort((a, b) => b.date - a.date)
      .slice(0, 12)
      .map(e => {
        const r = new SearchResult(e.provider);
        r.type = MEDIA_TYPE.TV_EPISODE;
        r.size = IMAGE_SIZE.THUMB;
        r.image = e.poster;
        r.id = e.id;
        r.title = e.title;
        r.progress = e.progress;
        r.hideContext = true;
        return r;
      });
  }

  async ngOnInit() {
    if (typeof window === 'undefined') {
      if (screen) {
        this.screenWidth = screen.mainScreen.widthDIPs;
      }
      this.provider = providers[0];
    }

    this.route.url.subscribe(async () => {
      if (this.data) {
        this.data.scrollTop = this.scrollView.nativeElement.scrollTop;
      }
      try {
        const providerId = this.route.snapshot.params.provider;
        if (providerId && providerId !== 'home') {
          this.provider = getProviderById(providerId);
        } else {
          this.provider = null;
        }
        this.loading = true;
        this.loadWatchHistory();
        await this.load();
        this.loading = false;
      } catch (e) {
        console.error(e);
      }
    });

    this.featureChange.pipe(distinctUntilChanged(), multicast(new Subject(), s => merge(
      s.pipe(take(1)),
      s.pipe(skip(1), debounceTime(500))
    ))).subscribe((i) => {
      this.setFeature(i);
    });
  }

  public scroll(ele: any, amount: number): void {
    ele.scrollLeft = ele.scrollLeft + amount;
  }

  public async setFeature(index: number = 0) {
    if (this.data.features[index] && this.data.features[index] !== this.featureItem) {
      this.featureItemVideo = null;
      this.featureItem = this.data.features[index];

      const img = new Image();
      const l = () => {
        this.featureItemImageLow = !(img.width >= 900 && img.height > 600);
        this.featureItemImage = img.src;
        img.removeEventListener('load', l);
      };
      img.addEventListener('load', l);
      img.src = this.featureItem['image'];
      if (this.featureItem.provider && this.settings.autoplayTrailer) {
        const item = await this.featureItem.provider.get(this.featureItem.id);
        if ((item instanceof TvShow || item instanceof Movie) && item.trailer) {
          try {
            const t = await item.trailer();
            if (t && t.type === SOURCE_TYPE.HTTP) {
              if ([VIDEO_QUALITY.HD, VIDEO_QUALITY.FULL_HD, VIDEO_QUALITY.ULTRA_HD].includes(t.video_quality)) {
                this.featureItemVideo = t.source;
              }
            }
          } catch (e) {
            console.warn(e);
          }
        }
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.mcont && this.initScroll) {
      this.initScroll = false;
      if (this.data) {
        this.scrollView.nativeElement.scrollTop = this.data.scrollTop;
      }
    }
  }

  private async load(): Promise<void> {
    if (NwpStartComponent.cache.has(this.provider || NwpStartComponent.homeSymbol)) {
      this.data = NwpStartComponent.cache.get(this.provider || NwpStartComponent.homeSymbol);
      return;
    }
    this.loading = true;
    const data = (this.data = { rows: [], features: [] });
    const proms: Promise<any>[] = [];
    const provs = this.provider ? [this.provider] : providers;
    for (const provider of provs) {
      if (provider.feature) {
        const featurePromise = provider.feature().then(
          (res) => {
            data.features = res;
            return res;
          },
          (e: Error) => console.error(e)
        );
        proms.push(featurePromise);
      }
      const collections = await provider.home();
      for (const collection of collections) {
        const item = { collection: collection, items: [] };
        if (!this.provider) {
          collection.title = `${collection.provider.name} - ${collection.title}`;
        }
        const prom = collection.items({ offset: 0, limit: 12, random: true }).then((items) => {
          item.items = items;
          if (items.length < 10) {
            data.rows.splice(data.rows.indexOf(item), 1);
          }
        });
        proms.push(prom);
        this.data.rows.push(item);
      }
    }
    if (!this.provider) {
      data.rows = _.shuffle(data.rows);
      const newItemsCollection = new NewItemsPersonalCollection(null);
      const newItems = await newItemsCollection.items({ limit: 12, offset: 0, random: true });
      if (newItems.length > 0) {
        this.data.rows.unshift({
          collection: newItemsCollection,
          items: newItems
        });
      }
    }
    NwpStartComponent.cache.set(this.provider || NwpStartComponent.homeSymbol, data);
    await Promise.all(proms);
    this.featureChange.next(0);


  }

  featureItemMouseenter(i: number) {
    this.featureChange.next(i);
  }
}
