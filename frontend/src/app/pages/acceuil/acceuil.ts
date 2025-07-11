import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';


@Component({
  selector: 'app-acceuil',
  imports: [],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css'
})
export class Acceuil {
  @ViewChild('myCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{
            label: 'Valeurs',
            data: [10, 20, 30],
            backgroundColor: '#7ee2a7',
          }]
        },
        options: {
          responsive: true
        }
      });
    } else {
      console.error('❌ Impossible de récupérer le contexte du canvas.');
    }
  }
}
