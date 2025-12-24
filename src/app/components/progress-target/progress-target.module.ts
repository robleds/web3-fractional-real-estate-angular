import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressComponent} from './progress/progress.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    ProgressComponent
  ],
  exports: [
    ProgressComponent
  ],
  imports: [
    CommonModule,
  ]
})
export class ProgressTargetModule {

}
