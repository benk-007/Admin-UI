import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AlertService} from "../../../core/services/alert.service";
import {AlertModel} from "../../models/alert.model";
import {AlertModule} from "ngx-bootstrap/alert";

@Component({
  selector: 'app-alert',
  imports: [
    AlertModule,
  ],
  templateUrl: './alert.component.html',
  standalone: true,
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit, OnDestroy {
  alert!: AlertModel | null;
  private subscription!: Subscription;

  constructor(private readonly alertService: AlertService) {
  }

  ngOnInit(): void {
    this.subscription = this.alertService.getAlert().subscribe(
      alert => {
        if (alert === null) {
          alert = null;
        } else {
          this.alert = alert as AlertModel;
        }
      });
  }

  clearAlert(): void {
    this.alert = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
