import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UploadComponent} from '../components/upload/upload.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {TableModule} from 'primeng/table';


@NgModule({
  declarations: [
    UploadComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatProgressBarModule,
    FlexLayoutModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    FontAwesomeModule,
    MatCheckboxModule,
    MatExpansionModule,
    OverlayPanelModule,
    TableModule
  ],
  exports: [
    UploadComponent
  ]
})
export class BrixSharedModule {
}
