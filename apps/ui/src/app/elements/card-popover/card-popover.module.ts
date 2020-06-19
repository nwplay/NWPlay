import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardPopoverComponent } from './card-popover.component';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, MatListModule, RouterModule, TranslateModule],
  declarations: [CardPopoverComponent],
  entryComponents: [CardPopoverComponent]
})
export class CardPopoverModule {
}
