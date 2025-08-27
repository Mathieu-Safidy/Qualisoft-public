
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
  PipeTransform,
  QueryList,
  ViewChildren,
  input,
  output
} from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgbHighlight } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent, FontAwesomeModule } from "@fortawesome/angular-fontawesome";


// Type générique pour la liste
export type ColumnDef<T> = {
  key: keyof T;
  label: string;
  isSortable?: boolean;
  isSearchable?: boolean;
  format?: (value: any, row: T) => string;
};

export type SortColumn<T> = keyof T | '';
export type SortDirection = 'asc' | 'desc' | '';

const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent<T = any> {
  column: SortColumn<T>;
  direction: SortDirection;
}


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
  readonly sortable = input<string>('');
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable(), direction: this.direction });
  }
}

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NgbdSortableHeader, CommonModule, FontAwesomeModule],
  providers: [DecimalPipe],
  templateUrl: './liste.html',
  styleUrls: ['./liste.css'],
})
export class Liste<T extends Record<string, any> = any> {
  
  // itemClicked = output<any>();
  // onItemClick(item: any): void {
  //   this.itemClicked.emit(item);
  // }
  nameAction = input<string>('Action');
  readonly demandeOuvertureModal = output<any>();

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredSortedData.length / this.pageSize);
    const maxPages = 10;
    let start = Math.max(1, this.page - Math.floor(maxPages / 2));
    let end = start + maxPages - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxPages + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  ngOnChanges(changes: any) {
    // console.log('ngOnChanges called', changes);
    this.originalData = this.data();
    // console.log('originalData set', this.originalData);
    this.filter.valueChanges.pipe(startWith('')).subscribe((text) => {
      // console.log('filter valueChanges', text);
      const filtered = this.sortData(this.search(text));
      this.filteredSortedData = filtered;
      this.page = 1;
      this.updatePagedData();
      // console.log('filteredSortedData after filter', this.filteredSortedData);
    });
    // Initialisation
    const filtered = this.sortData(this.search(this.filter.value));
    this.filteredSortedData = filtered;
    this.updatePagedData();
    // console.log('filteredSortedData after initialisation', this.filteredSortedData);
  }
  keyToString(key: keyof T): string {
    return String(key);
  }
  readonly data = input<T[]>([]);
  readonly columns = input<ColumnDef<T>[]>([]);
  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() pageSize = 10;
  readonly onRowClicked = input<(row: any) => void>();


  filter = new FormControl('', { nonNullable: true });
  pagedData$ = new Observable<T[]>();
  filteredSortedData: T[] = [];
  page = 1;
  Math = Math;
  public currentSort: SortEvent<T> = { column: '', direction: '' };
  private originalData: T[] = [];

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  constructor(private pipe: DecimalPipe) { }

  // ngOnInit() {
  //   this.originalData = this.data;
  //   this.filter.valueChanges.pipe(startWith('')).subscribe((text) => {
  //     const filtered = this.sortData(this.search(text));
  //     this.filteredSortedData = filtered;
  //     this.page = 1;
  //     this.updatePagedData();
  //   });
  //   // Initialisation
  //   const filtered = this.sortData(this.search(this.filter.value));
  //   this.filteredSortedData = filtered;
  //   this.updatePagedData();
  // }

  onSort({ column, direction }: SortEvent<T>) {
    console.log('onSort called', column, direction);
    this.headers.forEach((header) => {
      if (header.sortable() !== column) header.direction = '';
    });
    this.currentSort = { column, direction };
    const filtered = this.search(this.filter.value);
    const sorted = this.sortData(filtered);
    this.filteredSortedData = sorted;
    this.page = 1;
    this.updatePagedData();
    this.pagedData$ = new Observable((observer) => {
      observer.next(this.getPagedData(sorted));
      observer.complete();
    });
  }

  private search(text: string): T[] {
    const term = text?.toLowerCase() || '';
    return this.originalData.filter((row) =>
      this.columns().some((col) => {
        if (col.isSearchable === false) return false;
        const value = row[col.key];
        if (typeof value === 'string') return value.toLowerCase().includes(term);
        if (typeof value === 'number') return this.pipe.transform(value)?.includes(term);
        if (value && (value as any) instanceof Date) return (value as Date).toLocaleDateString().toLowerCase().includes(term);
        return false;
      })
    );
  }

  private sortData(data: T[]): T[] {
    const { column, direction } = this.currentSort;
    if (!column || !direction) return data;
    return [...data].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }

  private getPagedData(data: T[]): T[] {
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > Math.ceil(this.filteredSortedData.length / this.pageSize)) return;
    this.page = page;
    this.pagedData$ = new Observable((observer) => {
      observer.next(this.getPagedData(this.filteredSortedData));
      observer.complete();
    });
  }

  updatePagedData() {
    const paged = this.getPagedData(this.filteredSortedData);
    this.pagedData$ = new Observable((obs) => {
      obs.next(paged);
      obs.complete();
    });
  }
}
