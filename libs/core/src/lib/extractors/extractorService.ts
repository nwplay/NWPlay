import { Extractor } from '../nwp-media';

class ExtractorService {
  public readonly extractors: Extractor[] = [];
  public favorites: Extractor[] = [];

  constructor() {
    this.restoreSort();
  }


  public restoreSort() {
    try {
      const ids = JSON.parse(window.localStorage['extractorFavorites']);
      console.log(ids);
      this.favorites = ids
        .map(id => this.extractors.find(e => e.id === id))
        .filter(e => !!e);
      if (Array.isArray(ids)) {
        this.extractors.splice(0, this.extractors.length, ...[
          ...this.favorites,
          ...this.extractors.filter(e => !this.favorites.includes(e))
        ]);
      }
    } catch (e) {
      console.warn(e);
    }

    console.log(this.extractors.slice(0, 10).map(e => e.name));
  }

  public saveFavorites() {
    localStorage['extractorFavorites'] = JSON.stringify(this.favorites.map(e => e.id));
  }

  public checkIfIsFavorite(extractor: Extractor) {
    return this.favorites.includes(extractor);
  }

  public addFavorite(extractor: Extractor) {
    if (this.favorites.find(f => f.id === extractor.id)) {
      return;
    }
    this.favorites.push(extractor);
    this.saveFavorites();
    this.restoreSort();
  }

  public removeFavorite(extractor: Extractor) {
    const index = this.favorites.indexOf(extractor);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      this.saveFavorites();
      this.restoreSort();
    }
  }

  public test(url: string): boolean {
    return this.extractors.find((r) => r.test(url)) !== null;
  }

  public async testAsync(url: string): Promise<boolean> {
    for (const e of this.extractors) {
      const r = await e.test(url);
      if (r) return true;
    }
    return false;
  }

  public async extract(url: string) {
    const extractor = this.extractors.find((r) => r.test(url));
    if (!extractor) {
      throw new Error('No matching extractor found.');
    }
    return await extractor.extract(url);
  }

  public addExtractor<T extends Extractor>(extractor: T, batch = false) {
    this.extractors.push(extractor);
    if (batch) {
      return;
    }
    this.restoreSort();
  }
}

export const extractorService = new ExtractorService();
