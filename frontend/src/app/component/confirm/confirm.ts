import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-confirm',
  imports: [
    MatDialogContent, 
    MatDialogModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css'
})
export class Confirm {

  constructor(
      public dialogRef: MatDialogRef<Confirm>,
      @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) { }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
