import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';

import { environment } from '../../environment';
import { SettingsService } from '../../services/settings.service';
import { MediaProvider, providers, extractorService, VIDEO_QUALITY, Extractor } from '@nwplay/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '../../app.service';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'nwp-page-settings',
  templateUrl: './nwp-settings.component.html',
  styleUrls: ['./nwp-settings.component.scss']
})
export class NwpSettingsComponent {
  public extractorFavorites: Set<Extractor> = new Set<Extractor>();
  public extractorService = extractorService;
  public extractors = extractorService.extractors;
  public extractorsFiltered = extractorService.extractors;

  public settingsService: SettingsService = null;
  public VIDEO_QUALITY = VIDEO_QUALITY;
  public env = environment;
  public dialog: MatDialog;
  public providers = providers;
  @ViewChild('pluginSettings') public pluginSettingsTemplate: TemplateRef<any>;

  constructor(
    public translate: TranslateService,
    public _dialog: MatDialog,
    public ref: ChangeDetectorRef,
    private _settings: SettingsService,
    private readonly appService: AppService
  ) {
    this.settingsService = _settings;
    this.dialog = _dialog;
  }

  public filterExtractors(v: Event) {
    const value = (v.target as any).value
    this.extractorsFiltered = this.extractorService.extractors.filter(e => e.name.toLowerCase().includes(value));
  }

  public showPluginSettings(provider: MediaProvider) {
    this.dialog.open(this.pluginSettingsTemplate, {
      data: {
        provider
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

  public removeProvider(provider: MediaProvider) {
    this.appService.removeProvider(provider);
  }

  public saveSettings(provider: MediaProvider) {
    localStorage[provider.id + '_settings'] = JSON.stringify(provider.settings.map(e => ({
      id: e.id,
      value: e.value
    })));
  }


  public installProvider() {
    this.appService.installProvider();
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

  moveToTop(e: Extractor) {
    moveItemInArray(this.extractors, this.extractors.indexOf(e), 0);
    extractorService.saveSort()
  }

  drop(event: CdkDragDrop<Extractor[]>) {
    moveItemInArray(this.extractors, event.previousIndex, event.currentIndex);
    extractorService.saveSort()
  }

  public log(data: any) {
    console.log(data);
  }
}
