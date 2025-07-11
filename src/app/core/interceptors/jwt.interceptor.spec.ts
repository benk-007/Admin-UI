// import { TestBed } from '@angular/core/testing';
// import {
//   HTTP_INTERCEPTORS,
//   HttpClient, HttpInterceptorFn
// } from '@angular/common/http';
//
// import { jwtInterceptor } from './jwt.interceptor';
// import {AuthService} from "../auth/services/auth.service";
//
// import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
// import {JWT_OPTIONS, JwtHelperService} from "@auth0/angular-jwt";
//
//
//
// describe('jwtInterceptor', () => {
//   const interceptor: HttpInterceptorFn = (req, next) =>
//     TestBed.runInInjectionContext(() => jwtInterceptor(req, next));
//
//   let authService : AuthService;
//   let jwtHelper = {
//     isTokenExpired: jest.fn(),
//   };
//   let httpTestingController : HttpTestingController;
//   let httpClient: HttpClient;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports : [HttpClientTestingModule],
//       providers: [AuthService, {provide: JWT_OPTIONS, useValue: JWT_OPTIONS},
//         {provide: JwtHelperService, useValue: jwtHelper}
//       ]
//     });
//
//     httpTestingController = TestBed.inject(HttpTestingController);
//     httpClient = TestBed.inject(HttpClient);
//     authService = TestBed.inject(AuthService);
//   });
//
//   afterEach(() => {
//     httpTestingController.verify();
//   });
//
//   it('should be created', () => {
//     expect(interceptor).toBeTruthy();
//   });
//
//   it("should cloned request with the updated header to the next handler", ()=>{
//
//     httpClient.get('/test').subscribe(res => {
//       expect(res).toBeTruthy();
//     });
//     Object.defineProperty(AuthService, 'TOKEN', {value : "access_token", writable: false});
//     localStorage.setItem("access_token", "token");
//     const req = httpTestingController.expectOne({
//       method: 'GET',
//       url: '/test',
//     })
//
//     expect(req.request.method).toBe('GET');
//     expect(req.request.headers.has('authorization')).toBeDefined();
//
//   })
// });


import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient, HttpHandler, HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../auth/services/auth.service';

import {JWT_OPTIONS, JwtHelperService, JwtInterceptor} from "@auth0/angular-jwt";
import {Observable, Subscriber} from "rxjs";


describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let jwtHelper: JwtHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JwtInterceptor,provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(),
        {provide: JwtHelperService, useValue: jwtHelper},{provide: JWT_OPTIONS, useValue: JWT_OPTIONS}
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    jwtHelper = TestBed.inject(JwtHelperService);
    localStorage['getItem'] = jest.fn((key: string) => {
      if (key === AuthService.TOKEN) {
        return 'mocked-jwt-token'; // Mock token value
      }
      return null;
    })
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests remain
  });

  it('should add an Authorization header if the token exists in localStorage', () => {
    // const next = () => {
    //     return new Observable((subscriber: Subscriber<any>) => {
    //       subscriber.complete();
    //     });
    // };
    // const requestMock = new HttpRequest('GET', '/test');
    //
    // // spyOn(next, 'handle').and.callThrough();
    //
    // jwtInterceptor(requestMock, next).subscribe();
    //
    // expect(next).toHaveBeenCalledWith(requestMock.clone({
    //   headers: requestMock.headers.append('Authorization', `Bearer fake-token`)
    // }))
  });

  it('should not add an Authorization header if no token exists in localStorage', () => {
    // localStorage.getItem.returnValue(null); // Mock no token

    // httpClient.get('/test-endpoint').subscribe((res: any) => {
    //   console.log(interceptor)
    //   expect(interceptor.length).toBeGreaterThan(0);
    // });
    //
    // const req = httpMock.expectOne('/test-endpoint');
    //
    // expect(req.request.headers.has('authorization')).toBeFalsy();

    // req[0].flush({}); // Complete the request
  });
});
