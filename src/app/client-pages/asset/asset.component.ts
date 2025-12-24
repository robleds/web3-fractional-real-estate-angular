import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {GalleryComponent, GalleryItem, ImageItem} from '@ngx-gallery/core';

import {IAsset, IOffer} from '../../interfaces';
import {LoginComponent} from '../../components/login/login.component';
import {BuyAssetComponent} from '../../components/buy-asset/buy-asset.component';
import {AssetsService} from '../../services/assets.service';
import {AuthService} from '../../services/auth.service';
import {messages} from '../../messages';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {MenuItem} from 'primeng/api';
import {FormControl, Validators} from '@angular/forms';
import {faCoins} from '@fortawesome/free-solid-svg-icons/faCoins';
import {faPercentage} from '@fortawesome/free-solid-svg-icons/faPercentage';
import {faHandHolding} from '@fortawesome/free-solid-svg-icons/faHandHolding';
import {faChartLine} from '@fortawesome/free-solid-svg-icons/faChartLine';
import {fromEvent, Subscription} from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css']
})
export class AssetComponent implements OnInit, OnDestroy {

  @ViewChild(GalleryComponent) gallery: GalleryComponent;

  public asset: IAsset;
  public offer: IOffer;
  breadcrumb: MenuItem[];
  home: MenuItem;
  icons = {
    solid: {
      exclamation: faExclamationCircle,
      coins: faCoins,
      percentage: faPercentage,
      hand: faHandHolding,
      chart: faChartLine
    }
  };

  // @ts-ignore
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    fullscreenControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    styles: [
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{color: '#fa7600'}]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [{color: '#f2f2f2'}]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{visibility: 'on'}]
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [{saturation: -100}, {lightness: 10}]
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [{visibility: 'simplified'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [{color: '#25a9db'}, {visibility: 'on'}]
      }
    ]
  };
  public markers: any[] = [{
    position: {
      lat: 0,
      lng: 0
    }
  }];
  public mapCenter: { lat: number, lng: number };
  public mapLoaded = false;

  amount: FormControl;
  shareOwned: string;
  userRent: string;
  roi: string;
  totalCost: string;

  slideConfig = {
    slidesToShow: 3, slidesToScroll: 3, dots: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  recordId: string;
  private items: GalleryItem[];
  public progressData: any;
  private readonly sub: Subscription;
  public btnIsVisible = true;
  private scrollSub: Subscription;
  private scrollSubMobile: Subscription;
  private resizeSub: Subscription;
  private scrollTestBreakpoint = 694;
  private buyBtn: HTMLElement;
  private toolbar: Element;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public assetsService: AssetsService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {

    this.amount = new FormControl(null, Validators.required);
    this.sub = this.amount.valueChanges.subscribe(value => {
      if (value !== null) {
        const asset = this.assetsService.selectedAsset;
        this.shareOwned = asset.shareOwned(value);
        this.userRent = asset.userRent(value);
        this.roi = asset.roi(value);
        this.totalCost = asset.totalCost(value);
      }
    });
  }

  testWindowSize() {
    if (window.innerWidth < this.scrollTestBreakpoint) {
      if (!this.scrollSub) {
        // run scroll check once before scrolling starts
        this.isScrolledIntoView();
        this.scrollSub = fromEvent(window, 'scroll', {passive: true}).subscribe(this.isScrolledIntoView.bind(this));
      }
    } else {
      if (this.scrollSub) {
        this.scrollSub.unsubscribe();
        this.scrollSub = null;
      }
      this.btnIsVisible = true;
    }
  }

  isScrolledIntoView() {
    try {
      if (window.innerWidth > this.scrollTestBreakpoint) {
        this.btnIsVisible = true;
        return;
      }
      if (!this.buyBtn) {
        this.buyBtn = document.getElementById('buy-btn');
        if (!this.buyBtn) {
          return;
        }
      }
      if (!this.toolbar) {
        const query = document.getElementsByClassName('client-toolbar');
        if (query.length === 0) {
          return;
        } else {
          this.toolbar = query[0];
        }
      }
      const docViewTop = this.toolbar.clientHeight;
      const docViewBottom = window.innerHeight;
      const elemTop = this.buyBtn.getBoundingClientRect().y;
      const elemBottom = elemTop + this.buyBtn.offsetHeight;
      if ((elemBottom < docViewBottom) && (elemBottom > docViewTop)) {
        this.btnIsVisible = elemTop > docViewTop;
      } else {
        this.btnIsVisible = false;
      }
      // console.log('visible:', this.btnIsVisible);
    } catch (e) {
      console.log(e);
    }
  }

  async ngOnInit() {

    // run check once before window resize starts
    this.testWindowSize();
    this.resizeSub = fromEvent(window, 'resize').subscribe(this.testWindowSize.bind(this));

    this.home = {icon: 'pi pi-home', routerLink: '/'};
    this.recordId = this.route.snapshot.paramMap.get('id');
    console.log(`Loading asset: ${this.recordId}`);
    if (!this.assetsService.selectedAsset) {
      await this.assetsService.selectAsset(this.recordId);
    }
    this.breadcrumb = [
      {label: this.assetsService.selectedAsset.type},
      {label: this.assetsService.selectedAsset.address.city},
      {label: this.assetsService.selectedAsset.address.neighborhood},
      {icon: 'pi pi-map-marker'},
    ];
    const offer = this.assetsService.selectedAsset.offer;
    if (offer) {
      this.progressData = {
        total: offer.numShares,
        current: offer.numShares - offer.availableBalance,
        targets: [{
          value: offer.preSaleThreshold,
          label: `META: ${offer.preSaleThreshold} FRAÇÕES`,
          color: '#25a9db'
        }],
      };
    }
    setTimeout(this.loadGallery.bind(this), 10);
    setTimeout(() => {
      this.isScrolledIntoView();
    }, 500);
    // this.initMap();
  }

  initMap() {
    const geocoder = new google.maps.Geocoder();
    const {street, neighborhood, city, state} = this.assetsService.selectedAsset.address;
    const address = `${street},${neighborhood},${city},${state}`;
    console.log(address);
    geocoder.geocode({address}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const markerOptions = {
          position: {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          },
          title: this.assetsService.selectedAsset.title
        };
        this.markers = [markerOptions];
        this.mapLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadGallery() {
    this.items = this.assetsService.selectedAsset.gallery.map(item => {
      return new ImageItem({
        src: item.src,
        thumb: item.src
      });
    });
    this.gallery.load(this.items);
  }

  parse(input: string): number {
    return parseFloat(input);
  }

  selectMin() {
    this.amount.setValue(this.assetsService.selectedAsset.offer.lot);
  }

  selectMax() {
    const max = this.findMax();
    this.amount.setValue(max);
  }

  findMax() {
    if (this.assetsService.selectedAsset.offer.maxHolderShares <= this.assetsService.selectedAsset.offer.availableBalance) {
      return this.assetsService.selectedAsset.offer.maxHolderShares;
    } else {
      return this.assetsService.selectedAsset.offer.availableBalance;
    }
  }

  openBuyDialog(): void {
    if (this.authService.isLogged) {
      if (this.authService.userData.status < 3) {
        return;
      }

      const dRef = this.dialog.open(BuyAssetComponent, {
        width: '860px',
        panelClass: 'width-dialog',
        data: {
          asset: this.assetsService.selectedAsset,
          amount: this.amount.value
        }
      });

      dRef.afterClosed().subscribe(async result => {
        if (result) {
          this.assetsService.purchaseData = result.data;
          this.snackBar.open(messages.SUCCESS_ORDER_CREATE['pt-BR'], 'OK', {duration: 3000});
          this.assetsService.loadAssets(this.assetsService.selectedAsset.recordId).catch(console.log);

          await this.router.navigate(['/purchase-confirmation']);
        }
      });
    } else {
      const dRef = this.dialog.open(LoginComponent, {
        width: '860px',
        panelClass: 'login-modal'
      });

      dRef.afterClosed().subscribe(async result => {
        if (result) {
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.scrollSub) {
      this.scrollSub.unsubscribe();
    }

    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }
}
