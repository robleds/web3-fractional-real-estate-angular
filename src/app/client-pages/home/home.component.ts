import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {IAsset} from '../../interfaces';
import {AssetsService} from '../../services/assets.service';
import {Carousel} from 'primeng/carousel';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import {faMapMarkerAlt} from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import {faInfo} from '@fortawesome/free-solid-svg-icons/faInfo';
import {faBullhorn} from '@fortawesome/free-solid-svg-icons/faBullhorn';

interface SliderConfig {
  slidesToShow?: number;
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  swipe?: boolean;
  responsive?: any[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  activeOfferAssets: IAsset[];
  minCost: number;
  icons = {
    solid: {
      chevronRight: faChevronRight,
      chevronLeft: faChevronLeft,
      marker: faMapMarkerAlt,
      info: faInfo,
      bullhorn: faBullhorn
    }
  };

  swiperConfig: SwiperConfigInterface;
  bannerConfig: SwiperConfigInterface;
  swiperLoaded = false;

  constructor(
    private router: Router,
    public assetsService: AssetsService,
    private cdr: ChangeDetectorRef,
  ) {
    this.activeOfferAssets = [];
    Carousel.prototype.onTouchMove = () => {
    };
  }

  ngOnInit() {

    this.assetsService.loadAssets().catch(console.log).finally(() => {
      this.assetsService.assets.forEach((asset: IAsset) => {
        if (asset.offer && asset.offer.active) {
          this.activeOfferAssets.push(asset);
        }
      });
    });
    this.bannerConfig = {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'progressbar',
      },
      autoplay: {
        delay: 5500,
        disableOnInteraction: true,
      },
      parallax: true,
      speed: 600,
      slidesPerView: 1
    };

    this.swiperConfig = {
      navigation: {
        nextEl: '.swiper-button-next-outside',
        prevEl: '.swiper-button-prev-outside',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      slidesPerView: 'auto',
      breakpoints: {
        715: {
          slidesPerView: 'auto',
        },
        716: {
          slidesPerView: 'auto',
        },
        959: {
          slidesPerView: 3,
        },
        1136: {
          slidesPerView: 4,
        },
      }
    };
  }

  checkCenter(swiper) {
    if (swiper.swiperSlides) {
      if (swiper.swiperSlides.nativeElement.childElementCount < swiper.config.breakpoints[959].slidesPerView ||
        swiper.swiperSlides.nativeElement.childElementCount < swiper.config.breakpoints[1136].slidesPerView) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  shortenDesc(str: string, maxLen: number) {
    const pindex = str.indexOf('\n');
    if (pindex <= maxLen && pindex > 0) {
      return str.substr(0, pindex);
    }
    const dindex = str.indexOf('.');
    if (dindex <= maxLen && dindex > 0) {
      return str.substr(0, dindex + 1);
    }
    const sindex = str.lastIndexOf(' ', maxLen);
    if (sindex <= maxLen && sindex > 0) {
      return str.substr(0, sindex) + '...';
    }
    if (str.length <= maxLen) {
      return str;
    } else {
      return str.substr(0, maxLen) + '...';
    }
  }

  async onSelect(asset: IAsset, category?: string) {
    if (category && category !== 'home') {
      return;
    }
    this.assetsService.selectAsset(asset.recordId).catch(console.log);
    await this.router.navigate(['/asset/' + asset.recordId]);
  }

  onMouseEnter(event: MouseEvent, asset: IAsset) {
    asset.showArrow = true;
  }

  onMouseLeave(event: MouseEvent, asset: IAsset) {
    const target = event.relatedTarget as HTMLElement;
    if (target.classList.contains('slick-arrow')) {
      asset.showArrow = true;
      target.addEventListener('mouseleave', () => {
        asset.showArrow = false;
      }, {once: true});
    } else {
      asset.showArrow = false;
    }
  }

  shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) {
      return str;
    }
    return (str.substr(0, str.lastIndexOf(separator, maxLen)) + '...');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.swiperLoaded = true;
      this.cdr.detectChanges();
    }, 400);

  }
}
