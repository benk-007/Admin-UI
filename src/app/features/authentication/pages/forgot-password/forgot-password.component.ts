import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {AuthApiService} from "../../services/auth-api.service";
import {AlertService} from "../../../../core/services/alert.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormFloatingDirective,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {AlertComponent} from "../../../../shared/components/alert/alert.component";
import {emailValidator} from "../../../../shared/validators/email.validator";

@Component({
  selector: 'app-forgot-password',
  imports: [
    RowComponent,
    ColComponent,
    AlertComponent,
    ReactiveFormsModule,
    TranslatePipe,
    FormFloatingDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    RouterLink,
    ButtonDirective,
    FormDirective
  ],
  templateUrl: './forgot-password.component.html',
  standalone: true,
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnDestroy {

  forgotPasswordForm: FormGroup;
  errorCode!: string;
  success: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private authApiService: AuthApiService, private alertService: AlertService,
              private translateService: TranslateService) {
    this.forgotPasswordForm = this.fb.group({
      email: [null, [Validators.required, emailValidator()]]
    })
  }

  submit() {
    let payload = this.forgotPasswordForm.value;
    this.subscriptions.push(this.authApiService.forgotPassword(payload).subscribe({
      next: () => {
        console.log('forgot password api response');
        this.success = true;
      },
      error: err => {
        console.error('an error occurred when forgot password api:', err.error);
        this.errorCode = err.error.code;
        let message = this.translateService.instant('authentication.forgot-password.form.errors.' + this.errorCode);
        this.alertService.addAlert(message, 'warning', false);
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }
}
