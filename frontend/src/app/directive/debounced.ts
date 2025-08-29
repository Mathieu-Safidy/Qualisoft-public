import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { Subject, fromEvent, takeUntil, debounceTime, map, distinctUntilChanged } from 'rxjs';

@Directive({
  selector: '[appDebounced]'
})
export class Debounced {

  constructor() { }

  timeout = input<number>(300);
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
      fromEvent(element, 'change')
        .pipe(
          takeUntil(this.destroy$),
          debounceTime(this.timeout()),
          map(() => {
            const name = element.getAttribute('name');
            const id = element.getAttribute('id');
            const value = element.type === 'checkbox' ? element.checked : element.value;
            return { id, value, name };
          }),
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe((eventData) => {
          this.debouncedValue.emit(eventData);
        });
    }
  }
  
}
