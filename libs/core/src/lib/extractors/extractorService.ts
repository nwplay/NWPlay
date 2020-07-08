import { Extractor } from '../nwp-media';

class ExtractorService {
  public readonly extractors: Extractor[] = [];
  public readonly favorites = new Set<Extractor>();
  private readonly favoriteIds = new Set<string>();

  constructor() {
    try {
      this.favoriteIds = new Set(JSON.parse(localStorage['extractorFavorites']));
    } catch (e) {
    }
    this.updateFavorites();
  }

  private updateFavorites() {
    this.favorites.clear();
    Array.from(this.favoriteIds)
      .map(id => this.extractors.find(e => e.id === id))
      .forEach(e => this.favorites.add(e));
  }

  public saveSort() {
    window.localStorage['extractor_sort'] = JSON.stringify(this.extractors.map(e => e.id));
  }

  public restoreSort() {
    try {
      const ids = JSON.parse(window.localStorage['extractor_sort']);
      if (Array.isArray(ids)) {
        const newSort = this.extractors.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        this.extractors.splice(0, this.extractors.length, ...newSort);//this.extractors.push(...newSort);
      }
    } catch (e) {

    }
  }

  private saveFavorites() {
    localStorage['extractorFavorites'] = JSON.stringify(Array.from(this.favoriteIds));
  }

  public checkIfIsFavorite(extractor: Extractor) {
    return this.favorites.has(extractor);
  }

  public addFavorite(extractor: Extractor) {
    this.favorites.add(extractor);
    this.favoriteIds.add(extractor.id);
    this.saveFavorites();
  }

  public removeFavorite(extractor: Extractor) {
    this.favorites.delete(extractor);
    this.favoriteIds.delete(extractor.id);
    this.saveFavorites();
  }

  public test(url: string): boolean {
    return this.extractors.find((r) => r.test(url)) !== null;
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
    this.updateFavorites();
    this.restoreSort();
  }
}

export const extractorService = new ExtractorService();
