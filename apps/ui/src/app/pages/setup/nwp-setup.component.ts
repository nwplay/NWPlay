import { Component } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'nwp-setup',
  templateUrl: './nwp-setup.component.html',
  styleUrls: ['./nwp-setup.component.scss']
})
export class NwpSetupComponent {
  constructor(private readonly appService: AppService) {
  }

  public installPlugin() {
    this.appService.installPlugin();
  }

}
