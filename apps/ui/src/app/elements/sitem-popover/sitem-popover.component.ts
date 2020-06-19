import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { History } from '@nwplay/core';

@Component({
  selector: 'nwp-sitem-popover',
  templateUrl: './sitem-popover.component.html',
  styleUrls: ['./sitem-popover.component.scss']
})
export class SitemPopoverComponent {
  public item: any = null;
  public items: any[] = null;
  public srp: Function = null;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<SitemPopoverComponent>
  ) {
    this.item = data.item;
    this.items = data.items;
    this.srp = data.srp;
  }

  public async reset(event: MouseEvent) {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    History.default.setProgress(this.item, 0);
  }

  public async watched(event: MouseEvent) {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    History.default.setProgress(this.item, 1);
  }

  public async watchedAllBefore() {
    this.bottomSheetRef.dismiss();
    const index = this.items.indexOf(this.item);
    if (index !== -1) {
      const pitems = this.items.slice(0, index + 1);
      for (const sitem of pitems) {
        History.default.setProgress(sitem, 1);
      }
    }
  }
}
