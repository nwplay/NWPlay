import * as ext from './index';
import { Extractor } from '../nwp-media';

class ExtractorService {
  public readonly extractors: Extractor[] = [];

  constructor() {
    for (const e of Object.values(ext)) {
      this.addExtractor(new e());
    }
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
  }
}

export const extractorService = new ExtractorService();
