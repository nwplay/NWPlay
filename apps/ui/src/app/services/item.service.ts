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
  public hiddenItems: string[] = [];
  public openDialog: MatDialogRef<NwpItemComponent> = null;

  constructor(
    public router: Router,
    private zone: NgZone,
    public translate: TranslateService,
    public snackBar: MatSnackBar,
    public location: Location,
    public dialog: MatDialog
  ) {
  }

  public async hideItem(item: SearchResult) {
    this.hiddenItems.push(`${item.provider}:${item.id}`);
    const action = await this.translate.get('hide').toPromise();
    this.zone.run(() => {
      this.snackBar.open('OK', action, {
        duration: 5000
      });
    });
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
      //await dialogRef.componentInstance.loadItem(item.provider.id, item.id);
    } else {
      if (item instanceof TvShow) {
        await this.router.navigate(['/', item.provider.id, 'tv', item.id]);
      } else {
        await this.router.navigate(['/', item.provider.id, 'movie', item.id]);
      }
    }
  }
}
