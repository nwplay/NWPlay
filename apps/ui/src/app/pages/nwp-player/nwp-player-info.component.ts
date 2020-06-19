import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'nwp-player-info',
  template: `
    <h1 mat-dialog-title></h1>
    <div mat-dialog-content></div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Close</button>
    </div>
  `,
  styleUrls: []
})
export class NwpPlayerInfoComponent {
  public player: any;

  constructor(public dialogRef: MatDialogRef<NwpPlayerInfoComponent>) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
