import {HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from "../services/auth.service";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const excludedUrls = [
    '/refresh-token',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/validate-account'
  ];
  const token = localStorage.getItem(AuthService.TOKEN);
  if (token && !excludedUrls.some(url => req.url.includes(url))) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        'authorization': 'Bearer '+token
      }
    });
    // Pass the cloned request with the updated header to the next handler
    return next(authReq);

  } else {
    return next(req);
  }
};
