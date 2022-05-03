import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { timer, Subject, Observable, fromEvent } from 'rxjs';
import {
  map,
  mapTo,
  mergeWith,
  scan,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  counter: number = 0;
  speed: number = 300;
  rate: number = 1;
  receiving: boolean = false;

  @ViewChild('btnStart') btnStart;
  @ViewChild('btnStop') btnStop;
  @ViewChild('btnReset') btnReset;

  pauseCounter$ = new Subject<any>();
  start$: Observable<any>;
  reset$: Observable<any>;
  pause$: Observable<any>;

  constructor() {}

  ngAfterViewInit(): void {
    this.start$ = fromEvent(
      this.btnStart._elementRef.nativeElement,
      'click'
    ).pipe(switchMap(() => this.incrementCounter()));

    this.reset$ = fromEvent(
      this.btnReset._elementRef.nativeElement,
      'click'
    ).pipe(
      tap(() => {
        this.pauseCounter$.next(0);
      }),
      mapTo(0)
    );

    this.pause$ = fromEvent(
      this.btnStop._elementRef.nativeElement,
      'click'
    ).pipe(
      tap(() => this.pauseCounter$.next(this.counter)),
      map((x) => this.counter)
    );

    this.start$
      .pipe(mergeWith(this.reset$, this.pause$))
      .subscribe((x) => (this.counter = x));

    this.pauseCounter$.subscribe((num) => {
      if (num == 0 && this.receiving) {
        this.receiving = false;
        setTimeout(() => {
          this.btnStart._elementRef.nativeElement.click();
        }, 300);
      } else this.receiving = false;
    });
  }

  incrementCounter() {
    this.receiving = true;
    return timer(0, this.speed).pipe(
      scan((acc, curr) => acc + this.rate, this.counter),
      takeUntil(this.pauseCounter$)
    );
  }
}
