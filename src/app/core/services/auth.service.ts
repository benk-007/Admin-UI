import {Injectable, signal} from '@angular/core';
import {Router} from "@angular/router";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    static readonly TOKEN = 'access_token';

    // Using signal instead of BehaviorSubject
    private userSignal = signal<{ username: string, email: string, userId: string, roles: string }>({
        username: '',
        email: '',
        userId: '',
        roles: ''
    });

    constructor(private router: Router, private jwtHelper: JwtHelperService) {
    }

    logout() {
        localStorage.removeItem(AuthService.TOKEN);
        this.userSignal.set({username: '', email: '', userId: '', roles: ''}); // Updating signal
        this.router.navigate(['/login']).then(() => 'Redirected to login page');
    }

    isTokenExpired() {
        if (localStorage.getItem(AuthService.TOKEN) != null) {
            return this.jwtHelper.isTokenExpired();
        } else {
            console.log("No token to check")
            return true;
        }
    }

    private decodeToken(key: string): string {
        const token = localStorage.getItem(AuthService.TOKEN);
        return token ? this.jwtHelper.decodeToken(token)[key] : '';
    }

    setUser(user: { username: string, email: string, userId: string, roles: string }) {
        this.userSignal.set(user); // Setting new value
    }

    getUser() {
        // If user data is empty, decode the token and update signal
        if (!this.userSignal().email || !this.userSignal().username) {
            this.setUser({
                username: this.decodeToken('sub'),
                email: this.decodeToken('username'),
                userId: this.decodeToken('identifier'),
                roles: this.decodeToken('authorities')
            });
        }
        return this.userSignal; // Directly return signal
    }
}
