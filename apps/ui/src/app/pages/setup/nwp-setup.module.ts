import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NwpSetupComponent } from './nwp-setup.component';

@NgModule({
  declarations: [NwpSetupComponent],
  imports: [CommonModule, MatListModule, FormsModule, MatButtonModule, NwpToolbarModule, TranslateModule],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpSetupComponent],
  exports: [NwpSetupComponent],
  schemas: []
})
export class NwpSetupModule {
}
