import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheData {
  private dataSource = new BehaviorSubject<any | null>(null);
  data$ = this.dataSource.asObservable();

  constructor () {}

  loadData() : Observable<any> {
    return this.data$
  }

  setData(data: any) {
    this.dataSource.next(data);
  }

}
