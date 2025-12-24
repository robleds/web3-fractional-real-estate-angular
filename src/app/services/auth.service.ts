import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';

interface UserData {
  id: string;
  name: string;
  status: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token = '';
  userData: UserData = {} as UserData;
  tokenExpired = false;
  requiredLogin = false;
  public recToken: string;

  constructor(private http: HttpClient, private jwt: JwtHelperService, private router: Router) {
    const data = localStorage.getItem('authToken');
    if (data) {
      this.token = data;
      this.decodeToken();
    }
    setTimeout(() => {
      this.getUserData().catch(console.log);
    }, 50);
  }

  get isLogged() {
    return this.token !== '';
  }

  async login(formValue: any): Promise<any> {
    const result = await this.http.post(`${environment.apiHost}/login`, {
      email: formValue.email,
      password: formValue.password
    }).toPromise() as any;
    if (result.status) {
      this.setToken(result.token);
    }
    return result;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.token = '';
    this.router.navigateByUrl('');
  }

  decodeToken() {
    this.userData = this.jwt.decodeToken(this.token).payload;
    this.tokenExpired = this.jwt.isTokenExpired(this.token);
    if (this.tokenExpired) {
      this.logout();
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', this.token);
    this.decodeToken();
  }

  buildOptions(baseOptions?: any) {
    const tokenString = 'Bearer ' + this.token;
    let opts = baseOptions;
    if (!opts) {
      opts = {headers: {authorization: tokenString}};
    } else {
      if (!opts.headers) {
        opts.headers = {authorization: tokenString};
      } else {
        if (opts.headers instanceof HttpHeaders) {
          opts.headers = opts.headers.append('authorization', tokenString) as HttpHeaders;
        } else {
          opts.headers.authorization = tokenString;
        }
      }
    }
    return opts;
  }

  async getAccountInfo(blockchainAccount: string) {
    if (!this.token) {
      return;
    }

    try {
      const headers = {
        Authorization: 'Bearer ' + this.token
      };

      return await this.http.get(`${environment.apiHost}/getAccountInfo/${blockchainAccount}`, {headers}).toPromise();
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  async getUserData(): Promise<void> {
    if (this.token) {
      const getUserData$ = this.http.get(`${environment.apiHost}/getUserData`, this.buildOptions());
      const result = await firstValueFrom(getUserData$) as any;
      if (result.status && result.user) {
        this.userData.name = result.user.firstName;
        this.userData.status = result.user.status;
        this.userData.role = result.user.role;
      }
    }
  }
}
