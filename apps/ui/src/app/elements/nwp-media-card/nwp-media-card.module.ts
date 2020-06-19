import { NgModule } from '@angular/core';
import { NwpMediaCardComponent } from './nwp-media-card.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { CardPopoverModule } from '../card-popover/card-popover.module';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NwpMediaCardComponent],
  imports: [
    CommonModule,
    CardPopoverModule,
    MatIconModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatRippleModule,
    CardPopoverModule,
    TranslateModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [],
  exports: [NwpMediaCardComponent],
  entryComponents: [NwpMediaCardComponent],
  schemas: []
})
export class NwpMediaCardModule {
}
