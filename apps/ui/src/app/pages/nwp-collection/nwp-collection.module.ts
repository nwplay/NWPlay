import { NgModule } from '@angular/core';
import { NwpCollectionComponent } from './nwp-collection.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NwpCollectionComponent],
  imports: [CommonModule, FormsModule, NwpMediaCardModule, NwpToolbarModule, MatSelectModule],
  entryComponents: [NwpCollectionComponent]
})
export class NwpCollectionModule {
}
