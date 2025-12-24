import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {AssetsComponent} from './assets/assets.component';
import {SlickCarouselModule} from 'ngx-slick-carousel';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AddAssetComponent} from './assets/add-asset/add-asset.component';
import {MatIconModule} from '@angular/material/icon';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgxMaskModule} from 'ngx-mask';
import {SetupOfferComponent} from './assets/setup-offer/setup-offer.component';
import {AddressService} from '../services/address.service';
import {ManageUsersComponent} from './manage-users/manage-users.component';
import {ManagePurchaseOrdersComponent} from './manage-purchase-orders/manage-purchase-orders.component';
import {DataViewModule} from 'primeng/dataview';
import {TableModule} from 'primeng/table';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {UserInfoComponent} from '../components/user-info/user-info.component';
import {AdminGuard} from '../services/admin.guard';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {ConfirmationDialogComponent} from '../components/confirmation-dialog/confirmation-dialog.component';
import {BrixSharedModule} from '../shared/shared.module';
import {AssetCardModule} from '../components/asset-card/asset-card.module';
import {MatStepperModule} from '@angular/material/stepper';
import {NgxCurrencyModule} from 'ngx-currency';
import {FooterModule} from '../components/footer/footer.module';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: 'assets',
        component: AssetsComponent
      },
      {
        path: 'users',
        component: ManageUsersComponent
      },
      {
        path: 'orders',
        component: ManagePurchaseOrdersComponent
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
  declarations: [
    AdminDashboardComponent,
    AssetsComponent,
    AddAssetComponent,
    SetupOfferComponent,
    ManageUsersComponent,
    ManagePurchaseOrdersComponent,
    UserInfoComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BrixSharedModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatTableModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    DataViewModule,
    TableModule,
    MatExpansionModule,
    NgxMaskModule.forRoot(),
    SlickCarouselModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AssetCardModule,
    MatStepperModule,
    NgxCurrencyModule,
    FooterModule
  ],
  entryComponents: [
    AddAssetComponent,
    SetupOfferComponent,
    UserInfoComponent,
    ConfirmationDialogComponent
  ],
  exports: [RouterModule],
  providers: [AddressService]
})

export class AdminDashboardModule {
}
