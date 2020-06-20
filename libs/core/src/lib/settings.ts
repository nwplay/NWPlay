import { LANGUAGE } from './languages';
import { VIDEO_QUALITY } from './nwp-media';
import { deserialize, serialize } from 'class-transformer';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export { LANGUAGE, isoLangs } from './languages';

// @dynamic
export class NWPlaySettings {

  public get preferredUiLanguage() {
    return this.preferredUiLanguages[0] || LANGUAGE.en;
  }

  public static default: NWPlaySettings;
  public name = 'default_settings';

  public preferredAudioLanguages: LANGUAGE[] = [LANGUAGE.en];
  public preferredUiLanguages: LANGUAGE[] = [LANGUAGE.en];
  public preferredSubtitleLanguages: LANGUAGE[] = [];
  public preferredVideoQuality: VIDEO_QUALITY = VIDEO_QUALITY.HD;
  public autoplayTrailer = true;
  public showAdultContent = false;
  public autoplay = true;
  public volume = 1;
  public cropTrailers = true;

  public save() {
    settingsChange.next(this);
  }
}

export const settingsChange = new Subject<NWPlaySettings>();

const validator = {
  set: (obj: NWPlaySettings, prop: string, value: any) => {
    obj[prop] = value;
    settingsChange.next(obj);
    return true;
  }
};
settingsChange.pipe(debounceTime(5000)).subscribe(e => {
  window.localStorage[NWPlaySettings.default.name] = serialize(e);
});

let settings: NWPlaySettings;
if (localStorage['default_settings']) {
  try {
    settings = deserialize(NWPlaySettings, localStorage['default_settings']);
  } catch (e) {
  }
}


NWPlaySettings.default = new Proxy<NWPlaySettings>(settings || new NWPlaySettings(), validator);
