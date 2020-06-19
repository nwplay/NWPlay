import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitemPopoverComponent } from './sitem-popover.component';
import { MatListModule } from '@angular/material/list';

@NgModule({
  imports: [CommonModule, MatListModule],
  declarations: [SitemPopoverComponent],
  entryComponents: [SitemPopoverComponent]
})
export class SitemPopoverModule {
}
