import { NgModule } from '@angular/core';
import { WatchlistComponent } from './nwp-watchlist.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [WatchlistComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatSelectModule,
    FormsModule,
    NwpMediaCardModule,
    NwpToolbarModule
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [WatchlistComponent],
  schemas: []
})
export class NwpWatchlistModule {
}
