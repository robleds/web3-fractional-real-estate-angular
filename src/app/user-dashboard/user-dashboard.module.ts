import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserDashboardComponent} from './user-dashboard.component';
import {UserAssetsComponent} from './user-assets/user-assets.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {DataViewModule} from 'primeng/dataview';
import {TableModule} from 'primeng/table';
import {SlickCarouselModule} from 'ngx-slick-carousel';
import {RouterModule, Routes} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {IsLoggedGuard} from '../services/is-logged.guard';
import {RegisterModule} from '../register/register.module';
import {RegisterComponent} from '../onboarding-pages/register/register.component';
import {NewPasswordComponent} from '../onboarding-pages/new-password/new-password.component';
import {MatSelectModule} from '@angular/material/select';
import {UserFilesComponent} from './user-files/user-files.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {AppModule} from '../app.module';
import {FooterModule} from '../components/footer/footer.module';


const routes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    canActivate: [IsLoggedGuard],
    children: [
      {
        path: 'assets',
        component: UserAssetsComponent
      },
      {
        path: 'update-info/:page',
        component: RegisterComponent
      },
      {
        path: 'update-pass',
        component: NewPasswordComponent
      },
      {
        path: 'files',
        component: UserFilesComponent
      },
      {
        path: '',
        redirectTo: 'assets',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [UserDashboardComponent, UserAssetsComponent, UserFilesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    DataViewModule,
    TableModule,
    SlickCarouselModule,
    RegisterModule,
    MatSelectModule,
    MatExpansionModule,
    FooterModule
  ]
})

export class UserDashboardModule {
}
