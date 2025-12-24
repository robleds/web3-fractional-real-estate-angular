import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'onboard',
    loadChildren: () => import('./onboarding-pages/onboarding-pages.module').then(mod => mod.OnboardingPagesModule)
  },
  {
    path: 'dash',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then(mod => mod.AdminDashboardModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user-dashboard/user-dashboard.module').then(mod => mod.UserDashboardModule)
  },
  {
    path: '',
    loadChildren: () => import('./client-pages/client-pages.module').then(mod => mod.ClientPagesModule)
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
