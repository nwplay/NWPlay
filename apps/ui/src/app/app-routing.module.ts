import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NwpSettingsComponent } from './pages/nwp-settings/nwp-settings.component';
import { WatchlistComponent } from './pages/nwp-watchlist/nwp-watchlist.component';
import { NwpWelcomeComponent } from './pages/nwp-welcome/nwp-welcome.component';
import { NwpSearchComponent } from './pages/nwp-search/nwp-search.component';
import { NwpDownloadsComponent } from './pages/nwp-downloads/nwp-downloads.component';
import { NwpItemComponent } from './pages/nwp-item/nwp-item.component';
import { NwpCollectionComponent } from './pages/nwp-collection/nwp-collection.component';
import { NwpStartComponent } from './pages/nwp-start/nwp-start.component';
import { NwpSetupComponent } from './pages/setup/nwp-setup.component';
import { SetupGuard } from './setup.guard';

const routes: Routes = [
  { path: 'setup', component: NwpSetupComponent },
  {
    path: '',
    canActivate: [SetupGuard],
    children: [{ path: 'settings', component: NwpSettingsComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'welcome', component: NwpWelcomeComponent },
      { path: 'search', component: NwpSearchComponent },
      { path: 'downloads/:provider', component: NwpDownloadsComponent },
      { path: 'downloads', component: NwpDownloadsComponent },
      { path: ':provider/tv/:id', component: NwpItemComponent },
      { path: ':provider/tv/:id/:season', component: NwpItemComponent },
      { path: ':provider/tv/:id/:season/:episode', component: NwpItemComponent },
      { path: ':provider/movie/:id', component: NwpItemComponent },
      { path: ':provider/movie/:id', component: NwpItemComponent },
      { path: ':provider/collection/:id', component: NwpCollectionComponent },
      { path: ':provider', component: NwpStartComponent },
      { path: '**', redirectTo: '/home' }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
