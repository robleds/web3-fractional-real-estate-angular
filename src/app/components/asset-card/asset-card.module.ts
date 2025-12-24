import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AssetCardComponent} from './asset-card.component';
import {SlickCarouselModule} from 'ngx-slick-carousel';
import {MatCardModule} from '@angular/material/card';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';



@NgModule({
  declarations: [
    AssetCardComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatCardModule,
    SlickCarouselModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [AssetCardComponent]
})
export class AssetCardModule { }
