import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SettingsService } from '../../services/settings.service';
import { Player, History, NWPlaySettings, TvEpisode, Movie } from '@nwplay/core';
import { environment } from '../../environment';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ItemService } from '../../services/item.service';

declare var nw: any;


@Component({
  selector: 'nwplay-player',
  templateUrl: './nwp-player.component.html',
  styleUrls: ['./nwp-player.component.scss'],
  animations: [
    trigger('controlsAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate(500, style({ opacity: 1 }))]),
      transition(':leave', [animate(500, style({ opacity: 0 }))])
    ])
  ]
})
export class NwpPlayerComponent implements OnInit {
  public controlsHidden = true;
  public platform = environment.platform;
  public isDesktop = environment.isDesktop;
  public isTv = environment.isTv;
  public currentTime = 0;
  public pipSupported = true;
  public resumePosition = 0;
  public isFullscreen = false;
  public ready = false;
  public loading: string = null;
  public error: Error = null;
  @ViewChild('media', { static: true }) mediaEle: ElementRef<HTMLVideoElement>;
  public controlsTimeout = null;
  public player = Player.default;
  private isPip = false;
  private mediaSession: any;

  constructor(
    public ref: ChangeDetectorRef,
    public settings: SettingsService,
    public dialog: MatDialog,
    public activatedRoute: Router,
    public translateService: TranslateService
  ) {
    this.activatedRoute.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.hide();
      }
    });
  }

  public mouseEnter(): void {
    clearTimeout(this.controlsTimeout);
  }

  public mouseMove(): void {
    this.resetHideTimeout();
  }

  public mouseLeave(): void {
    this.resetHideTimeout();
  }

  public videoClick() {
    if (environment.isDesktop) {
      this.toggleFullScreen();
    } else {
      this.mediaEle.nativeElement.currentTime += 10;
    }
  }

  public toggleFullScreen() {
    nw.Window.get().toggleFullscreen();
  }

  public hide() {
    this.player.hidden = true;
    if (!this.isPip) {
      this.mediaEle.nativeElement.pause();
    }
  }

  public keyup($event: KeyboardEvent) {
    switch ($event.code) {
      case 'Space':
        this.mediaEle.nativeElement.paused ? this.mediaEle.nativeElement.play() : this.mediaEle.nativeElement.pause();
        break;
      case 'Escape':
        this.toggleFullScreen();
        break;
      case 'ArrowRight':
        this.mediaEle.nativeElement.currentTime += 10;
        break;
      case 'ArrowLeft':
        this.mediaEle.nativeElement.currentTime -= 10;
        break;
      default:
        break;
    }
  }

  public contextMenu(ev: MouseEvent) {
    const playlist = new nw.Menu();
    for (const item of this.player.playlist.items) {
      playlist.append(
        new nw.MenuItem({
          label: item.title,
          enabled: item !== this.player.currentItem,
          click: async () => {
            await this.player.play(item);
          }
        })
      );
    }

    const languages = new nw.Menu();
    for (const item of this.player.currentItem.versions) {
      languages.append(
        new nw.MenuItem({
          label: item.name,
          click: async () => {
            alert('TODOx');
            //await this.player.play(item);
          }
        })
      );
    }

    const menu = new nw.Menu();
    menu.append(
      new nw.MenuItem({
        label: this.player.currentItem ? this.player.currentItem.title : '-',
        enabled: false
      })
    );
    menu.append(new nw.MenuItem({ type: 'separator' }));
    menu.append(
      new nw.MenuItem({
        label: this.translateService.instant('playlist'),
        submenu: playlist
      })
    );
    menu.append(
      new nw.MenuItem({
        label: this.translateService.instant('language'),
        submenu: languages,
        enabled: languages.length > 0
      })
    );
    ev.preventDefault();
    (menu.popup as any)(ev.x, ev.y);
    return false;
  }

  public handleVideoError() {
  }

  public async reload() {
    this.player.currentSource = null;
    await this.player.play(this.player.currentItem);
  }

  ngOnInit() {

    this.player.onStop.subscribe(() => {
      this.mediaEle.nativeElement.src = null;
      this.ref.detectChanges();
    });

    this.mediaEle.nativeElement.addEventListener('timeupdate', () => {
      this.player.onTimeupdate.next(this.mediaEle.nativeElement.currentTime);
      this.mediaSession.setPositionState({
        duration: this.player.duration,
        playbackRate: 1,
        position: this.mediaEle.nativeElement.currentTime
      });
    });
    // Restore watch Position
    this.mediaEle.nativeElement.addEventListener('loadedmetadata', () => {
      this.player.duration = this.mediaEle.nativeElement.duration;
      this.restorePosition();
      this.loading = null;
    });

    this.mediaEle.nativeElement.addEventListener('ended', async () => {
      if (this.settings.autoplay) {
        await this.player.playNextItem();
      } else {
        this.player.stop();
      }
      this.mediaSession.playbackState = "none";
    });

    this.mediaEle.nativeElement.addEventListener('pause', async () => {
      this.player.onPause.next(true);
      this.mediaSession.playbackState = "paused";
    });

    this.mediaEle.nativeElement.addEventListener('canplay', async () => {
      await this.mediaEle.nativeElement.play();
    });

    this.mediaEle.nativeElement.addEventListener('play', async () => {
      this.player.onPlay.next(this.player.currentSource);
      this.mediaSession.playbackState = "playing";
    });

    window.addEventListener(
      'mousewheel',
      (e) => {
        if (!this.player.hidden) {
          const nv = (this.settings.volume += (e as any).deltaY / 1000);
          this.settings.volume = nv > 1 ? 1 : nv < 0 ? 0 : nv;
        }
      },
      { passive: true }
    );

    if ((window.navigator as any).mediaSession) {
      const ms = this.mediaSession = (window.navigator as any).mediaSession;
      ms.setActionHandler('seekbackward', () => {
        this.player.seekToPosition(this.player.currentTime - 10);
      });
      ms.setActionHandler('seekforward', () => {
        this.player.seekToPosition(this.player.currentTime + 10);
      });
      ms.setActionHandler('play', async () => {
        await this.player.play();
      });
      ms.setActionHandler('pause', () => {
        this.player.pause();
      });
      ms.setActionHandler('previoustrack', async () => {
        await this.player.playPrevItem();
      });
      ms.setActionHandler('nexttrack', async () => {
        await this.player.playNextItem();
      });
    }

    window.addEventListener('keyup', this.keyup.bind(this));


    this.player.onSeek.subscribe((pos) => {
      this.mediaEle.nativeElement.currentTime = pos;
    });
  }

  public togglePip() {
    this.mediaEle.nativeElement['requestPictureInPicture']();
    this.isPip = true;
  }

  private restorePosition() {
    if (this.player.lastPlaybackProgress > 0.05 && this.player.lastPlaybackProgress < 0.95) {
      this.mediaEle.nativeElement.currentTime = this.player.lastPlaybackProgress * this.player.duration;
    }
  }

  public resetHideTimeout() {
    this.controlsHidden = false;
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      this.controlsHidden = true;
    }, 5000);
  }
}
