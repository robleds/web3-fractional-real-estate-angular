import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {PageNotFoundComponent} from './pages/page-not-found/page-not-found.component';
// FontAwesome Imports
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faCoins} from '@fortawesome/free-solid-svg-icons/faCoins';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faRulerVertical} from '@fortawesome/free-solid-svg-icons/faRulerVertical';
import {faBed} from '@fortawesome/free-solid-svg-icons/faBed';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import {faAlignLeft} from '@fortawesome/free-solid-svg-icons/faAlignLeft';
import {faSearchDollar} from '@fortawesome/free-solid-svg-icons/faSearchDollar';
import {faExchangeAlt} from '@fortawesome/free-solid-svg-icons/faExchangeAlt';
import {faSyncAlt} from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {faMoneyBill} from '@fortawesome/free-solid-svg-icons/faMoneyBill';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {PagesComponent} from './pages/pages.component';
import {JwtModule} from '@auth0/angular-jwt';
import {DecimalPipe} from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    PagesComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: request => {
          return localStorage.getItem('authToken');
        }
      }
    })
  ],
  entryComponents: [],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(library: FaIconLibrary) {
    // fa solid
    library.addIcons(faWallet);
    library.addIcons(faCoins);
    library.addIcons(faTrashAlt);
    library.addIcons(faRulerVertical);
    library.addIcons(faBed);
    library.addIcons(faCheckCircle);
    library.addIcons(faAlignLeft);
    library.addIcons(faSearchDollar);
    library.addIcons(faExchangeAlt);
    library.addIcons(faSyncAlt);
    library.addIcons(faChevronRight);
    library.addIcons(faArrowRight);
    library.addIcons(faMoneyBill);
    library.addIcons(faInfoCircle);
    library.addIcons(faExclamationCircle);
  }
}
