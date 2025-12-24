import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {HttpClient} from '@angular/common/http';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faCheckCircle} from '@fortawesome/free-regular-svg-icons/faCheckCircle';
import {AuthService} from '../../services/auth.service';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {firstValueFrom, Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public registerForm: FormGroup;
  public availableUsers: string[];
  registerSuccess: boolean;
  registerErr = '';
  registerSending = false;
  passmatch = true;

  loginSuccess: boolean;
  loginErr = '';
  loginSending = false;
  loginErrCode = '';

  faWarn = faExclamationCircle;
  faCheck = faCheckCircle;
  faInfo = faInfoCircle;

  validationResending = false;
  resendSuccess: boolean;
  resent = false;
  updatePassErr = '';
  updatePassSending = false;
  updatePassSuccess = false;
  clickedRecoverPass = false;
  private passFormSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });

    this.passFormSub = this.registerForm.valueChanges.subscribe((value) => {
      if (value.password2 !== '') {
        this.registerForm.controls.password2.setErrors(value.password === value.password2 ? null : {incorrect: true});
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.passFormSub.unsubscribe();
  }

  // logIn() {
  // const accountName = this.logInForm.get('account_name').value;

  // if (accountName) {
  //   localStorage.setItem('user.client', accountName);
  //   this.usersService.currentUser = accountName;
  //
  //   this.dialogRef.close(accountName);
  // }
  // }

  async register() {
    try {
      this.registerSending = true;
      const result = await this.http.post(`${environment.apiHost}/signup`, {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      }).toPromise() as any;
      console.log(result);
      this.registerSuccess = result.status;
      if (!result.status) {
        this.registerErr = result.error;
      } else {
        this.registerErr = '';
      }
    } catch (e) {
      this.registerSuccess = false;
      this.registerErr = e.name;
      console.log(e);
    }
    this.registerSending = false;
  }

  async login() {
    try {
      this.loginSending = true;
      const result = await this.authService.login(this.loginForm.value);
      if (result.status) {
        this.loginSuccess = result.status;
        this.loginErr = '';
        this.dialogRef.close();
        if (this.authService.userData.status === 1 && this.authService.userData.name === '') {
          this.router.navigate(['onboard', 'register']);
        }
      } else {
        this.loginErr = result.message;
      }
    } catch (e) {
      this.loginSuccess = false;
      if (e.error.error) {
        this.loginErr = e.error.error;
      } else {
        this.loginErr = 'NA';
      }
      console.log(e);
    }
    this.loginSending = false;
  }

  async resendValidation() {
    this.resent = false;
    if (this.loginForm.value.email !== '') {
      try {
        this.validationResending = true;
        const result = await this.http.post(`${environment.apiHost}/resendEmailVerification`, {
          email: this.loginForm.value.email,
        }).toPromise() as any;
        this.resendSuccess = result.status;
      } catch (e) {
        console.log(e);
        this.resendSuccess = false;
      }
      this.validationResending = false;
      this.resent = true;
    }
  }

  passCompare() {
    if (this.registerForm.value.password && this.registerForm.value.password2) {
      if (this.registerForm.value.password === this.registerForm.value.password2) {
        this.registerForm.controls.password2.setErrors(null);
        this.passmatch = true;
      } else {
        this.registerForm.controls.password2.setErrors({incorrect: true});
        this.passmatch = false;
      }
    }
  }

  async sendUpdatePass() {
    this.clickedRecoverPass = true;
    if (this.loginForm.get('email').valid) {
      try {
        this.updatePassSending = true;
        const requestPass$ = this.http.post(`${environment.apiHost}/requestPasswordReset`, {
          email: this.loginForm.value.email
        });
        const result = await firstValueFrom(requestPass$) as any;
        if (result.status) {
          this.updatePassSuccess = true;
          this.updatePassErr = '';
        } else {
          this.updatePassErr = result.error;
        }
      } catch (e) {
        console.log(e);
        this.updatePassErr = 'e';
      }
      this.updatePassSending = false;
    }
  }
}
