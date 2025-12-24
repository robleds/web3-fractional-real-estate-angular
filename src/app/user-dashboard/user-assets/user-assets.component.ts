import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AssetsService} from '../../services/assets.service';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {DataView} from 'primeng/dataview';
import {IAsset} from '../../interfaces';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';

@Component({
  selector: 'app-user-assets',
  templateUrl: './user-assets.component.html',
  styleUrls: ['./user-assets.component.css']
})
export class UserAssetsComponent implements OnInit, OnDestroy {
  slideConfig = {slidesToShow: 1, slidesToScroll: 1, dots: true};
  mediaSub: Subscription;
  disableList = false;
  dvLoaded = false;
  faCheck = faCheck;
  assetsData = [];

  @ViewChild('dv')
  dv: DataView;

  constructor(public assetsService: AssetsService,
              private cdr: ChangeDetectorRef,
              private media: MediaObserver) {
  }

  ngOnInit(): void {
    // this.assetsService.getBalances().then(async value => {
    //   if (this.assetsService.assets.length > 0) {
    //     this.assetsService.assets = this.assetsService.assets.filter(asset => {
    //       const idx = value.data.findIndex(el => el.recordId === asset.recordId);
    //       return idx !== -1;
    //     });
    //   }
    //   for (const item of value.data) {
    //     if (this.assetsService.assets.findIndex(a => a.recordId === item.recordId) === -1) {
    //       await this.assetsService.loadAssets(item.recordId);
    //     }
    //   }
    // });

    this.assetsService.loadAssets().then(async () => {
      const balances = (await this.assetsService.getBalances()).data;
      for (const balance of balances) {
        const _asset = this.assetsService.assets.find((asset: IAsset) => asset.recordId === balance.recordId);
        if (_asset) {
          this.assetsData.push({asset: _asset, balance});
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.mediaSub) {
      this.mediaSub.unsubscribe();
    }
  }

  public detectBreakPoints() {
    if (!this.dvLoaded) {
      this.dvLoaded = true;
      this.mediaSub = this.media.asObservable().subscribe((change: MediaChange[]) => {
        this.cdr.detectChanges();
        if (this.dv) {
          if (change[1].mqAlias === 'lt-md') {
            this.disableList = true;
            this.dv.changeLayout('grid');
            // this.dv.layout = 'grid';
            // this.cdr.detectChanges();
          }
          if (change[3].mqAlias === 'gt-sm') {
            this.disableList = false;
            // this.dv.changeLayout('grid');
            // this.dv.layout = 'grid';
          }
        }
      });
    }
  }

  public changeLayout(event: Event, layout: string) {
    this.dv.changeLayout(layout);
    event.preventDefault();
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

  public async onSelect(asset: IAsset) {
    await window.open('/asset/' + asset.recordId);
  }

}
