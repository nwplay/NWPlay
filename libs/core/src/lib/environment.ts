export type NwplayEngine = 'nwjs' | 'browser' | 'capacitor';
export type NwplayPlatform = 'macos' | 'ios' | 'android' | 'linux' | 'windows';

export class Environment {
  public static readonly default = new Environment();
  public isMobile = false;
  public isDesktop = false;
  public isTv = false;
  public engine: NwplayEngine;
  public platform: NwplayPlatform;
  public version = '0.0.1';

  constructor() {
    const platform = navigator.platform;
    switch (platform) {
      case 'MacIntel':
        this.platform = 'macos';
        this.isDesktop = true;
        this.engine = 'nwjs';
        document.body.className = platform;
        break;
      case 'Win32':
        this.platform = 'windows';
        this.isDesktop = true;
        this.engine = 'nwjs';
        document.body.className = platform;
        break;
    }
  }
}
