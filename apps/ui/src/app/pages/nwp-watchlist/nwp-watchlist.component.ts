import { Component } from '@angular/core';
import { MEDIA_TYPE, MediaProvider, providers, SearchResult, Watchlist } from '@nwplay/core';
import { SettingsService } from '../../services/settings.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'nwplay-page-watchlist',
  templateUrl: './nwp-watchlist.component.html',
  styleUrls: ['./nwp-watchlist.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate(500, style({ opacity: 1 }))]),
      transition(':leave', [animate(500, style({ opacity: 0 }))])
    ])
  ]
})
export class WatchlistComponent {
  public items: any[] = [];
  public type: MEDIA_TYPE = -1;
  public selectedProvider: MediaProvider = null;
  public providers = providers;
  public watchlist = Watchlist.default;

  constructor(
    public settings: SettingsService
  ) {
  }

  public canShowItem(item: SearchResult): boolean {
    if (!item.provider || (this.selectedProvider && this.selectedProvider !== item.provider)) {
      return false;
    }
    return !(item.provider.disabled || (item.provider.isAdult && !this.settings.showAdult));
  }
}
