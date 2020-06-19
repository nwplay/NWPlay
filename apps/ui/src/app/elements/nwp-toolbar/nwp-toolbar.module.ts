import { NgModule } from '@angular/core';
import { NwpToolbarComponent } from './nwp-toolbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [NwpToolbarComponent],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatSelectModule,
    TranslateModule,
    MatTooltipModule,
    OverlayModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    SatPopoverModule,
    MatListModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [],
  exports: [NwpToolbarComponent],
  schemas: []
})
export class NwpToolbarModule {
}
