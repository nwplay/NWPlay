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

  public addExtractor<T extends Extractor>(extractor: T) {
    this.extractors.push(extractor);
    this.updateFavorites();
  }
}

export const extractorService = new ExtractorService();
