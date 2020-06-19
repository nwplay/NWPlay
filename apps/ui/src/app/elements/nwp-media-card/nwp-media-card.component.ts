import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CardPopoverComponent } from '../card-popover/card-popover.component';
import { SearchResult, Watchlist } from '@nwplay/core';
import { environment } from '../../environment';
import { Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ItemService } from '../../services/item.service';
import { TranslateService } from '@ngx-translate/core';

declare var nw: any;

@Component({
  selector: 'nwp-media-card',
  templateUrl: './nwp-media-card.component.html',
  styleUrls: ['./nwp-media-card.component.scss']
})
export class NwpMediaCardComponent implements OnInit, OnDestroy {
  @Input() item: SearchResult = null;
  @Input() tabIndex = -1;
  @Input() isWatchlist = false;
  @Input() isFavorite = false;
  @Input() showAsModal = false;

  public noImage = false;
  public smallImage = false;
  public environment = environment;
  private watchlist = Watchlist.default;

  constructor(
    private ref: ChangeDetectorRef,
    public router: Router,
    private bottomSheet: MatBottomSheet,
    public itemService: ItemService,
    private zone: NgZone,
    private translate: TranslateService
  ) {
  }

  public showMenu() {
    this.zone.run(() => {
      const ref = this.bottomSheet.open(CardPopoverComponent, {
        data: this.item
      });
      ref.afterDismissed().subscribe(() => {
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      });
    });
  }

  public imageErrorHandler() {
    this.noImage = true;
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  public async watchlistToggle() {
    if (this.isFavorite) {
      await this.watchlist.removeItem(this.item);
    } else {
      await this.watchlist.addItem(this.item);
    }
  }

  ngOnInit() {
    this.isFavorite = this.watchlist.checkItem(this.item);
  }

  public async showContextMenu(ev: MouseEvent) {
    const menu = new nw.Menu();

    menu.append(
      new nw.MenuItem({
        label: this.translate.instant('show'),
        click: () => {
          this.itemService.show(this.item).catch(console.error);
        }
      })
    );
    menu.append(new nw.MenuItem({ type: 'separator' }));
    // tslint:disable-next-line:max-line-length
    menu.append(
      new nw.MenuItem({
        label: this.translate.instant(this.isFavorite ? 'remove_from_watchlist' : 'add_to_watchlist'),
        click: () => {
          this.watchlistToggle();
        }
      })
    );
    menu.append(
      new nw.MenuItem({
        label: this.translate.instant('hide'),
        click: () => {
          this.itemService.hideItem(this.item);
        }
      })
    );
    ev.preventDefault();
    (menu.popup as any)(ev.x, ev.y);
    return false;
  }

  ngOnDestroy() {
  }
}
