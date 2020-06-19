import { Injectable } from '@angular/core';
import { VIDEO_QUALITY } from '@nwplay/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class SettingsService {
  public preferredVideoQuality: VIDEO_QUALITY = VIDEO_QUALITY.HD;
  public askRestartVideo = true;
  public autoplay = true;
  public autoplayTrailer = true;
  public showAdult = false;
  public continue = true;
  public scrollVol = false;
  public volume = 1;
  public dropbox: string = null;
  public watchlistFilter: string = null;
  public searchFilter: string[] = [];
  public defaultLang: string = typeof window !== 'undefined' ? window.navigator.language.split('-')[0] : 'de';
  public showAsPopup = true;
  public autoplayTrailerMuted = false;
  public showAppIcon = false;
  public audioLanguage = 'en';
  public subtitleLanguage: string = null;
  public autoCropTrailer = true;

  private KEYS = [
    'searchFilter',
    'preferredVideoQuality',
    'askRestartVideo',
    'autoplay',
    'autoplayTrailer',
    'autoplayTrailerMuted',
    'showAdult',
    'continue',
    'scrollVol',
    'volume',
    'defaultLang',
    'dropbox',
    'watchlistFilter',
    'showAsPopup',
    'audioLanguage',
    'subtitleLanguage',
    'autoCropTrailer'
  ];

  constructor(private readonly router: Router, private readonly matDialog: MatDialog) {
    this.load();
  }

  public async clearCache(): Promise<void> {
  }

  public async resetApp(): Promise<void> {
    localStorage.clear();
  }

  public async save(): Promise<void> {
    const data = {};
    for (const k of this.KEYS) {
      data[k] = this[k];
    }
    localStorage['settings'] = JSON.stringify(data);
  }

  public load(): void {
    try {
      const data = JSON.parse(localStorage['settings']);
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          this[key] = data[key];
        }
      }
    } catch (e) {
      /**/
    }
  }
}
