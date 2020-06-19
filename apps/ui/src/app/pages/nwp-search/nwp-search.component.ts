import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild
} from '@angular/core';
import { getProviderById, MEDIA_TYPE, MediaProvider, SearchResult } from '@nwplay/core';
import { ActivatedRoute } from '@angular/router';

class SearchResultCache {
  items: SearchResult[] = [];
  page = 0;
  query: string;
  provider: MediaProvider;
  offset = 0;
  take = 35;
  scrollTop = 0;
}

@Component({
  selector: 'nwp-page-search',
  templateUrl: './nwp-search.component.html',
  styleUrls: ['./nwp-search.component.scss']
})
export class NwpSearchComponent implements AfterViewInit {
  public static cacheItems: SearchResultCache[] = [];

  constructor(
    private zone: NgZone,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParamMap.subscribe((data) => {
      const query = data.get('q');
      const provider = data.get('provider');
      const cachedItem = NwpSearchComponent.cacheItems.find(e => e.query === query && e.provider.id === provider);
      if (cachedItem) {
        this.item = cachedItem;
        setTimeout(() => {
          this.content.nativeElement.scrollTop = this.item.scrollTop;
        }, 500);
      } else {
        this.item = new SearchResultCache();
        NwpSearchComponent.cacheItems.push(this.item);
        this.item.query = query;
        this.item.provider = getProviderById(provider);
        this.loadMore().catch(console.error);
      }
    });
  }

  public item: SearchResultCache = null;
  public type: MEDIA_TYPE = -1;
  public loading = false;
  @ViewChild('content', { static: false }) content: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.content.nativeElement.addEventListener(
      'scroll',
      () => {
        if (this.loading) {
          return;
        }
        const ele = this.content.nativeElement;
        const atBottom = ele.scrollHeight - ele.scrollTop - 300 <= ele.clientHeight;
        this.item.scrollTop = ele.scrollTop;
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

  private async loadMore() {
    if (!this.item) {
      return;
    }
    this.loading = true;
    try {
      const res = await this.item.provider.search({
        query: this.item.query,
        take: this.item.take,
        offset: this.item.offset
      });
      if (res.length === 0) {
        return;
      }
      this.item.items.push(...res);
      this.item.offset += res.length;
      this.item.page++;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }
}
