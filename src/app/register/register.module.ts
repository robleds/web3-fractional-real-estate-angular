import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RegisterComponent} from '../onboarding-pages/register/register.component';
import {NewPasswordComponent} from '../onboarding-pages/new-password/new-password.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrixSharedModule} from '../shared/shared.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {NgxMaskModule} from 'ngx-mask';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterModule} from '@angular/router';
import {FooterModule} from '../components/footer/footer.module';


@NgModule({
  declarations: [
    RegisterComponent,
    NewPasswordComponent
  ],
  imports: [
    CommonModule,
    BrixSharedModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatToolbarModule,
    FontAwesomeModule,
    MatStepperModule,
    MatRadioModule,
    NgxMaskModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTooltipModule,
    MatAutocompleteModule,
    OverlayModule,
    MatProgressBarModule,
    RouterModule,
    FooterModule
  ]
})
export class RegisterModule {
}
