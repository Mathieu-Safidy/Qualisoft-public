import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { FormGroup, NgControl } from '@angular/forms';
import { Subject, fromEvent, takeUntil, debounceTime, map, distinctUntilChanged, tap } from 'rxjs';

@Directive({
  selector: '[appDebounced]'
})
export class Debounced {

  constructor() { }

  timeout = input<number>(300);
  identity = input<string | number>();
  debouncedValue = output<{ id: string | number; value: string; name: string , event?: Event}>();
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


  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();
  private ngControl = inject(NgControl);
  private initialValue: any;
  private lastValue: any;

  ngOnInit() {
    const element = this.elementRef.nativeElement;
    this.lastValue = this.ngControl.value;
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
        .subscribe((event) => this.emitIfChanged({ element: element , event: event as Event }));
    } else {
      if (this.formul()) {
        console.log('formulaire field ', this.formul(), this.formul()?.get(this.isAutoComplete().name ?? ''))
        this.formul()?.get(this.isAutoComplete().name ?? '')?.valueChanges
          .pipe(debounceTime(this.timeout()), takeUntil(this.destroy$))
          .subscribe(val => this.emitIfChanged({ element: element, value: val })
          );
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

  private emitIfChanged(corps: { element: any, value?: any, event?: Event }) {
    let verif = false;
    if (this.liste().length) {
      verif = this.validation(corps.value);
    }
    let persist = this.ngControl.value;
    if (corps.value != null && corps.value !== undefined) {
      persist = corps.value;
    }
    let value = corps.element.type === 'checkbox' ? corps.element.checked : persist;
    console.log('element emit ', corps.element, 'value', value, 'liste', this.liste(), 'persiste',persist, 'type',corps.element.type)
    if (!verif && this.liste().length) {
      return;
    } else if (verif && this.liste().length) {
      value = verif;
    }

    if ((value !== this.lastValue && this.verifier()) || !this.verifier()) {
      const id = this.identity() ?? -1;
      let name = corps.element.getAttribute('name') || '';
      if (this.foreign() && this.foreign().length > 0) {
        let [schema, columName] = name.split(':');

        let extra = Object.fromEntries(
          this.foreign()
            .filter(f => f.name && f.value)
            .map(f => [String(f.name), f.value])
        );

        value = { [columName]: value, ...extra };
      }
      
      let val = { id, value, name, event: corps.event };
      
      console.log("emitIfChanged ", value, this.lastValue, val, this.foreign());
      this.debouncedValue.emit(val); // fonctionne avec Angular 20+
      this.lastValue = value;
    }
  }

  verifyValid(value: string) {
    if (this.liste()) {
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
