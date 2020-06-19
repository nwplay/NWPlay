export interface INwCookie {
  domain: string;
  expirationDate: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  session: boolean;
  storeId: string;
  value: string;
}

export interface INwCookieDetails {
  url: string;
  expirationDate: number;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  storeId: string;
  value: string;
}

export const Cookies = {
  getAll: async () => {
    return await new Promise<INwCookie[]>((resolve) => {
      (window as any).chrome.cookies.getAll({}, (res) => {
        resolve(res);
      });
    });
  },
  set: async (details: INwCookieDetails) => {
    return await new Promise<INwCookie>((resolve) => {
      (window as any).chrome.cookies.set(details, (res) => {
        resolve(res);
      });
    });
  },
  setFromResponse: async (resp: Response) => {
    resp.headers.forEach((value, name) => {
      if (name.toLowerCase() === 'set-cookie') {
        const cook = {};
        value.split(';').map(e => e.trim()).forEach((c) => {
          const comps = c.split('=').map(e => e.trim());
          cook[comps[0]] = comps[1];
        });
      }
    });
  }
};
