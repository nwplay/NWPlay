import { ChangeDetectorRef, Component, Input, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  Environment,
  Extractor,
  extractorService,
  ISearchOptions,
  MediaCollection,
  MediaProvider,
  MediaSource,
  Movie, NWPlaySettings,
  Player,
  providers,
  SearchResult,
  TvEpisode,
  TvSeason,
  TvShow
} from '@nwplay/core';
import { Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { MatMenu } from '@angular/material/menu';
import { SettingsService } from '../../services/settings.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ItemService } from '../../services/item.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppService } from '../../app.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environment';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var nw: any;

class UrlProvider extends MediaProvider {
  id = 'cca3cf09-1be0-4d36-9f56-c6c6a6f263d0';
  name = 'Url Provider';

  feature(limit?: number, isHome?: boolean): Promise<SearchResult<MediaProvider>[]> {
    return Promise.resolve([]);
  }

  get(id: string) {
    return Promise.resolve(undefined);
  }

  home(isHome?: boolean): Promise<MediaCollection<MediaProvider>[]> {
    return Promise.resolve([]);
  }

  init(): Promise<void> {
    return Promise.resolve(undefined);
  }

  search(options: ISearchOptions): Promise<SearchResult<MediaProvider>[]> {
    return Promise.resolve([]);
  }

  toolbar(): Promise<any[]> {
    return Promise.resolve([]);
  }

}

class UrlMovie extends Movie<any> {
  constructor(private videoUrl: string) {
    super(new UrlProvider());
    this.title = videoUrl;
    this.subtitle = videoUrl;
    this.id = videoUrl;
    this.url = videoUrl;
  }


  async play(resolvers?: Extractor[], languages?: string[]): Promise<MediaSource> {
    const res = await extractorService.extract(this.videoUrl);
    this.title = res.title;
    console.log(res)
    this.poster = res.image;
    return res;
  }
}

@Component({
  selector: 'nwplay-toolbar',
  templateUrl: './nwp-toolbar.component.html',
  styleUrls: ['./nwp-toolbar.component.scss']
})
export class NwpToolbarComponent implements OnInit {

  constructor(
    private hotKeysService: HotkeysService,
    public settings: SettingsService,
    public zone: NgZone,
    public location: Location,
    public router: Router,
    public itemService: ItemService,
    private ref: ChangeDetectorRef,
    public appService: AppService,
    private matDialog: MatDialog,
    public snackBar: MatSnackBar,
    public translateService: TranslateService
  ) {
    setInterval(() => {
      this.scanClipboard();
    }, 2500);
    this.hotKeysService.reset();
    this.hotKeysService.add(
      new Hotkey(['meta+,', 'ctrl+.'], (): boolean => {
        this.showSettings();
        return false; // Prevent bubbling
      })
    );
    this.hotKeysService.add(
      new Hotkey(['meta+f', 'ctrl+f'], (): boolean => {
        (document.querySelector('.toolbar input') as any).click();
        (document.querySelector('.toolbar input') as any).focus();
        return false; // Prevent bubbling
      })
    );
    this.hotKeysService.add(
      new Hotkey(['meta+r', 'ctrl+r'], (): boolean => {
        window.location.reload();
        return false; // Prevent bubbling
      })
    );
  }
  @Input() public title: string;
  @Input() public provider: any;
  @Input() public tabIndex: number;
  @Input() public isRoot = false;
  @Input() public isPlayer = false;
  @ViewChild('searchMenu', { static: false }) public popover: MatMenu;
  @ViewChild('urlDialog', { static: false }) public urlDialogTemplate: TemplateRef<any>;

  public searchStringUpdate = new Subject<string>();
  public providers = providers;
  public platform = Environment.default.platform;
  public isMobile = Environment.default.isMobile;
  public env = Environment.default;
  public version = environment.pkg.version;

  public searchProviders: any[] = [];
  public position = 'left';
  public searching = false;
  public isSearchOpen = false;
  public isSmall = false;
  public searchValue = '';
  public searchResults: SearchResult[] = [];
  public isFullscreen = false;
  public showWindowButtons = true;
  private lastClipValue = '';

  public showSettings() {
    this.router.navigateByUrl('/settings').catch(console.error);
  }
  public scanClipboard() {
    const clipboard = nw.Clipboard.get();
    const text: string = clipboard.get('text');
    if(text === this.lastClipValue) {
      return;
    }
    const win = nw.Window.get();
    if(text && text.indexOf('http') === 0 && extractorService.test(text)) {
      const regex = /https?:\/\/(.+?)\//gmi;
      const re = regex.exec(text)
      this.snackBar.open(re[1], this.translateService.instant('play'), {
        politeness: 'assertive',
        duration: 15000
      }).onAction().subscribe(() => {
        this.playUrl(text);
      })
      win.requestAttention(5);
    }else if(text && text.indexOf('nwplay:') === 0) {
      const url = text.slice(7);
      if(extractorService.test(text)) {
        this.playUrl(url);
        win.focus();
      }
    }
    this.lastClipValue = text;
  }

  ngOnInit() {
    const win = nw.Window.get();
    win.onFullscreen.addListener(() => {
      this.isFullscreen = true;
    });
    win.onRestore.addListener(() => {
      this.isFullscreen = false;
    });
    this.searchStringUpdate.pipe(debounceTime(400), distinctUntilChanged()).subscribe((value) => {
      this.search(value).catch(console.error);
    });
  }

  public maximize(): void {
    if (this.env.platform === 'macos') {
      this.toggleFullScreen();
    } else {
      nw.Window.get().maximize();
    }
  }

  public toggleFullScreen() {
    nw.Window.get().toggleFullscreen();
  }

  public minimize(): void {
    nw.Window.get().minimize();
  }

  public close(force: boolean): void {
    if (this.platform === 'macos' && !force) {
      nw.Window.get().hide();
    } else {
      nw.Window.get().close();
    }
  }

  public async back() {
    this.appService.history.pop();
    const url = this.appService.history.pop();
    await this.router.navigateByUrl(url.url);
  }

  public async showMore(provider: any) {
    await this.router.navigate(['/search'], {
      queryParams: {
        provider: provider.id,
        q: this.searchValue
      }
    });
  }

  public showSearch() {
    this.isSearchOpen = true;
  }

  public async searchProvidersChange(e: any) {
    this.searchProviders = e.value;
    await this.search();
  }

  public showPlayUrlModal() {
    this.matDialog.open(this.urlDialogTemplate);
  }

  public playUrl(url: string) {
    const movie = new UrlMovie(url);
    Player.default.playlist.add(movie);
    Player.default.play(movie);
  }

  public showMenu(ev: MouseEvent) {
    const menu: any = new nw.Menu();
    menu.append(
      new nw.MenuItem({
        label: `NWPlay ${environment.pkg.version}`,
        enabled: false
      })
    );
    menu.append(new nw.MenuItem({ type: 'separator' }));

    menu.append(
      new nw.MenuItem({
        label: this.translateService.instant('settings'),
        click: () => {
          this.showSettings();
        },
        enabled: true,
        ...(environment.platform === 'macos' ? {
          modifiers: 'cmd',
          key: ','
        } : {})
      })
    );
    menu.append(
      new nw.MenuItem({
        label: this.translateService.instant(this.isFullscreen ? 'fullscreen_off' : 'fullscreen_on'),
        enabled: true,
        click: () => {
          this.toggleFullScreen();
        }
      })
    );
    menu.append(
      new nw.MenuItem({
        label: this.translateService.instant('play_url'),
        enabled: true,
        click: () => {
          this.showPlayUrlModal();
        }
      })
    );

    menu.append(new nw.MenuItem({ type: 'separator' }));
    menu.append(
      new nw.MenuItem({
        label: `NWPlay ${this.translateService.instant('quit')}`,
        click: () => {
          this.close(true);
        },
        enabled: true,
        ...(environment.platform === 'macos' ? {
          modifiers: 'cmd',
          key: 'q'
        } : {})
      })
    );
    ev.preventDefault();
    menu.popup(ev.x, ev.y);
    return false;
  }

  public async search(qry?: string): Promise<void> {
    if(qry && qry.indexOf('http') === 0) {
      this.playUrl(qry);
      return;
    }
    qry = qry || this.searchValue;
    this.searching = true;
    this.isSearchOpen = true;
    this.searchResults = [];
    if (!this.searchValue || this.searchValue.length === 0) {
      this.searching = false;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      return;
    }
    await Promise.all(
      providers.map(async (p) => {
        const result = p.search ? await p.search({ query: qry, take: 15, offset: 0 }) : null;
        if (qry === this.searchValue) {
          this.searchResults = [...this.searchResults, ...result];
        }
      })
    );
  }
}
