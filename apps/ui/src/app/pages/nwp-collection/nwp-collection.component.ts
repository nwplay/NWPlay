import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { getProviderById, MEDIA_TYPE, MediaCollection } from '@nwplay/core';

import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'nwp-page-collection',
  templateUrl: './nwp-collection.component.html',
  styleUrls: ['./nwp-collection.component.scss']
})
export class NwpCollectionComponent implements OnInit, OnDestroy {
  public static CACHE: any = {};
  public items: any[] = [];
  public type: MEDIA_TYPE = -1;
  public provider: any = null;
  public collection: MediaCollection = null;
  public offset = 0;
  public take = 35;
  public page = 0;
  public loading = false;
  @ViewChild('content', { static: false }) content: ElementRef;

  constructor(
    private zone: NgZone,
    private elementRef: ElementRef,
    public route: ActivatedRoute,
    private itemService: ItemService,
    private ref: ChangeDetectorRef
  ) {
  }

  public async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.items = [];
      this.provider = getProviderById(params.provider);
      if (!this.provider) {
        return;
      }
      this.collection = await this.provider.get(this.route.snapshot.params.id);
      if(!this.collection) {
        alert('Error loading collection');
        return;
      }
      if (NwpCollectionComponent.CACHE[this.collection.id]) {
        this.items = NwpCollectionComponent.CACHE[this.collection.id].items;
        this.offset = NwpCollectionComponent.CACHE[this.collection.id].offset;
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
        try {
          this.content.nativeElement.scrollTop = NwpCollectionComponent.CACHE[this.collection.id].scrollTop;
        } catch (e) {
          /**/
        }
      } else {
        await this.loadMore();
        await this.loadMore();
      }
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
    });
  }

  public ngOnDestroy() {
    try {
      NwpCollectionComponent.CACHE[this.collection.id].scrollTop = this.content.nativeElement.scrollTop;
    } catch (e) {
    }
  }

  private async loadMore() {
    this.loading = true;
    const res = await this.collection.items({
      offset: this.offset,
      limit: this.take
    });
    this.page++;
    if (res.length === 0) {
      return;
    }
    this.items = this.items.concat(res);
    NwpCollectionComponent.CACHE[this.collection.id] = {
      items: this.items,
      offset: this.offset
    };
    this.offset += res.length;
    this.loading = false;
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }
}
