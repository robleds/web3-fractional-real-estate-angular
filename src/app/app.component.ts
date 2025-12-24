import {Component} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeBR from '@angular/common/locales/pt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    registerLocaleData(localeBR, 'pt-BR');
  }
}
