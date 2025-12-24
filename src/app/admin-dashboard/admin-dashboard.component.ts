import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import {faMoneyBill} from '@fortawesome/free-solid-svg-icons/faMoneyBill';
import {faUserAlt} from '@fortawesome/free-solid-svg-icons/faUserAlt';
import {AuthService} from '../services/auth.service';
import {MatSidenav} from '@angular/material/sidenav';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {faSignInAlt} from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import {faInstagram} from '@fortawesome/free-brands-svg-icons/faInstagram';
import {faFacebook} from '@fortawesome/free-brands-svg-icons/faFacebook';
import {faLinkedin} from '@fortawesome/free-brands-svg-icons/faLinkedin';
import {faTwitter} from '@fortawesome/free-brands-svg-icons/faTwitter';

export const menuAnimation = trigger('menuAnimation',
  [
    state('open', style({
      width: '200px',
    })),
    state('void', style({
      width: '50px',
    })),
    transition('void <=> open',
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
  ]);

export const sidenavAnimation = trigger('sidenavAnimation',
  [
    state('open', style({
      'margin-left': '200px',
    })),
    state('void', style({
      'margin-left': '50px',
    })),
    transition('void <=> open',
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
  ]);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  animations: [menuAnimation, sidenavAnimation]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') sidenav: MatSidenav;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  private opened = true;
  private isAnimating = false;
  public animationState = 'open';
  isMobile = false;
  faHome = faHome;
  faSignOutAlt = faSignOutAlt;
  faSignInAlt = faSignInAlt;
  faMoneyBill = faMoneyBill;
  faUserAlt = faUserAlt;
  icons = {
    solid: {
      instagram: faInstagram,
      facebook: faFacebook,
      linkedin: faLinkedin,
      twitter: faTwitter
    }
  };
  private mediaSub: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router, private media: MediaObserver,
    public authService: AuthService
  ) {
  }

  async ngOnInit() {
    if (!this.authService.isLogged) {
      await this.router.navigate(['/home']);
    }

    this.mediaSub = this.media.asObservable().subscribe((change: MediaChange[]) => {
      if (change[0].mqAlias === 'xs') {
        this.sidenav.close();
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  toggleDrawer(isOpen: boolean = !this.opened) {
    if (!this.isAnimating) {
      this.opened = isOpen;
      if (isOpen) {
        this.animationState = 'open';
      } else {
        this.animationState = 'void';
      }
    }
  }

  closeOnMobile() {
    console.log(this.isMobile);
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
  }
}
