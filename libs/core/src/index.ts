/*
 * Public API Surface of nwplay-core
 */
import { onPlatformReady} from './lib/platform.abstract';

declare var nw: any;
export * from './lib/nwp-media';
export * from './lib/browser';
export * from './lib/extractors';
export * from './lib/extractors/extractorService';
export * from './lib/settings';
export * from './lib/extension';
export * from './lib/player';
export * from './lib/watchlist';
export * from './lib/history';
export * from './lib/environment';
export * from './lib/cookies';
export * from './lib/storage';
export * from './lib/platform.abstract';
export * from './lib/plugin';
export const version = '0.0.1-alpha.6';
export let cheerio = null;

onPlatformReady((platform) => {
  cheerio = platform.cheerio;
})
