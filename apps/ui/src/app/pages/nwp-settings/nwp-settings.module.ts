import { NgModule } from '@angular/core';
import { NwpSettingsComponent } from './nwp-settings.component';
import { CommonModule } from '@angular/common';
import { NwpMediaCardModule } from '../../elements/nwp-media-card/nwp-media-card.module';
import { NwpToolbarModule } from '../../elements/nwp-toolbar/nwp-toolbar.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgPipesModule } from 'ngx-pipes';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [NwpSettingsComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatInputModule,
    TranslateModule,
    FormsModule,
    NgPipesModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatToolbarModule,
    DragDropModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    NwpMediaCardModule,
    NwpToolbarModule,
    MatTabsModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [NwpSettingsComponent],
  schemas: []
})
export class NwpSettingsModule {
}
