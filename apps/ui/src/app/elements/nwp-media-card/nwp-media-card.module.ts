import { NgModule } from '@angular/core';
import { NwpMediaCardComponent } from './nwp-media-card.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [NwpMediaCardComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatRippleModule,
    TranslateModule,
    RouterModule,
    MatMenuModule
  ],
  providers: [],
  bootstrap: [],
  exports: [NwpMediaCardComponent],
  entryComponents: [NwpMediaCardComponent],
  schemas: []
})
export class NwpMediaCardModule {
}
