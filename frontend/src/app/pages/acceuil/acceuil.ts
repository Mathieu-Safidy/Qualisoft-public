import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';


@Component({
  selector: 'app-acceuil',
  imports: [
    CommonModule,
    FormsModule 
  ],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css'
})
export class Acceuil {
  data: any = null;
  @ViewChild('myCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('conform') conformite!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projetByMonth') indicatifMonth!: ElementRef<HTMLCanvasElement>;
  chartDepartage: any;
  selectedOption: 'projets' | 'total' = 'projets';
  chiffres = {
    projets: [4, 5, 3],  // BQC, Interne, Externe
    total: [10, 15, 8]   // BQC, Interne, Externe
  };
  labels = ['BQC', 'Interne', 'Externe'];


  initPartage(option: 'projet' | 'total' = 'projet') {
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.chartDepartage = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'Valeurs',
            data: this.chiffres.projets,
            backgroundColor: ['#7ee2a7', '#f9c74f', '#f94144'],
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
  
  initConforme() {
    const ctx = this.conformite?.nativeElement?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Conforme (+90%) ', 'Non Conforme (-90%)'],
          datasets: [{
            label: 'Valeurs',
            data: [75, 25],
            backgroundColor: ['#7ee2a7', '#f94144'],
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




  updateChart() {
    this.chartDepartage.data.datasets[0].data = this.chiffres[this.selectedOption];
    this.chartDepartage.update();
  }

  initProjetMonth() {
    const ctx = this.indicatifMonth?.nativeElement?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Valeurs',
            data: [10, 20, 30, 25, 15, 35, 45, 40, 30, 20, 10, 5],
            borderColor: '#7ee2a7',
            backgroundColor: 'rgba(126, 226, 167, 0.3)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: {
              beginAtZero: true,      // commence à 0
              title: {
                display: true,
                text: 'Valeurs'       // titre de l’axe Y
              },
              ticks: {
                stepSize: 5            // incréments des graduations
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mois'
              }
            }
          }
        }
      });
    }

  }

  ngAfterViewInit() {
    this.initPartage();
    this.initProjetMonth();
    this.initConforme();
  }

  ngOnInit() {
    this.data = {
      projet_actif: 250,
      projet_parametrer: 30,

    }
  }
}
