import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';

import { environment } from '../../environment';
import { SettingsService } from '../../services/settings.service';
import { MediaProvider, providers, extractorService, VIDEO_QUALITY, Extractor } from '@nwplay/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService, IInstalledPluginInfo } from '../../app.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'nwp-page-settings',
  templateUrl: './nwp-settings.component.html',
  styleUrls: ['./nwp-settings.component.scss']
})
export class NwpSettingsComponent {
  public extractorService = extractorService;

  public extractorsFiltered = extractorService.extractors.slice(0, 5);

  public settingsService: SettingsService = null;
  public VIDEO_QUALITY = VIDEO_QUALITY;
  public env = environment;
  public dialog: MatDialog;
  public providers = providers;
  @ViewChild('pluginSettings') public pluginSettingsTemplate: TemplateRef<any>;

  public filterExtractorsSubject = new Subject<string>();

  constructor(
    public translate: TranslateService,
    public _dialog: MatDialog,
    public ref: ChangeDetectorRef,
    private _settings: SettingsService,
    public readonly appService: AppService
  ) {
    this.settingsService = _settings;
    this.dialog = _dialog;

    this.filterExtractorsSubject.pipe(debounceTime(650)).subscribe((value) => {
      this.extractorsFiltered = this.extractorService.extractors.filter(e => e.name.toLowerCase().includes(value)).slice(0, 5);
    });

  }

  public filterExtractors(v: Event) {
    this.filterExtractorsSubject.next((v.target as any).value);
  }

  public showPluginSettings(pluginInfo: IInstalledPluginInfo) {
    this.dialog.open(this.pluginSettingsTemplate, {
      data: {
        pluginInfo
      }
    });
  }

  public async setValue($event: any) {
    this.settingsService[$event.option.value] = $event.option.selected;
    await this.settingsService.save();
    if ($event.option.value === 'showAdult') {
      this.reloadApp();
    }
  }

  public removeProvider(provider: IInstalledPluginInfo) {
    this.appService.removePlugin(provider);
  }

  public saveSettings(provider: MediaProvider) {
    localStorage[provider.id + '_settings'] = JSON.stringify(provider.settings.map(e => ({
      id: e.id,
      value: e.value
    })));
  }


  public installProvider() {
    this.appService.installPlugin();
  }

  public async clearCache() {
    await this.settingsService.clearCache();
    this.reloadApp();
  }

  public async resetApp() {
    if (window.confirm('Möchtest du wirklich alle deine Daten löschen?')) {
      await this.settingsService.resetApp();
      this.reloadApp(true);
    }
  }

  public reloadApp(force = false) {
    if (force || window.confirm('NWPlay muss neugeladen werden um die Änderungen zu übernehmen.')) {
      if (window['chrome']) {
        window['chrome'].runtime.reload();
      } else {
        window.location.reload();
      }
    }
  }

  drop(event: CdkDragDrop<Extractor[]>) {
    moveItemInArray(this.extractorService.favorites, event.previousIndex, event.currentIndex);
    extractorService.saveFavorites();
  }

  public log(data: any) {
    console.log(data);
  }

  addToProviderFav(provider: Extractor) {
    this.extractorService.addFavorite(provider);
    this.ref.detectChanges();
  }
}
