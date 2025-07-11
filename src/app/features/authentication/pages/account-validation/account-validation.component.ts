import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertComponent} from "../../../../shared/components/alert/alert.component";
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
  InputGroupTextDirective, RowComponent
} from "@coreui/angular";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IconDirective} from "@coreui/icons-angular";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Subscription} from "rxjs";
import {AuthApiService} from "../../services/auth-api.service";
import {AlertService} from "../../../../core/services/alert.service";
import {strongPasswordValidator} from "../../../../shared/validators/strong-password.validator";
import {passwordsMatchValidator} from "../../../../shared/validators/password-match.validator";
import {ResetPasswordPostModel} from "../../models/reset-password-post.model";
import {AccountValidationPostModel} from "../../models/account-validation-post.model";

@Component({
  selector: 'app-account-validation',
  imports: [
    AlertComponent,
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    CardGroupComponent,
    ColComponent,
    ContainerComponent,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormsModule,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    ReactiveFormsModule,
    RouterLink,
    RowComponent,
    TranslatePipe
  ],
  templateUrl: './account-validation.component.html',
  styleUrl: './account-validation.component.scss'
})
export class AccountValidationComponent implements OnInit, OnDestroy {

  accountValidationForm: FormGroup;
  success: boolean = false;
  accountValidationKey!: string;
  errorCode!:string;

  subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private authApiService: AuthApiService, private route: ActivatedRoute,
              private router: Router, private alertService: AlertService, private translateService: TranslateService) {
    this.accountValidationForm = this.fb.group({
      password: [null, [Validators.required, strongPasswordValidator()]],
      confirmPassword: [null, [Validators.required]]
    }, {validators: passwordsMatchValidator()})
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if (params['token'] != null) {
        this.accountValidationKey = params['token'];
        this.alertService.clear();
      } else {
        this.router.navigate(['/login']).then(() => console.log('Routing to login page'));
        this.alertService.addAlert(this.translateService.instant('authentication.account-validation.errors.no-token'), 'warning', true);
      }
    }));
  }

  submit() {
    let payload: AccountValidationPostModel = {
      activationKey: this.accountValidationKey,
      password: this.accountValidationForm.value.password
    }
    this.subscriptions.push(this.authApiService.validateAccount(payload).subscribe({
      next: ()=>{
        this.success=true;
      },
      error: (err)=>{
        console.log('an error occurred when calling the reset password api', err.error);
        this.errorCode = err.error.code;
        let message = this.translateService.instant('authentication.account-validation.form.errors.' + this.errorCode);
        this.alertService.addAlert(message, 'warning', false);
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }


}
