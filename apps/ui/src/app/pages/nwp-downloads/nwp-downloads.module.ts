import { NgModule } from '@angular/core';
import { NwpDownloadsComponent } from './nwp-downloads.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [NwpDownloadsComponent],
  imports: [
    CommonModule,
    NwpMediaCardModule,
    NwpToolbarModule,
    MatTabsModule,
    MatTableModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpDownloadsComponent],
  schemas: []
})
export class NwpDownloadsModule {
}
