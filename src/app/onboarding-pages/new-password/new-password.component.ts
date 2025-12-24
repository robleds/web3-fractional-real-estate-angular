import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Route, Router} from '@angular/router';
import {firstValueFrom, Subscription} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons/faCheckCircle';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnDestroy {
  passForm: FormGroup;
  private passFormSub: Subscription;
  faWarn = faExclamationCircle;
  faCheck = faCheckCircle;
  redefineSuccess = false;
  redefineSending = false;
  redefineErr = '';
  updateMode = false;


  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private router: Router,
              private auth: AuthService
  ) {
    this.passForm = this.fb.group({
      password: ['', Validators.required],
      password2: ['', Validators.required]
    });
    this.passFormSub = this.passForm.valueChanges.subscribe((value) => {
      if (value.password2 !== '' && value.password2.length >= value.password.length) {
        this.passCompare(value);
      }
    });
    if (this.router.url.endsWith('/update-pass')) {
      this.updateMode = true;
      this.passForm.addControl('currentPass', new FormControl('', Validators.required));
    }
  }

  ngOnDestroy(): void {
    this.passFormSub.unsubscribe();
  }

  async resetPassword() {
    if (this.passForm.valid) {
      this.redefineSending = true;
      try {
        const resetPassword$ = this.http.post(`${environment.apiHost}/resetPassword`, {
          token: this.auth.recToken,
          new_password: this.passForm.get('password').value
        });
        const result = await firstValueFrom(resetPassword$) as any;
        console.log(result);
        if (result.status) {
          this.redefineSuccess = true;
          this.redefineErr = '';
        } else {
          this.redefineSuccess = false;
          this.redefineErr = result.error;
        }
      } catch (e) {
        console.log(e);
        this.redefineSuccess = false;
        this.redefineErr = 'e';
      }
      this.redefineSending = false;
    }
  }

  passCompare(value: any) {
    if (value.password2 !== '') {
      this.passForm.controls.password2.setErrors(
        value.password === value.password2 ? null : {incorrect: true}
      );
    }
  }

  async updatePassword() {
    if (this.passForm.valid) {
      this.redefineSending = true;
      try {
        const updatePassword$ = this.http.post(`${environment.apiHost}/updatePassword`, {
          old_password: this.passForm.get('currentPass').value,
          new_password: this.passForm.get('password').value
        }, this.auth.buildOptions());
        const result = await firstValueFrom(updatePassword$) as any;
        if (result.status) {
          this.redefineSuccess = true;
          this.redefineErr = '';
        } else {
          this.redefineSuccess = false;
          this.redefineErr = result.error;
        }
      } catch (e) {
        console.log(e);
        this.redefineSuccess = false;
        this.redefineErr = 'e';
      }
      this.redefineSending = false;
    }
  }
}
