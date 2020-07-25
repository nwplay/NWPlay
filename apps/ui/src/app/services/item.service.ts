import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Movie, SearchResult, TvShow } from '@nwplay/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NwpItemComponent } from '../pages/nwp-item/nwp-item.component';

@Injectable()
export class ItemService {
  public openDialog: MatDialogRef<NwpItemComponent> = null;

  constructor(
    public router: Router,
    public translate: TranslateService,
    public location: Location,
    public dialog: MatDialog
  ) {
  }

  public async show(item: TvShow | Movie | SearchResult, showAsModal = false) {
    this.dialog.closeAll();
    if (false) {
      const dialogRef = (this.openDialog = this.dialog.open(NwpItemComponent, {
        maxWidth: 800,
        maxHeight: 600,
        closeOnNavigation: true,
        backdropClass: 'backdrop-blur'
      }));
      dialogRef.componentInstance.isPopover = true;
    } else {
      if (item instanceof TvShow) {
        await this.router.navigate(['/', item.provider.id, 'tv', item.id]);
      } else {
        await this.router.navigate(['/', item.provider.id, 'movie', item.id]);
      }
    }
  }
}
