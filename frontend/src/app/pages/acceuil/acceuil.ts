import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { DetailProjectService } from '../../service/DetailProjectService';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SpinnerService } from '../../service/SpinnerService';

@Component({
  selector: 'app-acceuil',
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinnerModule
  ],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css'
})
export class Acceuil {
  data: any = null;
  @ViewChild('myCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('conform') conformite!: ElementRef<HTMLCanvasElement>;
  @ViewChild('projetByMonth') indicatifMonth!: ElementRef<HTMLCanvasElement>;

  spinnerService = inject(SpinnerService);
  detailService = inject(DetailProjectService);
  nombreProjetActif = signal(0);
  nombreProjetParametrer = signal(0);
  nombreNonConforme = signal(0);
  anneExcercice = signal<any[]>([]);
  // projetParametrer = signal(0);

  moisActuel = signal((new Date().getMonth() + 1));
  anneeActuel = signal(new Date().getFullYear().toString());

  moisExistant = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

  chartDepartage: any;
  selectedOption: 'projets' | 'total' = 'projets';
  chiffres = {
    projets: signal([4, 5, 3]),  // BQC, Interne, Externe
    total: signal([10, 15, 8])   // BQC, Interne, Externe
  };
  labels = ['BCQ', 'Interne', 'Externe'];
  // loading = false
  projetACtifParLigne = signal<any[]>([]);
  projetActifAnnuel = signal<any[]>([]);
  chartProjetAnnuel: Chart | null = null;


  constructor() {
    effect(() => {
      const values = this.projetActifAnnuel().map(i => parseInt(i.nb_plans) || 0);
      if (this.chartProjetAnnuel) {
        this.chartProjetAnnuel.data.datasets[0].data = values;
        console.log(this.chartProjetAnnuel.data.datasets[0]);
        this.chartProjetAnnuel.update();
      }
    });
  }


  initPartage(option: 'projet' | 'total' = 'projet') {
    const ctx = this.canvasRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.chartDepartage = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'Valeurs',
            data: this.chiffres.projets(),
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

  changeMonth(event: any) {
    this.moisActuel.set(event.target.value);
    this.initDashboarad();
  }

  changeYear(event: any) {
    this.anneeActuel.set(event.target.value);
    this.updateChartAnnuel();
    this.initDashboarad();
  }

  initConforme() {
    this.nombreNonConforme.set(this.data.non_conforme);
    const ctx = this.conformite?.nativeElement?.getContext('2d');
    let ligne = [{ id_ligne: '069', non_conformite: 10 }, { id_ligne: '070', non_conformite: 5 }, { id_ligne: '071', non_conformite: 15 }, { id_ligne: '072', non_conformite: 25 }, { id_ligne: '073', non_conformite: 35 }, { id_ligne: '074', non_conformite: 45 }, { id_ligne: '075', non_conformite: 55 }, { id_ligne: '076', non_conformite: 65 }, { id_ligne: '077', non_conformite: 75 }, { id_ligne: '078', non_conformite: 85 }, { id_ligne: '079', non_conformite: 95 }];
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ligne.map(l => l.id_ligne),
          datasets: [{
            label: 'Non conformite',
            data: ligne.map(l => l.non_conformite),
            backgroundColor: ligne.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`),
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
    this.chartDepartage.data.datasets[0].data = (this.chiffres[this.selectedOption])();
    this.chartDepartage.update();
  }

  initProjetMonth() {

    const ctx = this.indicatifMonth?.nativeElement?.getContext('2d');
    if (ctx) {
      this.chartProjetAnnuel = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Nombre de projet par mois',
            data: [] as number[],
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
                text: 'Nombre de projet par mois'       // titre de l’axe Y
              },
              ticks: {
                stepSize: 10,           // incréments des graduations
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
  initActifLigne() {
    let anne = this.anneeActuel().toString();
    let mois = this.moisActuel().toString();
    this.detailService.getProjetActifParLigne(mois, anne).then((res: any) => {
      console.log('Projets actifs par ligne :', res);
      this.projetACtifParLigne.set(res);
    })
  }

  initDashboarad() {
    const anne = this.anneeActuel().toString();
    const mois = this.moisActuel().toString();

    this.spinnerService.show(); // affiche le spinner

    Promise.all([
      this.detailService.getProjetActifMonth(mois, anne),
      this.detailService.getProjetParametrer(),
      this.detailService.getRepartitionTypeOperation()
    ])
      .then(([projetsActif, projetsParametrer, repartition]:[any,any,any]) => {
        this.nombreProjetActif.set(projetsActif.count);
        this.nombreProjetParametrer.set(projetsParametrer.length);
        this.chiffres.projets.set([parseInt(repartition.bcq), parseInt(repartition.interne), parseInt(repartition.externe)]);
        this.chiffres.total.set([parseInt(repartition.bcq), parseInt(repartition.interne), parseInt(repartition.externe)]);
        this.updateChart();

        this.initActifLigne();
      })
      .catch(err => {
        console.error('Erreur lors de la récupération des données du dashboard :', err);
      })
      .finally(() => {
        this.spinnerService.hide(); // masque le spinner quand tout est fini
      });
  }


  // initDashboarad() {
  //   let anne = this.anneeActuel().toString();
  //   let mois = this.moisActuel().toString();
  //   this.spinnerService.show();
  //   this.detailService.getProjetActifMonth(mois, anne).then((res: any) => {
  //     this.nombreProjetActif.set(res.count)
  //     this.spinnerService.hide();
  //   }).catch(err => {
  //     console.error('Erreur lors de la récupération des projets actifs :', err);
  //     this.spinnerService.hide();
  //   });

  //   this.detailService.getProjetParametrer().then((res: any) => {
  //     this.nombreProjetParametrer.set(res.length)
  //   }).catch(err => {
  //     console.error('Erreur lors de la récupération des projets paramétrés :', err);
  //   })

  //   this.detailService.getRepartitionTypeOperation().then((res: any) => {
  //     this.chiffres.projets.set([parseInt(res.bcq), parseInt(res.interne), parseInt(res.externe)]);
  //     this.chiffres.total.set([parseInt(res.bcq), parseInt(res.interne), parseInt(res.externe)]);
  //     console.log('Répartition des types d\'opérations :', this.chiffres.projets());
  //     this.updateChart();
  //   });

  //   this.initActifLigne();


  //   // this.detailService.getProjetActifParametrer(anne, mois).then(res => {

  //   // })
  // }

  updateChartAnnuel() {
    let projetAnnuel = this.detailService.getProjetActifAnnuel(this.anneeActuel()).then((res: any) => {
      console.log('Projets actifs annuel :', res);
      this.projetActifAnnuel.set(res);
      console.log(this.projetActifAnnuel().map((item: any) => { console.log('item', item); return parseInt(item.nb_plans) }))
    }).catch(err => {
      console.error('Erreur lors de la récupération des projets actifs annuel :', err);
    })
  }

  initAnneExcercice() {
    this.detailService.getAnneExcercice().then((res: any) => {
      console.log('Années d\'exercice :', res);
      this.anneExcercice.set(res);
    }).catch(err => {
      console.error('Erreur lors de la récupération des années d\'exercice :', err);
    });
  }

  ngAfterViewInit() {
    this.initPartage();
    this.initProjetMonth();
    this.initConforme();
    this.initDashboarad();
    this.initAnneExcercice();
  }

  ngOnInit() {
    this.data = {
      projet_actif: 250,
      projet_parametrer: 30,
      non_conforme: 11
    }
    this.updateChartAnnuel();
  }
}
