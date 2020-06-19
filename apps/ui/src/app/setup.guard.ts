import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { providers } from '@nwplay/core';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate() {
    if (providers.length === 0) {
      return this.router.parseUrl('/setup');
    }
    return true;
  }
}
