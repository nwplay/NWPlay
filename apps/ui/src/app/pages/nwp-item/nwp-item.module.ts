import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NwpItemComponent } from './nwp-item.component';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ResolverPopoverModule } from '../../elements/resolver-popover/resolver-popover.module';
import { SitemPopoverModule } from '../../elements/sitem-popover/sitem-popover.module';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [NwpItemComponent],
  imports: [
    CommonModule,
    TranslateModule,
    SitemPopoverModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    FormsModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NwpMediaCardModule,
    MatButtonModule,
    RouterModule,
    NwpToolbarModule,
    MatBottomSheetModule,
    ResolverPopoverModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    PortalModule
  ],
  providers: [],
  bootstrap: [],
  exports: [],
  entryComponents: [NwpItemComponent],
  schemas: []
})
export class NwpItemModule {
}
