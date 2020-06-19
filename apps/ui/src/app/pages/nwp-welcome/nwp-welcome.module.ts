import { NgModule } from '@angular/core';
import { NwpWelcomeComponent } from './nwp-welcome.component';
import { CommonModule } from '@angular/common';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NwpWelcomeComponent],
  imports: [CommonModule, MatListModule, FormsModule, MatButtonModule, NwpToolbarModule, TranslateModule],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpWelcomeComponent],
  exports: [NwpWelcomeComponent],
  schemas: []
})
export class NwpWelcomeModule {
}
