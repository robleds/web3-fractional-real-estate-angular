import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {LoginComponent} from '../components/login/login.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {faBullhorn} from '@fortawesome/free-solid-svg-icons/faBullhorn';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {faSignInAlt} from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import {faLock} from '@fortawesome/free-solid-svg-icons/faLock';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {MatSidenav} from '@angular/material/sidenav';
import {AuthService} from '../services/auth.service';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faCoins} from '@fortawesome/free-solid-svg-icons/faCoins';
import {faPercentage} from '@fortawesome/free-solid-svg-icons/faPercentage';
import {faHandHolding} from '@fortawesome/free-solid-svg-icons/faHandHolding';
import {faChartLine} from '@fortawesome/free-solid-svg-icons/faChartLine';
import {faInstagram} from '@fortawesome/free-brands-svg-icons/faInstagram';
import {faFacebook} from '@fortawesome/free-brands-svg-icons/faFacebook';
import {faLinkedin} from '@fortawesome/free-brands-svg-icons/faLinkedin';
import {faTwitter} from '@fortawesome/free-brands-svg-icons/faTwitter';

@Component({
  selector: 'app-client-pages',
  templateUrl: './client-pages.component.html',
  styleUrls: ['./client-pages.component.css']
})
export class ClientPagesComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') sidenav: MatSidenav;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches)
  );
  icons = {
    solid: {
      cog: faCog,
      signInAlt: faSignInAlt,
      signOutAlt: faSignOutAlt,
      search: faSearch,
      lock: faLock,
      question: faQuestionCircle,
      bullhorn: faBullhorn,
      instagram: faInstagram,
      facebook: faFacebook,
      linkedin: faLinkedin,
      twitter: faTwitter
    }
  };

  private mediaSub: Subscription;

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private media: MediaObserver,
    public authService: AuthService
  ) {
  }

  ngOnInit() {
    this.mediaSub = this.media.asObservable().subscribe((change: MediaChange[]) => {
      if (change[0].mqAlias === 'xs') {
        this.sidenav.close();
      }
    });
    if (this.authService.requiredLogin && !this.authService.isLogged) {
      this.openLoginDialog();
    }
  }

  openAdvertiseDialog(): void {
    if (!this.authService.isLogged) {
      const dRef = this.dialog.open(LoginComponent, {
        // width: '860px',
        panelClass: 'login-modal'
      });

      dRef.afterClosed().subscribe(async result => {
        if (result !== '') {
        }
      });
    }
  }

  openLoginDialog(): void {
    const dRef = this.dialog.open(LoginComponent, {
      width: '860px',
      panelClass: 'login-modal'
    });

    dRef.afterClosed().subscribe(async result => {
      if (result !== '') {
      }
    });
  }

  async logOut() {
    await this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
  }
}
