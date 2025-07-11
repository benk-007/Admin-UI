import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {catchError, throwError} from "rxjs";
import {AlertService} from "../services/alert.service";
import {TranslateService} from "@ngx-translate/core";

export const tokenExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const translateService = inject(TranslateService);

  return next(req).pipe(
    catchError((error) => {
      if (error.error && error.error.code === 'GTW_AUTH_FORB_ERR_1') {
        console.error('Token expired or not valid. Logging out...');
        alertService.addAlert(translateService.instant('commons.errors.session-expired'), 'warning', true);
        // Log out the user
        authService.logout();

        return throwError(() => new Error('User logged out due to expired token'));
      }

      return throwError(() => error);
    })
  );
};
