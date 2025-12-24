import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FooterComponent} from './footer.component';



@NgModule({
  declarations: [
    FooterComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  exports: [FooterComponent]
})

export class FooterModule { }
