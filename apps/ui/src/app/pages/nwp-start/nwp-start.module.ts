import { NgModule } from '@angular/core';
import { NwpStartComponent } from './nwp-start.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';

@NgModule({
  declarations: [NwpStartComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NwpMediaCardModule,
    NwpToolbarModule,
    MatDialogModule,
    MatTabsModule,
    OverlayscrollbarsModule
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpStartComponent],
  schemas: []
})
export class NwpStartModule {
}
