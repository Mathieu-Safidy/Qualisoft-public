import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { Subject, fromEvent, takeUntil, debounceTime, map, distinctUntilChanged, tap } from 'rxjs';

@Directive({
  selector: '[appDebounced]'
})
export class Debounced {

  constructor() { }

  timeout = input<number>(300);
  identity = input<string | number>();
  debouncedValue = output<{ value: string; name: string }>();

  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;

    if (element) {
      fromEvent(element, 'input')
        .pipe(
          // takeUntil(this.destroy$),
          // debounceTime(this.timeout()),
         
          // map(() => {
          //   const name = element.getAttribute('name');
          //   let id = element.getAttribute('identity') || null;
          //   if (!id) {
          //     if (this.identity()) {
          //       id = this.identity();
          //     } else {
          //       id = -1;
          //     }
          //   }
          //   const value = element.type === 'checkbox' ? element.checked : element.value;
            
          //   return { id, value, name };
          // }), 
          distinctUntilChanged(),

        )
        .subscribe((eventData) => {
          console.log("Après distinctUntilChanged now", eventData);
          // this.debouncedValue.emit(eventData);
        });
    }
  }



}
