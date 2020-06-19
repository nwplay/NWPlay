// TODO: Add Real Storage using IndexDb and fs
export class Storage {
  public static readonly default = new Storage();

  public async write(path: string, data: ArrayBuffer) {
    localStorage['storage_' + path] = new Uint16Array(data);
  }

  public async read(path: string): Promise<ArrayBuffer> {
    return new Uint16Array(localStorage['storage_' + path].split(',')).buffer;
  }

  public async remove(path: string): Promise<void> {
    localStorage.removeItem('storage_' + path);
  }

  public async list(path: string): Promise<string[]> {
    return Object.keys(localStorage)
      .filter(e => e.indexOf(`storage_${path}`) === 0)
      .map(e => e.replace('storage_', ''));
  }

}
