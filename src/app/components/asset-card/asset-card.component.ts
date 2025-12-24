import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {IAsset, IOfferResponse} from '../../interfaces';
import {AssetsService} from '../../services/assets.service';
import {Router} from '@angular/router';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {messages} from '../../messages';
import {MatDialog} from '@angular/material/dialog';
import {SetupOfferComponent} from '../../admin-dashboard/assets/setup-offer/setup-offer.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {AddAssetComponent} from '../../admin-dashboard/assets/add-asset/add-asset.component';
import {firstValueFrom} from 'rxjs';
import {first} from 'rxjs/operators';
import {faImage} from '@fortawesome/free-regular-svg-icons/faImage';

interface SliderConfig {
  slidesToShow?: number;
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  swipe?: boolean;
  responsive?: any[];
}

@Component({
  selector: 'app-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.css', './asset-list.component.css']
})
export class AssetCardComponent implements OnInit {
  @Input()
  asset: any;

  @Input()
  format: string;

  @Input()
  category: string;


  cardConfig: SliderConfig = {slidesToShow: 1, slidesToScroll: 1, dots: true};
  listConfig: SliderConfig = {slidesToShow: 1, slidesToScroll: 1, dots: true};

  icons = {
    solid: {
      checkCircle: faCheckCircle,
      exclamationCircle: faExclamationCircle,
    },
    regular: {
      image: faImage
    }
  };

  constructor(private assetsService: AssetsService, private router: Router, private dialog: MatDialog, private snackBar: MatSnackBar,
              private authService: AuthService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
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
    if (target) {
      if (target.classList.contains('slick-arrow')) {
        asset.showArrow = true;
        target.addEventListener('mouseleave', () => {
          asset.showArrow = false;
        }, {once: true});
      } else {
        asset.showArrow = false;
      }
    }
  }

  shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) {
      return str;
    }
    return (str.substr(0, str.lastIndexOf(separator, maxLen)) + '...');
  }


  // ADMIN FUNCTIONS START
  async openEditDialog(step: number) {
    console.log(this.asset);
    const dRef = this.dialog.open(AddAssetComponent, {
      panelClass: 'width-dialog',
      maxHeight: '100vh',
      data: {
        editMode: true,
        asset: this.asset,
        step,
      }
    });
    const status = await firstValueFrom(dRef.afterClosed());
    if (status) {
      if (step === 1) {
        this.assetsService.assets.find(value => value.recordId === this.asset.recordId).gallery = null;
      }
      this.assetsService.loadAssets().catch(console.log);
    }
  }

  async openSetupOfferDialog() {
    const dRef = this.dialog.open(SetupOfferComponent, {
      width: '500px',
      panelClass: 'width-dialog',
      maxHeight: '100vh',
      data: {recordId: this.asset.recordId}
    });
    const result = await firstValueFrom(dRef.afterClosed());
    if (result && result.status) {
      this.snackBar.open(messages.SUCCESS_OFFER_SETUP['pt-BR'], 'Ok', {duration: 3000});
      this.assetsService.loadAssets().catch(console.log);
    }
  }

  public async onDeleteOffer(recordId: string) {
    const dRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remover Oferta',
        description: `Tem certeza que deseja remover a oferta do imóvel ${recordId}?`
      }
    });
    const status = await firstValueFrom(dRef.afterClosed());
    if (status) {
      const result = await this.assetsService.deleteOffer(recordId);
      if (result.statusCode !== 200) {
        this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
        return;
      }
      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 3000});
      this.assetsService.loadAssets(recordId).catch(console.log);
      this.cdr.detectChanges();
    }
  }

  public async onActivateOffer(recordId: string) {
    const result = await this.assetsService.activateOffer(recordId);

    if (result.statusCode !== 200) {
      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
      return;
    }

    this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 3000});

    this.assetsService.loadAssets(recordId).catch(console.log);
    // this.assetsService.loadAssets(recordId).catch(console.log).finally(this.detectBreakPoints.bind(this));
  }

  public async onDeactivateOffer(recordId: string) {
    const result = await this.assetsService.deactivateOffer(recordId);

    if (result.statusCode !== 200) {
      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
      return;
    }

    this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 3000});

    this.assetsService.loadAssets(recordId).catch(console.log);
    // this.assetsService.loadAssets(recordId).catch(console.log).finally(this.detectBreakPoints.bind(this));
  }

  async onDeleteAsset(recordId: string) {
    const dRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remover Imóvel',
        description: `Tem certeza que deseja remover o imóvel ${recordId}?`
      }
    });
    const status = await firstValueFrom(dRef.afterClosed());
    if (status) {
      const selectedIdx = this.assetsService.assets.findIndex((asset: IAsset) => asset.recordId === recordId);
      const selectedAsset = this.assetsService.assets[selectedIdx];
      if (selectedAsset.offer) {
        this.snackBar.open(messages.FAILED_ASSET_DELETE_HAS_OFFER['pt-BR'], 'OK', {duration: 2000});
        return;
      }
      const result = await this.assetsService.deleteAsset(recordId);
      if (result.statusCode !== 200) {
        this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
        return;
      }
      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 3000});
      this.assetsService.assets.splice(selectedIdx, 1);
    }
  }

  public async onIncomePayment(asset: IAsset) {
    const holdersData = (await this.assetsService.getHolders(asset.recordId)).data;

    for (const data of holdersData) {
      const accountInfo: any = await this.authService.getAccountInfo(data.account);

      data.yield = data.balance * asset.netRent / parseFloat(asset.supply);

      if (!accountInfo.status || !accountInfo.user) {
        continue;
      }

      data.firstName = accountInfo.user.firstName;
      data.lastName = accountInfo.user.lastName;
      data.email = accountInfo.user.email;

      if (accountInfo.user.bankAccountInfo) {
        data.bank = accountInfo.user.bankAccountInfo.bank;
        data.bankBranch = accountInfo.user.bankAccountInfo.branch;
        data.bankAccount = accountInfo.user.bankAccountInfo.account;
      }
    }

    this.assetsService.exportIncomePaymentFile(holdersData);
  }

  // ADMIN FUNCTIONS END

  public detectChanges() {
    this.cdr.detectChanges();
  }

}
