import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {NavigationStart, Router} from "@angular/router";
import {AlertModel} from "../../shared/models/alert.model";

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly subject: BehaviorSubject<null | AlertModel> = new BehaviorSubject<AlertModel | null>(null);
  private keepAfterRouteChange = false;

  constructor(private readonly router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          // console.log('will set the keep after router change to false');
          this.keepAfterRouteChange = false;
        } else {
          // clear alert message
          // console.log('will clear the alerts');
          this.clear();
        }
      }
    });
  }

  getAlert(): Observable<AlertModel | null> {
    // console.log('will return the alert');
    return this.subject.asObservable();
  }

  addAlert(message: string, type: string, keepAfterRouteChange: boolean = false) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.subject.next({type, text: message});
  }

  clear() {
    this.subject.next(null);
  }
}
