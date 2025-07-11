import {CanActivateFn} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  let authService: AuthService = inject(AuthService);

  if (authService.isTokenExpired()) {
    console.log('Token is expired')
    authService.logout();
    return false;
  } else {
    console.log('Token is valid')
    return true;
  }
};
