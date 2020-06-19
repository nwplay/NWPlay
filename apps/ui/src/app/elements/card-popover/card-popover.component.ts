import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ItemService } from '../../services/item.service';
import { MEDIA_TYPE, Movie, SearchResult, TvEpisode, TvShow, Watchlist } from '@nwplay/core';

@Component({
  selector: 'nwp-card-popover',
  templateUrl: './card-popover.component.html',
  styleUrls: ['./card-popover.component.scss']
})
export class CardPopoverComponent implements OnInit {
  public isFavorite = false;
  public watchlist = Watchlist.default;
  public hideFav = false;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: Movie | TvShow | SearchResult,
    public bottomSheetRef: MatBottomSheetRef<CardPopoverComponent>,
    public itemService: ItemService
  ) {
  }

  ngOnInit() {
    if (this.data instanceof SearchResult && this.data.type === MEDIA_TYPE.TV_EPISODE) {
      this.hideFav = true;
    } else {
      this.isFavorite = this.watchlist.checkItem(this.data);
    }
  }

  public async hide() {
    this.bottomSheetRef.dismiss();
  }

  public async watchlistToggle() {

    if (this.isFavorite) {
      await this.watchlist.removeItem(this.data);
    } else {
      await this.watchlist.addItem(this.data);
    }
    this.bottomSheetRef.dismiss();
  }
}
