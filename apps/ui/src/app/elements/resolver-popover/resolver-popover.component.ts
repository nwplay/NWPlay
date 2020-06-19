import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PlayProvider } from '@nwplay/core';

@Component({
  selector: 'nwp-resolver-popover',
  templateUrl: './resolver-popover.component.html',
  styleUrls: ['./resolver-popover.component.scss']
})
export class ResolverPopoverComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: PlayProvider,
    private bottomSheetRef: MatBottomSheetRef<ResolverPopoverComponent>
  ) {
  }

  public play(event: MouseEvent, resolver: any): void {
    this.bottomSheetRef.dismiss(resolver);
    event.preventDefault();
  }
}
