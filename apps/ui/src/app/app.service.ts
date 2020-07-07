import { Injectable, NgZone } from '@angular/core';
import {
  addProvider,
  currentProgressChange,
  Extension,
  MediaProvider,
  providers,
  Extractor,
  extractorService, Watchlist, History, WatchlistItem, MEDIA_TYPE
} from '@nwplay/core';
import { environment } from './environment';
import { NavigationStart, Router } from '@angular/router';
import { throttleTime } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

declare var nw: any;

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

  public pluginPathMap = new Map<any, any>();
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

  public async removeProvider(provider: MediaProvider) {
    try {
      const fs = nw.require('fs').promises;
      const providersPath = this.pluginPathMap.get(provider);
      await fs.unlink(providersPath);
      const index = providers.indexOf(provider);
      if (index !== -1) {
        providers.splice(index, 1);
      }
    } catch (e) {
      alert('Fehler beim entfernen des Providers.');
    }
    window.location.reload();
  }

  public async installProvider() {
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
    const devUrl = localStorage['plugin_dev_url'];
    if (devUrl && devUrl.length > 0) {
      try {
        const data = await fetch(devUrl).then(e => e.text());
        if (this.devPluginData !== data) {
          if (this.devPluginData) {
            window.location.reload();
            return;
          } else {
            await this.loadPluginFromBuffer(Buffer.from(data), 'dev');
            this.devPluginData = data;
          }
        }
        setTimeout(() => this.checkPluginDev(), 2500);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public async addProviderFromString(data: string) {
    const fs = nw.require('fs').promises;
    const path = nw.require('path');
    const dataPath = nw.App.dataPath;
    const providersPath = path.join(dataPath, 'providers');
    const buff = window['Buffer'].from(data);
    const module = await window['System'].import('data:text/javascript;base64,' + buff.toString('base64'));
    const info = {
      name: module.default.pluginName,
      version: module.default.pluginVersion,
      id: module.default.pluginId,
      description: module.default.pluginDescription
    };
    const message = `Möchtest du das Plugin ${info.name} (${info.version}) installieren?\n\n${info.description}`.trim();
    if (!confirm(message)) {
      return;
    }
    const oldProvider = providers.find((e) => e.id === info.id);
    if (oldProvider) {
      if (
        !confirm(
          `
Ein Provider mit der gleichen id ist bereits installiert!
${oldProvider.name} (${oldProvider.version}) >>>> ${info.name} (${info.version})
Mochtest du ihn ersetzen?
`.trim()
        )
      ) {
        return;
      }
    }
    const destFile = path.join(providersPath, info.id + '.nwp');
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
    if (nw && environment.platform === 'macos') {
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
    this.loadingMessage = `Built in Extractor werden geladen.`;
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

  private async loadPluginFromBuffer(moduleData: Buffer, path?: string) {
    const module = await window['System'].import('data:text/javascript;base64,' + moduleData.toString('base64'));
    const mediaProviders = Object.values(module.default).filter(e => e['prototype'] instanceof MediaProvider);
    const mediaExtractors = Object.values(module.default).filter(e => e['prototype'] instanceof Extractor);
    const extensions = Object.values(module.default).filter(e => e['prototype'] instanceof Extension);
    for (const item of mediaProviders) {
      const provider = new (item as any)() as MediaProvider;
      if (localStorage[provider.id + '_settings']) {
        const data = JSON.parse(localStorage[provider.id + '_settings']);
        for (const s of data) {
          const setting = provider.settings.find(e => e.id === s.id);
          if (setting) {
            setting.value = s.value;
          }
        }
      }

      if (provider.init) {
        await provider.init();
      }
      this.pluginPathMap.set(provider, path);
      addProvider(provider);
    }
    for (const item of mediaExtractors) {
      const extractor = new (item as any)() as Extractor;
      if (extractor.init) {
        await extractor.init();
      }
      this.pluginPathMap.set(extractor, path);
      extractorService.addExtractor(extractor);
    }
    for (const item of extensions) {
      const extension = new (item as any)() as Extension;
      if (extension.init) {
        await extension.init();
      }
      this.pluginPathMap.set(extension, path);
    }
  }

  private async loadPlugin(path: string): Promise<void> {
    const fs = nw.require('fs').promises;
    const moduleData = (await fs.readFile(path));
    await this.loadPluginFromBuffer(moduleData, path);
  }

  private async loadPlugins() {
    const dataPath = nw.App.dataPath;
    const fs = nw.require('fs').promises;
    const path = nw.require('path');
    const providersPath = path.join(dataPath, 'providers');
    try {
      await fs.mkdir(providersPath);
    } catch (e) {
    }
    const files = (await fs.readdir(providersPath)) as string[];
    const jsFiles = files.filter((e) => e.split('.').pop() === 'nwp');
    for (const file of jsFiles) {
      try {
        await this.loadPlugin(path.join(providersPath, file));
      } catch (e) {
        console.error(e);
      }
    }
    await this.checkPluginDev();
  }
}
