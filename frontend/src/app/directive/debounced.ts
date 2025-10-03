import { ChangeDetectorRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import { FormGroup, NgControl } from '@angular/forms';
import { Subject, fromEvent, takeUntil, debounceTime, map, distinctUntilChanged, tap } from 'rxjs';
import { distance } from "fastest-levenshtein";
import { MatDialog } from '@angular/material/dialog';
import { ValidationErreur } from '../component/validation-erreur/validation-erreur';

@Directive({
  selector: '[appDebounced]'
})
export class Debounced {

  constructor() { }

  timeout = input<number>(700);
  identity = input<string | number>();
  debouncedValue = output<{ id: string | number; value: string; name: string, event?: Event }>();
  isAutoComplete = input<{ value: boolean, name?: string }>({ value: false, name: '' });
  statique = input<boolean>(false);
  formul = input<FormGroup>();
  verifier = input<any>(null);
  // foreign = input<{name?: string | null, value?: string | number | null}>({name: null, value: null});
  foreign = input<{ name?: string | null, value?: string | number | null }[]>([]);
  delete = input<boolean>(false);
  liste = input<any[]>([]);
  colonne = input<string>('');
  idColonne = input<string | number>('');
  reference = input<string | number>('');
  suggestion = input<boolean>(false);
  mapper = input<string>('libelle');
  valide = input<boolean>(false);
  valideChange = output<boolean>();
  annuler = output<{ form: FormGroup, controlName: string, ancienValue: any }>();
  open = false;

  private elementRef = inject(ElementRef);
  private dialog = inject(MatDialog);
  cdref: ChangeDetectorRef = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private ngControl = inject(NgControl);
  private initialValue: any;
  private lastValue: any;

  ngOnInit() {
    const element = this.elementRef.nativeElement;
    this.lastValue = this.ngControl.value;
    console.log('last value init', this.lastValue);
   
    console.log('condition ', !this.verifier() && this.statique(), 'verifier', this.verifier(), this.statique(), this.isAutoComplete() && this.isAutoComplete().value, 'valeur', this.isAutoComplete().name);
    if (!this.verifier() && this.statique()) {
      let value = this.formul()?.get(this.isAutoComplete().name ?? '')?.value;
      this.emitIfChanged({ element: element, value: value })
    } else if (this.verifier() && this.statique()) {
      this.emitIfChanged({ element: element });
    }

    if (!this.isAutoComplete() || !this.isAutoComplete().value) {

      fromEvent(element, 'change')
        .pipe(
          debounceTime(this.timeout()),
          takeUntil(this.destroy$))
        .subscribe((event) => this.emitIfChanged({ element: element, event: event as Event }));
    } else {
      if (this.formul()) {
        console.log('formulaire field ', this.formul(), this.formul()?.get(this.isAutoComplete().name ?? ''))
        this.formul()?.get(this.isAutoComplete().name ?? '')?.valueChanges
          .pipe(debounceTime(this.timeout()), takeUntil(this.destroy$))
          .subscribe(val => this.emitIfChanged({ element: element, typeEvent:'change',value: val })
          );
        fromEvent(element, 'blur')
          .pipe(takeUntil(this.destroy$))
          .subscribe((val) => this.emitIfChanged({ element: element, typeEvent: 'blur', event: val as Event }));
      }
    }

  }

  validation(value: any) {
    let control = this.ngControl.control;

    console.log('avant verification ', value, this.liste(), this.colonne(), this.idColonne());
    let verif = this.verifyValid(value);
    if (!verif) {
      control?.setErrors({ invalidValue: true });
      return false;
    } else {
      value = verif[this.idColonne() ? this.idColonne() : this.colonne()];
      console.log('value envoyer', value)
      if (control?.hasError('invalidValue')) {
        const errors = { ...control.errors };
        delete errors['invalidValue'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    return value;
  }

  // private findLike(value: string) {
  //   if (this.liste() && value && value.length > 0) {
  //     return this.liste().filter(item => (item.libelle ? item.libelle : '')?.toLowerCase().includes(value.toLowerCase()) || item[this.colonne()]?.toLowerCase().includes(value.toLowerCase()));
  //   }
  // }

  private findLike(value: string, mode: 'AND' | 'OR' = 'AND', maxDistance = 2) {
    if (this.liste() && value && value.length > 0) {
      // Découpe la recherche en mots
      const terms = value.toLowerCase().split(/\s+/).filter(t => t.length > 0);

      return this.liste().filter(item => {
        // const libelleWords = (item.libelle ?? '').toLowerCase().split(/\s+/);
        const colonneWords = (item[this.colonne()] ?? '').toLowerCase().split(/\s+/);

        // Vérifie si un terme match un des mots du libelle/colonne
        const matches = (term: string) => {
          // const allWords = [...libelleWords, ...colonneWords];
          const allWords = [...colonneWords];
          return allWords.some(word =>
            word.includes(term) || distance(word, term) <= maxDistance
          );
        };

        if (mode === 'AND') {
          return terms.every(matches); // tous les mots de recherche doivent matcher
        } else {
          return terms.some(matches); // au moins un mot suffit
        }
      });
    }
    return [];
  }

  private emitIfChanged(corps: { element: any, value?: any, event?: Event, typeEvent?: string }) {
    let verif = false;
    let permit = false;
    let persist = this.ngControl.value;
    if (this.liste().length) {
      if (corps.value == null || corps.value === undefined) {
        verif = this.validation(persist);
      } else {
        verif = this.validation(corps.value);
      }
      console.log('veirifier value', verif);

    }
    if (corps.value != null && corps.value !== undefined) {
      persist = corps.value;
    }

    

    let value = corps.element.type === 'checkbox' ? corps.element.checked : persist;
    let last = typeof this.lastValue === 'object' ? this.lastValue?.libelle : this.lastValue;
    console.log('element emit ', corps.element, 'value', value, 'last value', last, 'dif', this.lastValue, 'liste', this.liste(), 'persiste', persist, 'type', corps.element.type, 'verif', verif, 'corps', corps, 'veirifier', this.verifier());
    let isChanged = (((value !== last) && !!this.verifier()) || !this.verifier());
    console.log('test entrer', isChanged);

    if (isChanged) {

      if (!verif && this.liste().length) {

        if (this.suggestion() && value !== '' && corps.typeEvent && (corps.typeEvent === 'blur' || corps.typeEvent === 'change')) {
          console.log('open dialog , value', value);
          if (!this.open) {
          const dialogref = this.dialog.open(ValidationErreur, {
            data: {
              liste: this.findLike(value, 'OR', 2),
              form: this.formul(),
              reference: this.reference(),
              colonne: this.colonne(),
              map: this.mapper(),
              validation: this.valide(),
              value: value
            }
          });
          
          this.open = true;

          dialogref.afterClosed().subscribe(result => {
            console.log('dialog close', result, 'valide', this.valide());
            if (result.validation) {
              this.valideChange.emit(true);
              permit = true;
              this.cdref.detectChanges();
              console.log('permit validation closed', permit);
            }
            if (result.value == null) {
              this.annuler.emit({ form: this.formul()!, controlName: this.isAutoComplete().name ?? '', ancienValue: last });
              permit = false;
              this.cdref.detectChanges();
              console.log('permit value closed', permit);
              // value = result.value[this.idColonne() ? this.idColonne() : this.colonne()];
            }


            console.log('permit', permit);

            const id = this.identity() ?? -1;
            let name = corps.element.getAttribute('name') || '';
            if (this.foreign() && this.foreign().length > 0) {
              let [schema, columName] = name.split(':');

              let extra = Object.fromEntries(
                this.foreign()
                  .filter(f => f.name && f.value !== null && f.value !== undefined && f.value !== '')
                  .map(f => [String(f.name), f.value])
              );


              value = { [columName]: value, ...extra };
              console.log('value with foreign', value);
              
            }

            let val = { id, value, name, event: corps.event };
            this.open = false;
            if (permit) {
              console.log("emitIfChanged ", value, this.lastValue, val, this.foreign());
              this.debouncedValue.emit(val); // fonctionne avec Angular 20+
              this.lastValue = value;
              
              return;
            }

          })
          }
        }
        // return;
      } else  {
        if (verif && this.liste().length) {
          value = verif;
        }
        
        permit = true;
        this.valideChange.emit(true);
        console.log('permit', permit);

        const id = this.identity() ?? -1;
        let name = corps.element.getAttribute('name') || '';
        if (this.foreign() && this.foreign().length > 0) {
          let [schema, columName] = name.split(':');

          let extra = Object.fromEntries(
            this.foreign()
              .filter(f => f.name && f.value !== null && f.value !== undefined && f.value !== '')
              .map(f => [String(f.name), f.value])
          );


          value = { [columName]: value, ...extra };
        }

        let val = { id, value, name, event: corps.event };
        if (permit) {
          console.log("emitIfChanged ", value, this.lastValue, val, this.foreign());
          this.debouncedValue.emit(val); // fonctionne avec Angular 20+
          this.lastValue = value;
          return;
        }
      }

    }
  }

  verifyValid(value: string) {
    if (this.liste() && value && value.length > 0) {
      console.log('verification ', value, this.liste())
      return this.liste().find(item => ((item.libelle ? item.libelle : '') === value || item[this.colonne()] === value));
    }
    return false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }




}
