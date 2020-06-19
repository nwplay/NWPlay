import { AfterViewInit, Component } from '@angular/core';
import { WatchlistComponent } from './pages/nwp-watchlist/nwp-watchlist.component';
import { NwpSettingsComponent } from './pages/nwp-settings/nwp-settings.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import lang_de from '../lang/de.json';
import lang_en from '../lang/en.json';
import { AppService } from './app.service';
import { Environment } from '@nwplay/core';
import { SettingsService } from './services/settings.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'nwplay-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: []
})
export class AppComponent implements AfterViewInit {
  public static Default: AppComponent = null;
  public watchlist = WatchlistComponent;
  public settings = NwpSettingsComponent;
  public environment = Environment.default;

  constructor(
    private router: Router,
    private translate: TranslateService,
    public settingsService: SettingsService,
    public appService: AppService
  ) {
    AppComponent.Default = this;
    this.translate.setTranslation('de', lang_de);
    this.translate.setTranslation('en', lang_en);
    this.translate.setDefaultLang('en');
    this.translate.use(settingsService.defaultLang || 'en');
    window.document.title = 'NWPlay';
  }

  public async ngAfterViewInit() {
    await this.appService.init();
  }
}
