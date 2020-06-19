import { NgModule } from '@angular/core';
import { NwpCollectionComponent } from './nwp-collection.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';

@NgModule({
  declarations: [NwpCollectionComponent],
  imports: [CommonModule, NwpMediaCardModule, NwpToolbarModule],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpCollectionComponent],
  schemas: []
})
export class NwpCollectionModule {
}
