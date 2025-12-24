import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, ParamMap, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private auth: AuthService, private http: HttpClient) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return new Promise(async (resolve, reject) => {
      if (next.queryParamMap.has('token')) {
        try {
          const result = await this.http.get(`${environment.apiHost}/validate?token=${next.queryParamMap.get('token')}`).toPromise() as any;
          console.log(result);
          if (result.status) {
            this.auth.setToken(result.token);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          console.log(e);
          if (e.error.message === 'ALREADY_VALIDATED') {
            if (this.auth.isLogged) {
              resolve(true);
            } else {
              this.auth.requiredLogin = true;
              this.router.navigateByUrl('');
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }
      } else {
        if (this.auth.userData?.status > 0 && this.auth.isLogged) {
          resolve(true);
        } else {
          this.router.navigateByUrl('');
          resolve(false);
        }
      }
    });
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return next.queryParamMap.has('token');
  }



}
