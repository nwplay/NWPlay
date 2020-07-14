import { Injectable, NgZone } from '@angular/core';
import {
  addProvider,
  currentProgressChange,
  Extension,
  Extractor,
  extractorService,
  History,
  MEDIA_TYPE,
  MediaProvider,
  Platform,
  providers,
  version as coreVersion,
  Watchlist,
  WatchlistItem
} from '@nwplay/core';
import { environment } from './environment';

import { NavigationStart, Router } from '@angular/router';
import { throttleTime } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { v5 as uuidV5 } from 'uuid';
import * as semver from 'semver';

declare var nw: any;

export interface IInstalledPluginInfo {
  name: string;
  version: string;
  description: string;
  path?: string;
  providers: MediaProvider[];
  extensions: Extension[];
  extractors: Extractor[];
  minCoreVersion: string;
  object: any;
  id: string;
}

@Injectable()
export class AppService {

  constructor(
    private readonly router: Router,
    protected readonly zone: NgZone,
    public snackBar: MatSnackBar,
    public translate: TranslateService
  ) {
    this.router.events.subscribe((e: NavigationStart) => {
      if (e instanceof NavigationStart) {
        if (e.url !== '/setup') {
          localStorage['route'] = e.url;
        }
        this.history.push({
          url: e.url
        });
        localStorage['history'] = JSON.stringify(this.history.slice(-10));
      }
    });
    currentProgressChange
      .pipe(
        throttleTime(1000, asyncScheduler, {
          trailing: true
        })
      )
      .subscribe((e) => {
        const prog = [];
        e.forEach((m, k) => {
          if (m) {
            prog.push(`${k.name}: ${m.text}`);
          }
        });
        this.zone.run(() => {
          this.loadingProgress = prog;
        });
      });

    Watchlist.default.onRemoveItem.subscribe((item) => this.watchlistRemoveItem(item));
    Watchlist.default.onAddItem.subscribe((item) => this.watchlistAddItem(item));
  }

  public loaded = false;
  public loading = false;
  public providers: MediaProvider[] = [];
  public loadingMessage: string = null;
  public showTos = false;
  public showChangelog = false;
  public history: { url: string }[] = [];
  public loadingProgress: string[] = [];
  public installedPlugins: IInstalledPluginInfo[] = [];
  private devPluginData: string;

  public async watchlistAddItem(item: WatchlistItem) {
    let message: any;
    if (item.type === MEDIA_TYPE.TV_SHOW) {
      message = await this.translate.get('watchlist_success_add_tv', item).toPromise();
    } else if (item.type === MEDIA_TYPE.MOVIE) {
      message = await this.translate.get('watchlist_success_add_movie', item).toPromise();
    } else {
      message = await this.translate.get('watchlist_success_add', item).toPromise();
    }
    const action = await this.translate.get('hide').toPromise();
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration: 3500
      });
    });
  }

  public async watchlistRemoveItem(item: WatchlistItem) {
    const message = await this.translate.get('watchlist_success_remove', item).toPromise();
    const action = await this.translate.get('hide').toPromise();
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration: 3500
      });
    });
  }

  public async removeProvider(p: IInstalledPluginInfo) {
    try {
      const fs = nw.require('fs').promises;
      if (p.path) {
        await fs.unlink(p.path);
        window.location.reload();
      }
    } catch (e) {
      alert('Fehler beim entfernen des Providers.');
    }
  }

  public async installPlugin() {
    const self = this;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.nwp,.js,.nwpjs';
    input.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const myFile = this.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', (e) => self.addProviderFromString((e.target as any).result));
        reader.readAsText(myFile);
      }
    });
    input.click();
  }

  public async checkPluginDev() {
    const devUrl = 'http://localhost:8065/plugin.nwpjs';
    const res = await fetch(devUrl);
    if (!res.ok) {
      if (this.devPluginData) {
        setTimeout(() => this.checkPluginDev(), 2500);
      }
      return;
    }
    const data = await res.text();
    if (this.devPluginData && this.devPluginData !== data) {
      window.location.reload();
      return;
    } else if (!this.devPluginData) {
      this.devPluginData = data;
      await this.loadPluginFromUrl(devUrl);
    }
    setTimeout(() => this.checkPluginDev(), 2500);
  }

  public async addProviderFromString(data: string) {
    const fs = nw.require('fs').promises;
    const path = nw.require('path');
    const dataPath = nw.App.dataPath;
    const providersPath = path.join(dataPath, 'providers');
    const buff = window['Buffer'].from(data);
    const module = await window['System'].import('data:text/javascript;base64,' + buff.toString('base64'));
    const info: IInstalledPluginInfo = {
      extensions: [],
      extractors: [],
      minCoreVersion: module.default.pluginRequiredCoreVersion,
      object: undefined,
      providers: [],
      name: module.default.pluginName,
      version: module.default.pluginVersion,
      id: module.default.pluginId,
      description: module.default.pluginDescription
    };
    const message = `Möchtest du das Plugin ${info.name} (${info.version}) installieren?`.trim();
    if (!confirm(message)) {
      return;
    }
    if (info.minCoreVersion && !semver.satisfies(semver.coerce(info.minCoreVersion), `>=${coreVersion}`)) {
      alert(`Das Plugin ist nicht mit mit dieser NWPlay version kompatible.`);
      return;
    }
    const oldPlugin = this.installedPlugins.find((e) => e.id === info.id);
    if (oldPlugin) {
      if (
        !confirm(
          `
Ein Plugin mit der gleichen id ist bereits installiert!
${oldPlugin.name} (${oldPlugin.version}) >>>> ${info.name} (${info.version})
Mochtest du es ersetzen?
`.trim()
        )
      ) {
        return;
      }
    }
    const destFile = path.join(providersPath, (info.id || info.name.replace(/\W/, '_')) + '.nwp');
    await fs.writeFile(destFile, data);
    localStorage['route'] = '/';
    window.location.reload();
    return;
  }


  public async init() {
    if (this.loaded || this.loading) {
      return;
    }
    this.loading = false;
    try {
      document.querySelector('#main-spinner').remove();
    } catch (e) {
      /*IGNORE*/
    }
    if (Platform.default.type === 'nwjs' && environment.platform === 'macos') {
      nw.App.on('reopen', function() {
        nw.Window.get(window).show();
        nw.Window.get(window).focus();
      });
      const mb = new nw.Menu({
        type: 'menubar'
      });
      mb.createMacBuiltin(environment.pkg.productName);
      mb.items[0].submenu.insert(
        new nw.MenuItem({
          label: 'Nach Updates Suchen…',
          enabled: false,
          click: () => {
          }
        }),
        1 as any
      );
      mb.items[0].submenu.insert(
        new nw.MenuItem({
          label: 'Einstelungen…',
          key: ',',
          modifiers: 'cmd',
          click: () => {
            this.router.navigateByUrl('/settings').catch(console.error);
          }
        }),
        2 as any
      );
      mb.items[0].submenu.insert(
        new nw.MenuItem({
          type: 'separator'
        }),
        2 as any
      );
      mb.items[2].submenu.append(
        new nw.MenuItem({
          type: 'separator'
        })
      );
      mb.items[2].submenu.append(
        new nw.MenuItem({
          label: environment.pkg.productName,
          click: function() {
            nw.Window.get(window).show();
            nw.Window.get(window).focus();
          }
        })
      );
      nw.Window.get(window).menu = mb;
    }
    this.providers = providers;
    this.loadingMessage = `Extractors werden geladen.`;
    for (const extractor of extractorService.extractors.slice(0)) {
      if (extractor.init) {
        await extractor.init();
      }
    }

    this.loadingMessage = `Provider werden geladen.`;
    await this.loadPlugins();
    this.loadingMessage = null;

    await Watchlist.default.init();
    await History.default.init();

    if (localStorage['lastVersion'] !== environment.pkg.version) {
      this.showChangelog = true;
    }

    if (localStorage['tosVersion'] !== '1') {
      this.showTos = true;
    }

    if (this.showChangelog || this.showTos) {
      return;
    }
    this.loaded = true;
    this.loading = false;
    setTimeout(() => {
      this.router.navigateByUrl(localStorage['route'] || '/', {
        replaceUrl: true
      });
    });
  }

  private restoreSetting(item: Extension | Extractor | MediaProvider) {
    if (localStorage[item.id + '_settings'] && Array.isArray(item.settings)) {
      const data = JSON.parse(localStorage[item.id + '_settings']);
      for (const s of data) {
        const setting = item.settings.find(e => e.id === s.id);
        if (setting) {
          setting.value = s.value;
        }
      }
    }
  }

  private async loadPluginFromUrl(url: string, path?: string) {
    const module = await window['System'].import(url);
    const mediaProviders = Object.values(module.default).filter(e => e && e['prototype'] instanceof MediaProvider) as typeof MediaProvider[];
    const mediaExtractors = Object.values(module.default).filter(e => e && e['prototype'] instanceof Extractor) as typeof Extractor[];
    const extensions = Object.values(module.default).filter(e => e && e['prototype'] instanceof Extension) as typeof Extension[];
    const pluginInfo: IInstalledPluginInfo = {
      minCoreVersion: module.default.pluginRequiredCoreVersion,
      name: module.default.pluginName,
      version: module.default.pluginVersion,
      description: module.default.pluginDescription,
      id: module.default.pluginId,
      path,
      extractors: [],
      providers: [],
      extensions: [],
      object: module.default
    };
    for (const item of mediaProviders) {
      const provider = new (item as any)() as MediaProvider;
      if (!provider.id) {
        provider.id = uuidV5(item.name, pluginInfo.id);
      }
      this.restoreSetting(provider);
      if (provider.init) {
        await provider.init((e) => {
          this.loadingMessage = e;
        });
      }
      addProvider(provider);
      pluginInfo.providers.push(provider);
    }
    for (const item of mediaExtractors) {
      const extractor = new (item as any)() as Extractor;
      if (!extractor.id) {
        extractor.id = uuidV5(item.name, pluginInfo.id);
      }
      this.restoreSetting(extractor);
      if (extractor.init) {
        await extractor.init();
      }
      extractorService.addExtractor(extractor);
      pluginInfo.extractors.push(extractor);
    }
    for (const item of extensions) {
      const extension = new (item as any)() as Extension;
      if (!extension.id) {
        extension.id = uuidV5(item.name, pluginInfo.id);
      }
      this.restoreSetting(extension);
      if (extension.init) {
        await extension.init();
      }
      pluginInfo.extensions.push(extension);
    }
    this.installedPlugins.push(pluginInfo);
  }

  private async loadPlugin(path: string): Promise<void> {
    const Filesystem = Platform.default.Filesystem;
    const moduleData = await Filesystem.readFile(path);
    await this.loadPluginFromUrl(`data:text/javascript;base64,${moduleData}`, path);
  }

  private async loadPlugins() {
    const dataPath = Platform.default.dataPath;
    const Filesystem = Platform.default.Filesystem;
    const providersPath = Filesystem.joinPath(dataPath, 'providers');
    try {
      await Filesystem.mkdir(providersPath);
    } catch (e) {
    }
    const files = await Filesystem.readdir(providersPath);
    const jsFiles = files.filter((e) => e.split('.').pop() === 'nwp').map(e => {
      return Filesystem.joinPath(providersPath, e);
    });

    for (const file of jsFiles) {
      try {
        await this.loadPlugin(file);
      } catch (e) {
        console.error(e);
      }
    }
    await this.checkPluginDev();
  }
}
