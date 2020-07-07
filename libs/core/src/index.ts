/*
 * Public API Surface of nwplay-core
 */
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
export const version = '0.0.1-alpha.6';
export const cheerio = nw.require('cheerio');


