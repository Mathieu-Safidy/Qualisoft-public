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
    let ligne = [{id_ligne: '069', non_conformite:10}, {id_ligne: '070', non_conformite:5}, {id_ligne: '071', non_conformite:15}, {id_ligne: '072', non_conformite:25}, {id_ligne: '073', non_conformite:35}, {id_ligne: '074', non_conformite:45}, {id_ligne: '075', non_conformite:55}, {id_ligne: '076', non_conformite:65}, {id_ligne: '077', non_conformite:75}, {id_ligne: '078', non_conformite:85}, {id_ligne: '079', non_conformite:95}];
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ligne.map(l => l.id_ligne),
          datasets: [{
            label: 'Valeurs',
            data: ligne.map(l => l.non_conformite),
            backgroundColor: ligne.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)` ),
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
