import pkg from '../../../../package.json';

const env = {
  isMobile: false,
  isDesktop: false,
  isTv: false,
  platform: null,
  engine: null,
  pkg: pkg as any,
  platformType: null,
  accepted: true,
  footer: `${(pkg as any).name}(${(pkg as any).version})`,
  darkmode: true
};

const isNwjs = true;

function setPlatform(platform: string) {
  switch (platform) {
    case 'MacIntel':
      env.platform = 'macos';
      env.isDesktop = true;
      env.engine = isNwjs ? 'nwjs' : 'chrome';
      env.platformType = 'desktop';
      document.body.className = env.platform;
      break;
    case 'Win32':
      env.platform = 'windows';
      env.isDesktop = true;
      env.engine = isNwjs ? 'nwjs' : 'chrome';
      env.platformType = 'desktop';
      document.body.className = env.platform;
      break;
  }
}

setPlatform(navigator.platform);

export const environment = env;
