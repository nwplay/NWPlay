import { NwpPlayerComponent } from './nwp-player.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { FormsModule } from '@angular/forms';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';
import { VgBufferingModule } from 'videogular2/compiled/buffering';
import { VgStreamingModule } from 'videogular2/compiled/streaming';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { PlayerTimePipe } from './nwp-player-time.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NwpPlayerComponent, PlayerTimePipe],
  imports: [
    NwpToolbarModule,
    TranslateModule,
    MatSelectModule,
    FormsModule,
    MatSliderModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
    CommonModule,
    NwpMediaCardModule,
    FormsModule
  ],
  providers: [],
  exports: [NwpPlayerComponent],
  entryComponents: [NwpPlayerComponent],
  schemas: []
})
export class NwpPlayerModule {
}
