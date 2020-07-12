import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { getProviderById, MEDIA_TYPE, MediaCollection, MediaProvider, SearchResult } from '@nwplay/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item.service';

interface ICollectionCacheItem {
  collection: MediaCollection;
  items: SearchResult[];
  provider: MediaProvider;
  sorting?: any;
  scrollTop: number;
  page: number
}

@Component({
  selector: 'nwplay-page-collection',
  templateUrl: './nwp-collection.component.html',
  styleUrls: ['./nwp-collection.component.scss']
})
export class NwpCollectionComponent implements OnInit, OnDestroy {
  public static cache = new Map<string, ICollectionCacheItem>();
  public cacheItem: ICollectionCacheItem;
  public type: MEDIA_TYPE = -1;
  public loading = false;

  @ViewChild('content', { static: true }) content: ElementRef;

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    public route: ActivatedRoute,
    private itemService: ItemService,
    private ref: ChangeDetectorRef
  ) {
  }

  public async sortingChanged() {
    this.cacheItem.items = [];
    await this.loadMore();
    await this.loadMore();
  }

  public async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const collectionId = this.route.snapshot.params.id;
      const providerId = params.provider;
      const cacheKey = `${collectionId}:${providerId}`;
      if(NwpCollectionComponent.cache.has(cacheKey)) {
        this.cacheItem = NwpCollectionComponent.cache.get(cacheKey);
        setTimeout(() => {
          this.content.nativeElement.scrollTop = this.cacheItem.scrollTop;
        }, 500);
        return;
      }
      const provider = getProviderById(providerId);
      if (!provider) {
        return;
      }
      const collection = await provider.get(collectionId) as MediaCollection;
      if (!collection) {
        alert('Error loading collection');
        return;
      }
      this.cacheItem = {
        collection: collection,
        provider,
        items: [],
        scrollTop: 0,
        page: 0
      };
      if (Array.isArray(collection.sorting)) {
        const def = collection.sorting.find(e => e.default);
        if (def) {
          this.cacheItem.sorting = def.value;
        }
      }
      NwpCollectionComponent.cache.set(cacheKey, this.cacheItem);
      await this.loadMore();
      await this.loadMore();
    });
    this.content.nativeElement.addEventListener(
      'scroll',
      () => {
        if (this.loading) {
          return;
        }
        const ele = this.content.nativeElement;
        const atBottom = ele.scrollHeight - ele.scrollTop - 300 <= ele.clientHeight;
        if (atBottom) {
          this.zone.run(() => {
            this.loadMore().catch(console.error);
          });
        }
      },
      {
        passive: true
      }
    );
  }

  public ngOnDestroy() {
    try {
      this.cacheItem.scrollTop = this.content.nativeElement.scrollTop;
    } catch (e) {
    }
  }

  private async loadMore() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    const res = await this.cacheItem.collection.items({
      sorting: this.cacheItem.sorting,
      offset: this.cacheItem.items.length,
      limit: 25
    });
    if (res.length === 0) {
      return;
    }
    this.cacheItem.page++;
    this.cacheItem.items.push(...res);
    this.loading = false;
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }
}
