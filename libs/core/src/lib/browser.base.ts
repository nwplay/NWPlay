import { Subject, Observable } from 'rxjs';

declare var cordova;

export abstract class BaseBrowser {
  public abstract get url(): string;

  public abstract loadstart: Observable<any>;
  public abstract loadstop: Observable<any>;
  public abstract loaderror: Observable<any>;
  public abstract exit: Observable<any>;
  public abstract beforeload: Observable<any>;

  public abstract load(url: string): Promise<void>;

  public abstract getHtml(): Promise<string>;

  public abstract executeScript(script: string | CallableFunction): Promise<any>;

  public abstract insertCss(css: string): Promise<void>;

  public abstract show();

  public abstract hide();

  public abstract close();
}


class LolBrowser extends BaseBrowser {
  beforeload = new Subject<any>();
  exit = new Subject<any>();
  loaderror = new Subject<any>();
  loadstart = new Subject<any>();
  loadstop = new Subject<any>();


  private browserRef: any;

  constructor() {
    super();
    this.browserRef = cordova.InAppBrowser.open('', '_blank', {});
  }

  close() {
    this.browserRef.close();
  }

  executeScript(script: string | CallableFunction): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.browserRef.executeScript({
        code: script.toString()
      }, (res) => {
        resolve(res[0]);
      });
    });

  }

  getHtml(): Promise<string> {
    return Promise.resolve('');
  }

  hide() {
    this.browserRef.hide();
  }

  insertCss(css: string): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      this.browserRef.insertCSS({
        code: css.toString()
      }, (res) => {
        resolve();
      });
    });
  }

  load(url: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  show() {
    this.browserRef.show();
  }

  get url(): string {
    return '';
  }
}
