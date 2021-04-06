import { Inject, Injectable, OnDestroy } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';

@Injectable({providedIn: 'root'})
export class InAppRootOverlayContainer extends OverlayContainer implements OnDestroy {
  constructor(@Inject(DOCUMENT) _document: any, public platform: Platform) {
    super(_document, platform);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getRootElement(): Element {
    return this._document.querySelector('.page-view');
  }

  protected _createContainer(): void {
    super._createContainer();
    this._appendToRootComponent();
  }

  private _appendToRootComponent(): void {
    if (!this._containerElement) {
      return;
    }

    const rootElement = this.getRootElement();
    const parent = rootElement || this._document.body;
    parent.appendChild(this._containerElement);
  }
}
