import { setPlatform } from '@nwplay/core';
import { Platform } from './platform.nwjs';

setPlatform(Platform);
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Dexie from 'dexie';

import * as core from '@nwplay/core';

window['define']('@nwplay/core', function() {
  return core;
});
window['define']('cheerio', function() {
  return core.cheerio;
});


window['define']('dexie', function() {
  return Dexie;
});


if (environment.production) {
  enableProdMode();
}


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

