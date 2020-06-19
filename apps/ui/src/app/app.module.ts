import { AppComponent } from './app.component';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { NwpStartModule } from './pages/nwp-start/nwp-start.module';
import { NwpItemModule } from './pages/nwp-item/nwp-item.module';
import { NwpCollectionModule } from './pages/nwp-collection/nwp-collection.module';
import { NwpPlayerModule } from './pages/nwp-player/nwp-player.module';
import { NwpWatchlistModule } from './pages/nwp-watchlist/nwp-watchlist.module';
import { NwpSettingsModule } from './pages/nwp-settings/nwp-settings.module';
import { NwpWelcomeModule } from './pages/nwp-welcome/nwp-welcome.module';
import { BrowserModule } from '@angular/platform-browser';
import { NwpToolbarModule } from './elements/nwp-toolbar/nwp-toolbar.module';
import { SettingsService } from './services/settings.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { NwpSearchModule } from './pages/nwp-search/nwp-search.module';
import { HotkeyModule } from 'angular2-hotkeys';
import { MatDialogModule } from '@angular/material/dialog';
import { ItemService } from './services/item.service';
import { NwpDownloadsModule } from './pages/nwp-downloads/nwp-downloads.module';
import { AppRoutingModule } from './app-routing.module';
import localeDe from '@angular/common/locales/de';
import { AppService } from './app.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NwpSetupModule } from './pages/setup/nwp-setup.module';
import { SetupGuard } from './setup.guard';
import { PortalModule } from '@angular/cdk/portal';

registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NwpItemModule,
    NwpCollectionModule,
    NwpWelcomeModule,
    NwpPlayerModule,
    NwpStartModule,
    NwpToolbarModule,
    NwpWatchlistModule,
    NwpDownloadsModule,
    NwpSettingsModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    OverlayModule,
    NwpSearchModule,
    DragDropModule,
    TranslateModule.forRoot(),
    HotkeyModule.forRoot(),
    AppRoutingModule,
    NwpSetupModule,
    PortalModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    SettingsService,
    ItemService,
    AppService,
    SetupGuard,
    { provide: LOCALE_ID, useValue: 'de' }
  ],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule {
}
