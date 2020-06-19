import { Component } from '@angular/core';

import { environment } from '../../environment';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { version } from '@nwplay/core';

declare var chrome: any;
declare var nw: any;

@Component({
  selector: 'nwplay-welcome',
  templateUrl: './nwp-welcome.component.html',
  styleUrls: ['./nwp-welcome.component.scss']
})
export class NwpWelcomeComponent {
  public pkg: any = environment.pkg;
  public showLoading = false;
  public env = environment;
  public changelog: string = null;
  public license: string = null;
  public coreVersion = version;

  constructor(private router: Router, public readonly appService: AppService) {
    this.loadChangelog().catch(console.error);
  }

  public close(): void {
    if (window['nw']) {
      nw.Window.get().close();
    } else if ((window as any).chrome) {
      chrome.app.window.current().close();
    }
  }

  public async loadChangelog() {
    try {
      const data = await fetch('assets/Changelog').then((e) => e.text());
      this.changelog = data
        .replace(/^.+?##/ims, '# Changelog\n\n##')
        .replace(/^(#+)(.+?)$/gim, (e, m, c, b) => `<span class="md-t-${m.length}">${c.trim()}</span>`)
        .replace(/^-(.+)/gim, (a, b) => `<li>${b}</li>`);
    } catch (e) {
      this.changelog = 'Error';
    }
    try {
      const data = await fetch('assets/LICENSE').then((e) => e.text());
      this.license = data
        .replace(/\n/gmi, '<br>');
    } catch (e) {
      this.license = null;
    }
  }

  public accept() {
    localStorage['tosVersion'] = '1';
    this.appService.showTos = false;
  }

  public async hide() {
    localStorage['lastVersion'] = environment.pkg.version;
    if (this.appService.providers.length === 0) {
      await this.router.navigateByUrl('/setup');
    } else {
      await this.router.navigateByUrl('/');
    }
    this.appService.loaded = true;
    this.appService.loading = false;
  }
}
