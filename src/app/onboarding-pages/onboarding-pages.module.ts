import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {OnboardingPagesComponent} from './onboarding-pages.component';
import {RegisterComponent} from './register/register.component';
import {DateMaskDirective} from '../date-mask.directive';
import {RegisterGuard} from '../services/register.guard';
import {NewPasswordComponent} from './new-password/new-password.component';
import {RecoverPassGuard} from '../services/recover-pass.guard';
import {RegisterModule} from '../register/register.module';

const routes: Routes = [
  {
    path: '',
    component: OnboardingPagesComponent,
    children: [
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [RegisterGuard]
      },
      {
        path: 'recover',
        component: NewPasswordComponent,
        canActivate: [RecoverPassGuard]
      },
      {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  declarations: [
    OnboardingPagesComponent,
    DateMaskDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    RegisterModule,
  ],
  exports: [RouterModule]
})
export class OnboardingPagesModule {
}
