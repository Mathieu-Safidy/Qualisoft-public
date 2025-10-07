import { Component, Inject, input, output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-alert-confirm',
  imports: [
    MatDialogContent, 
    MatDialogModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './alert-confirm.html',
  styleUrl: './alert-confirm.css'
})
export class AlertConfirm {
  // percentage = input<number | 0>();
  // confirmed = output<boolean | false>();
  constructor(
    public dialogRef: MatDialogRef<AlertConfirm>,
    @Inject(MAT_DIALOG_DATA) public data: { pourcentage: number }
  ) { }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
