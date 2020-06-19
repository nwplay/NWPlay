import { Component } from '@angular/core';
import { IMAGE_SIZE, MEDIA_TYPE, providers, SearchResult } from '@nwplay/core';

class NwpDownloadItem extends SearchResult {
  filePath: string;
  totalFileSize: string;
  resolver: string;
  type: MEDIA_TYPE.MOVIE | MEDIA_TYPE.TV_EPISODE;
}

@Component({
  selector: 'nwp-page-downloads',
  templateUrl: './nwp-downloads.component.html',
  styleUrls: ['./nwp-downloads.component.scss']
})
export class NwpDownloadsComponent {
  public downloads: NwpDownloadItem[] = [];

  constructor() {
    const test = new NwpDownloadItem(providers[0]);
    test.image = 'https://image.tmdb.org/t/p/w227_and_h127_bestv2/eibJdsPVOJ1s07n2x8nneGMKfDf.jpg';
    test.title = 'Test Downloads';
    test.size = IMAGE_SIZE.THUMB;
    this.downloads.push(test);
  }
}
