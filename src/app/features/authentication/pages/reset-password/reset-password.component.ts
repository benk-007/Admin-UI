import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import {AlertComponent} from "../../../../shared/components/alert/alert.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IconDirective} from "@coreui/icons-angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AuthApiService} from "../../services/auth-api.service";
import {Subscription} from "rxjs";
import {strongPasswordValidator} from "../../../../shared/validators/strong-password.validator";
import {passwordsMatchValidator} from "../../../../shared/validators/password-match.validator";
import {AlertService} from "../../../../core/services/alert.service";
import {ResetPasswordPostModel} from "../../models/reset-password-post.model";

@Component({
  selector: 'app-reset-password',
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    AlertComponent,
    ReactiveFormsModule,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    FormFeedbackComponent,
    TranslatePipe,
    RouterLink,
    ButtonDirective,
    FormDirective
  ],
  templateUrl: './reset-password.component.html',
  standalone: true,
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  resetPasswordForm: FormGroup;
  success: boolean = false;
  resetPasswordKey!: string;
  errorCode!: string;

  subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private authApiService: AuthApiService, private route: ActivatedRoute,
              private router: Router, private alertService: AlertService, private translateService: TranslateService) {
    this.resetPasswordForm = this.fb.group({
      password: [null, [Validators.required, strongPasswordValidator()]],
      confirmPassword: [null, [Validators.required]]
    }, {validators: passwordsMatchValidator()})
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if (params['token'] != null) {
        this.resetPasswordKey = params['token'];
        this.alertService.clear();
      } else {
        this.router.navigate(['/login']).then(() => console.log('Routing to login page'));
        this.alertService.addAlert(this.translateService.instant('authentication.reset-password.errors.no-token'), 'warning', true);
      }
    }));
  }

  submit() {
    let payload: ResetPasswordPostModel = {
      resetPasswordKey: this.resetPasswordKey,
      password: this.resetPasswordForm.value.password
    }
    this.subscriptions.push(this.authApiService.resetPassword(payload).subscribe({
      next: () => {
        this.success = true;
      },
      error: (err) => {
        console.log('an error occurred when calling the reset password api', err.error);
        this.errorCode = err.error.code;
        let message = this.translateService.instant('authentication.reset-password.form.errors.' + this.errorCode);
        this.alertService.addAlert(message, 'warning', false);
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }


}
