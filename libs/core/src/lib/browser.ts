declare var chrome: any;
declare var nw: any;

export interface BrowserRedirectEvent {
  oldUrl: string;
  newUrl: string;
}

export interface BrowserLoadEvent {
  url: string;
}

export interface BrowserCookie {
  // The name of the cookie.
  name?: string;
  // The value of the cookie.
  value?: string;
  // The domain of the cookie (e.g. "www.google.com", "example.com").
  domain?: string;
  // True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie).
  hostOnly?: boolean;
  // The path of the cookie.
  path?: string;
  // True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS).
  secure?: boolean;
  // True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts).
  httpOnly?: boolean;
  // True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date.
  session?: boolean;
  // The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.
  expirationDate?: number;
  // The ID of the cookie store containing this cookie, as provided in getAllCookieStores().
  storeId?: string;
}

export interface BrowserCookieSet extends BrowserCookie {
  url: string;
}

export interface BrowserConfig {
  loadImages?: boolean;
}

export type BrowserRedirectTestCallback = (e: BrowserRedirectEvent) => boolean;

export class Browser {
  public static nativeComponent = null;
  public handlers;
  public capacitorUrl = null;
  public loadingPromis = null;
  private ref: any = null;

  constructor(url: string, config?: BrowserConfig) {
    this.handlers = {};
    if (Browser.nativeComponent) {
      this.capacitorUrl = url;
      this.loadingPromis = Browser.nativeComponent.showBrowser();
      this.loadingPromis.then((e) => {
        this.ref = e;
        let lastSrc = null;
        e.instance.webview.nativeElement.on('loadFinished', (args: any) => {
          if (args.url === 'about:blank' || args.url === lastSrc) {
            return;
          }
          lastSrc = args.url;
          setTimeout(() => {
            this.emit('contentload', {
              url: args.url
            } as BrowserLoadEvent);
          }, 1250);
          this.capacitorUrl = args.url;
        });
        e.instance.webview.nativeElement.on('loadStarted', (args: any) => {
          if (args.url === 'about:blank' || args.url !== this.capacitorUrl) {
            return;
          }
          this.emit('loadstart', {
            url: args.url
          } as BrowserLoadEvent);
        });
        e.instance.webview.nativeElement.on('shouldOverrideUrlLoading', (args: any) => {
          if (args.url === 'about:blank') {
            return;
          }
          if (args.navigationType !== 'other' && args.url !== this.capacitorUrl) {
            this.emit('loadredirect', {
              oldUrl: this.capacitorUrl,
              newUrl: args.url
            } as BrowserRedirectEvent);
            this.capacitorUrl = e.url;
          }
        });
        this.ref.instance.webview.nativeElement.loadUrl(url);
      });
    } else {
      const webview = window.document.createElement('webview');

      (webview as any).addContentScripts([
        {
          name: 'no_images',
          matches: ['*'],
          all_frames: true,
          css: {
            code: `
            img: {
              display: none!important;
            }
          `
          },
          run_at: 'document_start'
        }
      ]);

      const urlInput = window.document.createElement('input');
      // Fired when the guest window fires a load event, i.e., when a new document is loaded.
      // This does not include page navigation within the current document or asynchronous resource loads.
      webview.addEventListener('loadstart', (e: any) => {
        if (e.isTopLevel) {
          this.emit('loadstart', {
            url: e.url
          });
          urlInput.value = e.url;
        }
      });

      webview.addEventListener('loadredirect', (e: any) => {
        if (e.isTopLevel) {
          this.emit('loadredirect', {
            oldUrl: e.oldUrl,
            newUrl: e.newUrl
          } as BrowserRedirectEvent);
        }
      });

      webview.addEventListener('contentload', (e: any) => {
        this.emit('contentload', {
          url: e.url
        } as BrowserLoadEvent);
      });

      webview.addEventListener('loadabort', (event) => this.emit('loaderror', null));
      webview.addEventListener('terminate', (event) => this.emit('exit', null));

      const container = window.document.createElement('div');
      this.ref = { webview, container };
      container.className = 'webview_container';
      const nav = window.document.createElement('div');
      nav.className = 'webview_nav';
      const btnBack = window.document.createElement('button');
      btnBack.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>';
      btnBack.onclick = () => {
        (webview as any).back();
      };
      nav.appendChild(btnBack);
      urlInput.onchange = () => {
        this.url = urlInput.value;
      };
      nav.appendChild(urlInput);
      const btnReload = window.document.createElement('button');
      btnReload.innerHTML = '<i class="material-icons">refresh</i>';
      btnReload.onclick = () => (webview as any).reload();
      nav.appendChild(btnReload);
      const btnExit = window.document.createElement('button');
      btnExit.innerHTML = '<i class="material-icons">close</i>';
      btnExit.onclick = () => this.close();
      nav.appendChild(btnExit);
      container.appendChild(nav);
      container.appendChild(webview);
      window.document.body.appendChild(container);
      setTimeout(() => {
        (webview as any).setUserAgentOverride(navigator.userAgent);
        this.url = url;
      }, 50);
    }
  }

  public userAgent: string = null;

  get url(): string {
    if (Browser.nativeComponent) {
      return this.ref ? this.ref.instance.webview.nativeElement.src : this.capacitorUrl;
    } else {
      return this.ref.webview.src;
    }
  }

  set url(url: string) {
    if (Browser.nativeComponent) {
      this.capacitorUrl = url;
      this.loadingPromis((e) => {
        this.ref.instance.webview.nativeElement.src = url;
      });
    } else {
      this.ref.webview.src = url;
    }
  }

  public static registerNativeWebview(webview: any) {
    Browser.nativeComponent = webview;
  }

  public on(e: string, handler: CallableFunction): void {
    if (!this.handlers[e]) {
      this.handlers[e] = [];
    }
    this.handlers[e].push(handler);
  }

  public async waitForLoad(): Promise<BrowserLoadEvent> {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        resolve(e);
        this.off('contentload', handler);
      };
      this.on('contentload', handler);
    });
  }

  public async waitForRedirect(
    testCallback?: BrowserRedirectTestCallback,
    timeout?: number
  ): Promise<BrowserRedirectEvent> {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (testCallback && !testCallback(e)) {
          return;
        }
        resolve(e);
        this.off('loadredirect', handler);
      };
      setTimeout(() => {
        this.off('loadredirect', handler);
        resolve(null);
      }, timeout || 10000);
      this.on('loadredirect', handler);
    });
  }

  public off(event: string, handler: CallableFunction): void {
    if (!this.handlers[event] || this.handlers[event].length === 0) {
      return;
    }
    const index = this.handlers[event].findIndex((e) => e === handler);
    if (index !== -1) {
      this.handlers[event].splice(index, 1);
    }
  }

  public async waitForEvent(
    eventName: 'exit' | 'loadredirect' | 'contentload' | 'loaderror' | 'loadabort' | 'loadstart'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const handler = (e: any) => {
        this.off(eventName, handler);
        resolve(e);
      };
      this.on(eventName, handler);
    });
  }

  public show() {
    if (Browser.nativeComponent) {
      this.loadingPromis.then((e) => {
        this.ref.instance.show();
      });
    } else {
      this.ref.container.style.display = 'inline';
    }
  }

  public hide() {
    if (Browser.nativeComponent) {
      this.loadingPromis.then((e) => {
        this.ref.instance.hide();
      });
    } else {
      this.ref.container.style.display = 'none';
    }
  }

  public close() {
    if (Browser.nativeComponent) {
      if (this.ref) {
        this.emit('exit', null);
        this.ref.destroy();
        this.ref = null;
      }
    } else {
      if (this.ref) {
        window.document.body.removeChild(this.ref.container);
        this.ref.webview.terminate();
        this.ref = null;
        this.emit('exit', null);
      }
    }
    this.handlers = [];
  }

  public insertCss(css: string): Promise<any> {
    if (Browser.nativeComponent) {
      return this.executeScript(`var s = document.createElement("style");
      s.innerHTML = "${css.replace(/"/gim, '\\"')}";
      document.getElementsByTagName("head")[0].appendChild(s);`);
    } else {
      return new Promise((resolve, reject) => {
        this.ref.webview.insertCSS({ code: css }, () => {
          resolve(true);
        });
      });
    }
  }

  public executeScript(input: any): Promise<any> {
    let obj = null;
    if (typeof input === 'function') {
      obj = { code: '(' + input.toString() + ')()', mainWorld: true };
    } else if (typeof input === 'string') {
      obj = { code: input, mainWorld: true };
    } else {
      obj = input;
    }
    if (Browser.nativeComponent) {
      return this.ref.instance.webview.nativeElement.executeJavaScript(obj.code);
    } else {
      return new Promise((resolve, reject) => {
        this.ref.webview.executeScript(obj, (res) => {
          resolve(res);
        });
      });
    }
  }

  public async getHtml(): Promise<string> {
    return await this.executeScript(`document.documentElement.outerHTML`);
  }

  public async getCookies(url?: string): Promise<BrowserCookie[]> {
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll(
        {
          url: url || this.url,
          storeId: this.ref.instance.webview.getCookieStoreId()
        },
        (res) => {
          resolve(res);
        }
      );
    });
  }

  public async removeCookie(name: string, url?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.cookies.remove(
        {
          url: url || this.url,
          name,
          storeId: this.ref.instance.webview.getCookieStoreId()
        },
        (res) => {
          resolve(res);
        }
      );
    });
  }

  public async setCookie(cookie: BrowserCookieSet): Promise<BrowserCookie> {
    return new Promise((resolve, reject) => {
      chrome.cookies.set({ ...cookie, storeId: this.ref.instance.webview.getCookieStoreId() }, (res) => {
        resolve(res);
      });
    });
  }

  private emit(e: string, value: any) {
    if (this.handlers[e]) {
      for (const handler of this.handlers[e]) {
        handler.call(this, value);
      }
    }
  }
}
