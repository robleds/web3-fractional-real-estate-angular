import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {Observable, Subscription} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {Event, NavigationEnd, Router} from '@angular/router';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {AuthService} from '../services/auth.service';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import {faUserAlt} from '@fortawesome/free-solid-svg-icons/faUserAlt';
import {faSignInAlt} from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import {faLock} from '@fortawesome/free-solid-svg-icons/faLock';
import {faIdCard} from '@fortawesome/free-solid-svg-icons/faIdCard';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {faArchive} from '@fortawesome/free-solid-svg-icons/faArchive';
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
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  animations: [menuAnimation, sidenavAnimation]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') sidenav: MatSidenav;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  isMobile = false;
  private opened = true;
  private isAnimating = false;
  public animationState = 'open';
  showFooter = true;
  faHome = faHome;
  faSignOutAlt = faSignOutAlt;
  faSignInAlt = faSignInAlt;
  faUserAlt = faUserAlt;
  faLock = faLock;
  faIdCard = faIdCard;
  faFiles = faArchive;
  private mediaSub: Subscription;
  private routeSub: Subscription;

  icons = {
    solid: {
      instagram: faInstagram,
      facebook: faFacebook,
      linkedin: faLinkedin,
      twitter: faTwitter
    }
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private media: MediaObserver,
    public authService: AuthService
  ) {

  }

  async ngOnInit() {
    this.checkFooter(window.location.pathname);
    this.routeSub = this.router.events.subscribe((value: Event) => {
      if (value instanceof NavigationEnd) {
        this.checkFooter(value.url);
      }
    });
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

  closeOnMobile() {
    console.log(this.isMobile);
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  checkFooter(url: string) {
    if (url.startsWith('/user/update-info') || url.startsWith('/user/update-pass')) {
      this.showFooter = false;
    } else {
      this.showFooter = true;
    }
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

  ngOnDestroy(): void {
    this.mediaSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

}
