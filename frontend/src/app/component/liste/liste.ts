import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  PipeTransform,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent, FontAwesomeModule } from "@fortawesome/angular-fontawesome";

interface Country {
  name: string;
  flag: string;
  area: number;
  population: number;
}

export type SortColumn = keyof Country | '';
export type SortDirection = 'asc' | 'desc' | '';

const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

const COUNTRIES: Country[] = [
  { name: 'Russia', flag: 'f/f3/Flag_of_Russia.svg', area: 17075200, population: 146989754 },
  { name: 'Canada', flag: 'c/cf/Flag_of_Canada.svg', area: 9976140, population: 36624199 },
  { name: 'United States', flag: 'a/a4/Flag_of_the_United_States.svg', area: 9629091, population: 324459463 },
  { name: 'China', flag: 'f/fa/Flag_of_the_People%27s_Republic_of_China.svg', area: 9596960, population: 1409517397 },
];

// Directive tri
@Directive({
  selector: 'th[sortable]',
  standalone: true,
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, ReactiveFormsModule, NgbHighlight, NgbdSortableHeader, CommonModule, FaIconComponent , FontAwesomeModule],
  providers: [DecimalPipe],
  templateUrl: './liste.html',
  styleUrls: ['./liste.css'],
})
export class Liste {
  private originalCountries = COUNTRIES;
  private currentSort: SortEvent = { column: '', direction: '' };

  filter = new FormControl('', { nonNullable: true });
  countries$ = new Observable<Country[]>();

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  // Pagination
  page = 1;
  pageSize = 10; // éléments par page
  filteredSortedCountries: Country[] = [];
  Math = Math

  constructor(private pipe: DecimalPipe) {}

  ngOnInit() {
    this.filter.valueChanges
      .pipe(startWith(''))
      .subscribe((text) => {
        const filtered = this.sortData(this.search(text));
        this.filteredSortedCountries = filtered;
        this.page = 1; // toujours repartir à la première page
        this.updatePagedData();
      });
  }


  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) header.direction = '';
    });

    this.currentSort = { column, direction };

    // recherche + tri
    const filtered = this.search(this.filter.value);
    const sorted = this.sortData(filtered);
    this.filteredSortedCountries = sorted;
    this.page = 1; // reset page
    this.updatePagedData();

    this.countries$ = new Observable((observer) => {
      observer.next(this.getPagedData(sorted));
      observer.complete();
    });
  }

  private search(text: string): Country[] {
    const term = text.toLowerCase();
    return this.originalCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(term) ||
        this.pipe.transform(country.area)?.includes(term) ||
        this.pipe.transform(country.population)?.includes(term),
    );
  }

  private sortData(countries: Country[]): Country[] {
    const { column, direction } = this.currentSort;
    if (!column || !direction) return countries;
    return [...countries].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }

  private getPagedData(data: Country[]): Country[] {
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > Math.ceil(this.filteredSortedCountries.length / this.pageSize)) return;
    this.page = page;
    this.countries$ = new Observable((observer) => {
      observer.next(this.getPagedData(this.filteredSortedCountries));
      observer.complete();
    });
  }
  updatePagedData() {
    const paged = this.getPagedData(this.filteredSortedCountries);
    this.countries$ = new Observable((obs) => {
      obs.next(paged);
      obs.complete();
    });
  }


}
