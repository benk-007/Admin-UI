import {Component} from '@angular/core';
import {
  ButtonDirective, CardBodyComponent, CardComponent, CardGroupComponent,
  ColComponent, ContainerComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormFloatingDirective,
  FormLabelDirective, InputGroupComponent, InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {AuthApiService} from "../../services/auth-api.service";
import {AlertComponent} from "../../../../shared/components/alert/alert.component";
import {AlertService} from "../../../../core/services/alert.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {emailValidator} from "../../../../shared/validators/email.validator";
import {AuthService} from "../../../../core/services/auth.service";
import {IconDirective} from '@coreui/icons-angular';
import {NgOptimizedImage, NgStyle} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    RowComponent,
    ColComponent,
    FormFloatingDirective,
    FormControlDirective,
    FormLabelDirective,
    ButtonDirective,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    FormDirective,
    AlertComponent,
    TranslatePipe,
    FormFeedbackComponent,
    CardBodyComponent,
    CardComponent,
    CardGroupComponent,
    ContainerComponent,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    NgStyle,
    NgOptimizedImage
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  loginForm: FormGroup;
  errorCode!: string;

  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder, private authApiService: AuthApiService, private alertService: AlertService,
              private translateService: TranslateService, private router: Router) {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required, emailValidator()]],
      password: [null, Validators.required]
    })
  }

  submit() {
    console.log('clicked')
    let payload = this.loginForm.value;
    this.subscriptions.push(this.authApiService.login(payload).subscribe({
      next: result => {
        console.log('login api response is:', result);
        localStorage.setItem(AuthService.TOKEN, result.access_token);
        this.router.navigate(['/dashboard']).then(() => console.log('redirecting to dashboard page'));
      },
      error: err => {
        console.error('an error occurred when login api:', err.error);
        this.errorCode = err.error.code;
        let message = this.translateService.instant('authentication.login.form.errors.' + this.errorCode);
        this.alertService.addAlert(message, 'warning', false);
      }
    }))
  }

}

