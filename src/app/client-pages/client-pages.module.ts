import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClientPagesComponent} from './client-pages.component';
import {RouterModule, Routes} from '@angular/router';
import {AssetComponent} from './asset/asset.component';
import {SlickCarouselModule} from 'ngx-slick-carousel';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import {LightboxModule} from '@ngx-gallery/lightbox';
import {LoginComponent} from '../components/login/login.component';
import {BuyAssetComponent} from '../components/buy-asset/buy-asset.component';
import {NgxCurrencyModule} from 'ngx-currency';
import {HomeComponent} from './home/home.component';
import {GalleryModule} from '@ngx-gallery/core';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {WalletComponent} from './wallet/wallet.component';
import {TableModule} from 'primeng/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AboutComponent } from './about/about.component';
import { PurchaseConfirmationComponent } from './purchase-confirmation/purchase-confirmation.component';
import {ProgressTargetModule} from '../components/progress-target/progress-target.module';
import {AssetCardModule} from '../components/asset-card/asset-card.module';
import {SWIPER_CONFIG, SwiperConfigInterface, SwiperModule} from 'ngx-swiper-wrapper';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {GMapModule} from 'primeng/gmap';
import {GoogleMapsModule} from '@angular/google-maps';
import {FooterModule} from '../components/footer/footer.module';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

const routes: Routes = [
  {
    path: '',
    component: ClientPagesComponent,
    children: [
      {
        path: 'asset/:id',
        component: AssetComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'wallet',
        component: WalletComponent
      },
      {
        path: 'purchase-confirmation',
        component: PurchaseConfirmationComponent
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  declarations: [
    ClientPagesComponent,
    AssetComponent,
    LoginComponent,
    BuyAssetComponent,
    HomeComponent,
    WalletComponent,
    AboutComponent,
    PurchaseConfirmationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FlexLayoutModule,
    FontAwesomeModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    SlickCarouselModule,
    NgxCurrencyModule,
    LightboxModule,
    GalleryModule,
    MatSnackBarModule,
    TableModule,
    MatProgressSpinnerModule,
    ProgressTargetModule,
    AssetCardModule,
    SwiperModule,
    BreadcrumbModule,
    InputNumberModule,
    InputTextModule,
    GMapModule,
    GoogleMapsModule,
    FooterModule
  ],
  entryComponents: [
    LoginComponent,
    BuyAssetComponent
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ]
})
export class ClientPagesModule {
}
