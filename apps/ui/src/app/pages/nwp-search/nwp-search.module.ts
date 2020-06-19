import { NgModule } from '@angular/core';
import { NwpSearchComponent } from './nwp-search.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NwpSearchComponent],
  imports: [CommonModule, TranslateModule, NwpMediaCardModule, NwpToolbarModule],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpSearchComponent],
  schemas: []
})
export class NwpSearchModule {
}
