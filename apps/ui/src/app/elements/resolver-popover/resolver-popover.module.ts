import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResolverPopoverComponent } from './resolver-popover.component';
import { MatListModule } from '@angular/material/list';

@NgModule({
  imports: [CommonModule, MatListModule],
  declarations: [ResolverPopoverComponent],
  entryComponents: [ResolverPopoverComponent]
})
export class ResolverPopoverModule {
}
