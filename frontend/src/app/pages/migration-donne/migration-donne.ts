import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { DetailProjectService } from '../../service/DetailProjectService';
import { Observable } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SpinnerService } from '../../service/SpinnerService';
@Component({
  selector: 'app-migration-donne',
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
  ],
  templateUrl: './migration-donne.html',
  styleUrl: './migration-donne.css'
})
export class MigrationDonne {
  operation !: string;
  detailService = inject(DetailProjectService);
  route = inject(ActivatedRoute);
  spinnerService = inject(SpinnerService);
  data !: any;
  colonne: { colonnes: string[], table_name: string }[] = [];
  canMigrate: string[] = [];
  previewData = signal<any[][]>([]); // signal pour stocker l'aperçu
  typeFichier = ['csv', 'xlsx'];
  fileType = signal<'csv' | 'xlsx'>('xlsx');
  fileName = signal<string>('');
  limite = 10;
  selected = signal<string[]>([]);
  allData = signal<any[][]>([]);
  watch = signal(false);
  progress = signal(0);
  load = signal(false);
  fichier = signal<File | null>(null);

  ngOnInit() {
    this.data = this.route.snapshot.data['data'];
    console.log('this.data', this.data);

    this.data.column.columnNames.forEach((element: any) => {
      this.initiateColonne(element);
    });
  }

  initiateColonne(element: any) {
    let colonnesString = element.colonnes;
    let colonnesArray = colonnesString.split(',').map((col: string) => col.trim());
    this.colonne.push({ colonnes: colonnesArray, table_name: element.table_name });
    this.canMigrate.push(element.table_name);
  }

  getColonnes(table: string) {
    let found = this.colonne.find(col => col.table_name === table);
    return found ? found.colonnes : [];
  }

  startingMigration(operation: string) {
    this.operation = operation;
    this.selected.set([]); // réinitialiser les sélections
    this.allData.set([]);
    // this.colonne = [];
    this.previewData.set([]);
    this.fichier.set(null);
    this.fileName.set('');
    this.progress.set(0);
    // this.load.set(false);
    // let table = this.data.column.columnNames.find((col: any) => col.table_name === operation);
  }


  toggleSelection(item: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selected.update(list => [...list, item]);
    } else {
      this.selected.update(list => list.filter(x => x !== item));
    }
    console.log('Sélections actuelles:', this.selected());
  }

  isChecked(item: string): boolean {
    // console.log('Vérification de:', item, 'colonne' ,this.previewData()[0] , 'selected',this.selected() ,'Résultat:', this.selected().includes(item) || (this.previewData()[0] ? (this.previewData()[0].map(row => row.trim())).includes(item) : false));
    let value = this.selected().includes(item) || (this.previewData()[0] ? this.previewData()[0].includes(item) : false);
    return value;
  }

  apercu() {
    this.watch.set(true);
  }

  fermerApercu() {
    this.watch.set(false);
  }

  importer() {
    this.load.set(true);
    if (this.selected().length === 0) {
      alert('Veuillez sélectionner au moins une colonne à importer.');
      return;
    }
    if (this.allData().length === 0) {
      alert('Aucune donnée à importer. Veuillez charger un fichier.');
      return;
    }
    let tablename = 'detail_projet.' + this.operation;
    // let jsondata = this.allData()
    // let data = this.allData();
    this.uploadFile(this.fichier());
    // this.detailService.importerData(tablename, this.selected(), { data })
    //   .then((response: any) => {
    //     console.log('Importation réussie:', response);
    //     alert('Importation réussie !');
    //   })
    //   .catch((error: any) => {
    //     console.error('Erreur lors de l\'importation:', error);
    //     alert('Erreur lors de l\'importation. Veuillez vérifier la console pour plus d\'informations.');
    //   });

  }

  uploadFile(file: File | null) {
    if (!file) return;
    this.load.set(true);
    const formData = new FormData();
    let tablename = 'detail_projet.' + this.operation;
    formData.append('file', file, file.name);
    formData.append('table', tablename);
    formData.append('columns', JSON.stringify(this.selected()));

    this.spinnerService.show();
    let obs = this.detailService.importerData(undefined, undefined, { formData })
    // if(obs instanceof Observable) {
    obs.subscribe(
      {
        next: (event) => {

          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.progress.set(Math.round(100 * event.loaded / event.total));
          } else if (event.type === HttpEventType.Response) {
            console.log('Importation réussie:', event.body);
            alert('Importation fichier réussie !');
            this.load.set(false);
            
            // this.progress.set(0);
          }
        },
        error: (err) => {
          console.error(err);
          this.spinnerService.hide();
        },
        complete: () => this.spinnerService.hide()
      }
    )

    // }
    //  else {
    //   obs.then((response: any) => {
    //     console.log('Importation réussie:', response);
    //     alert('Importation réussie !');
    //     this.load.set(false);
    //   }).catch((error: any) => {
    //     console.error('Erreur lors de l\'importation:', error);
    //     alert('Erreur lors de l\'importation. Veuillez vérifier la console pour plus d\'informations.');
    //     this.load.set(false);
    //   });
    // }
    // this.detailService.importerData(undefined, undefined, { formData })
    //   .then((response: any) => {
    //     console.log('Importation réussie:', response);
    //     alert('Importation réussie !');
    //   })
    //   .catch((error: any) => {
    //     console.error('Erreur lors de l\'importation:', error);
    //     alert('Erreur lors de l\'importation. Veuillez vérifier la console pour plus d\'informations.');
    //   });
  }

  async onFileChange(event: any) {
    const file = event.target.files[0];
    this.fichier.set(file);
    if (!file) return;
    console.log(`Selected file: ${file.name} of type ${this.fileType()}`);

    this.fileName.set(file.name);

    if (this.fileType() === 'csv') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        const parsed = Papa.parse(text, { skipEmptyLines: true });
        let rows = parsed.data as any[][];
        this.allData.set(rows.slice(1));
        console.log('Parsed CSV data:', this.allData);

        this.previewData.set(parsed.data.slice(0, this.limite) as any[][]);
      };
      reader.readAsText(file);

    } else if (this.fileType() === 'xlsx') {
      console.log('Processing Excel file...');

      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0]; // première feuille
      console.log('Worksheet name:', worksheet.name);

      const data: any[][] = [];

      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        let rowData: any[] = [];
        if (Array.isArray(row.values)) {
          rowData = row.values.slice(1); // row.values[0] est vide


        } else {
          rowData = [row.values];
        }
        rowData = rowData.map(cell => typeof cell === 'string' ? cell.trim() : cell);

        data.push(rowData);
      });
      if (data.length > 0) {
        this.selected.set([]); // réinitialiser les sélections
        data[0] = data[0].map(cell => typeof cell === 'string' ? cell.trim() : cell);
        let colonne = data[0].filter(cell => this.getColonnes(this.operation).includes(cell?.toString()));
        this.selected.set(colonne as string[]);
        console.log('Colonnes sélectionnées après filtrage:', this.selected());
        
      }

      const header = data[0]; // la première ligne = en-tête
      const rows = data.slice(1); // toutes les lignes sauf l'en-tête

      const result = rows.map(row => {
        const obj: any = {};
        header.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });

      // Mettre dans le signal ou observable
      this.allData.set(result);

      console.log('Parsed CSV data:', this.allData());
      console.log('Excel data preview:', data.slice(0, this.limite));
      this.previewData.set(data.slice(0, this.limite)); // limiter à 5 lignes
    }
  }




}
