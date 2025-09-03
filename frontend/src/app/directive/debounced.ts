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
  debouncedValue = output<{ id: string | number; value: string; name: string }>();
  isAutoComplete = input<{ value: boolean , name?: string }>({ value: false, name: '' });
  statique = input<boolean>(false);
  formul = input<FormGroup>();
  verifier = input<any>(null);
  foreign = input<{name?: string | null, value?: string | number | null}>({name: null, value: null});
  delete = input<boolean>(false);
  liste = input<any[]>([]);
  colonne = input<string>('');


  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();
  private ngControl = inject(NgControl);
  private initialValue: any;
  private lastValue: any;

  ngOnInit() {
    const element = this.elementRef.nativeElement;
    this.lastValue = this.ngControl.value;
    console.log('condition ',!this.verifier() && this.statique(), 'verifier',this.verifier() , this.statique() , this.isAutoComplete() && this.isAutoComplete().value, 'valeur',this.isAutoComplete().name);
    if (!this.verifier() && this.statique()) {
       let value = this.formul()?.get(this.isAutoComplete().name ?? '')?.value;
       this.emitIfChanged({element:element,value:value})
    } 

    if (!this.isAutoComplete() || !this.isAutoComplete().value) {
      
      fromEvent(element, 'change')
        .pipe(
          debounceTime(this.timeout()), 
          takeUntil(this.destroy$))
        .subscribe(() => this.emitIfChanged({element:element}));
    } else {
      if (this.formul()) {
        console.log('formulaire field ',this.formul(),this.formul()?.get(this.isAutoComplete().name ?? ''))
       this.formul()?.get(this.isAutoComplete().name ?? '')?.valueChanges
        .pipe(debounceTime(this.timeout()), takeUntil(this.destroy$))
        .subscribe(val => this.emitIfChanged({element:element,value:val})
      );
      }
    }

  }

  private emitIfChanged(corps:{element: any,value?:any}) {
    console.log('element emit ',corps.element,'value',corps.value, 'liste', this.liste())
    let control = this.ngControl.control;
    if (this.liste().length) {
      console.log('avant verification ', corps.value , this.liste())
      let verif = this.verifyValid(corps.value);
      if (!verif) {
        control?.setErrors({ invalidValue: true });
        return;
      } else {
        corps.value = verif[this.colonne()];
        if (control?.hasError('invalidValue')) {
          const errors = { ...control.errors };
          delete errors['invalidValue'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    }

    let persist = this.ngControl.value;
    if (corps.value != null && corps.value !== undefined) { 
      persist = corps.value;
    } 
    let value = corps.element.type === 'checkbox' ? corps.element.checked : persist;
    
    if ((value !== this.lastValue && this.verifier()) || !this.verifier()) {
      const id = this.identity() ?? -1;
      let name = corps.element.getAttribute('name') || '';
      if(this.foreign().name && this.foreign().value) {
        let [shema,columName] = name.split(':');
        value = { [columName]: value, [String(this.foreign().name)]: this.foreign().value }
      }
      
      let val = { id, value, name };
      console.log("emitIfChanged ",value, this.lastValue, val);
      this.debouncedValue.emit(val); // fonctionne avec Angular 20+
      this.lastValue = value;
    }
  }

  verifyValid(value : string) {
    if (this.liste()) {
      return this.liste().find(item => (item.libelle === value || item[this.colonne()] === value));
    }
    return false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  



}
