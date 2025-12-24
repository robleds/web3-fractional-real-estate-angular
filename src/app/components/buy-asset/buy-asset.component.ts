import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs/operators';
import {AssetsService} from '../../services/assets.service';
import {IAsset, IPurchaseOrder, IPurchaseOrderResponse} from '../../interfaces';
import {messages} from '../../messages';
import {Observable, Subscription} from 'rxjs';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faCoins} from '@fortawesome/free-solid-svg-icons/faCoins';
import {faPercentage} from '@fortawesome/free-solid-svg-icons/faPercentage';
import {faHandHolding} from '@fortawesome/free-solid-svg-icons/faHandHolding';
import {faChartLine} from '@fortawesome/free-solid-svg-icons/faChartLine';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faAsterisk} from '@fortawesome/free-solid-svg-icons/faAsterisk';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-buy-asset',
  templateUrl: './buy-asset.component.html',
  styleUrls: ['./buy-asset.component.css']
})
export class BuyAssetComponent implements OnInit, OnDestroy {
  amount: FormControl;
  shareOwned: string;
  userRent: string;
  roi: string;
  totalCost: string;

  private sub: Subscription;

  icons = {
    solid: {
      exclamation: faExclamationCircle,
      coins: faCoins,
      percentage: faPercentage,
      hand: faHandHolding,
      chart: faChartLine,
      info: faInfoCircle,
      asterisk: faAsterisk
    }
  };

  HandsetPortrait$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.HandsetPortrait)
    .pipe(
      map(result => result.matches),
    );

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BuyAssetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private snackBar: MatSnackBar,
    private assetsService: AssetsService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.amount = new FormControl(null, Validators.required);
    this.sub = this.amount.valueChanges.subscribe(value => {
      if (value !== null) {
        const asset = this.assetsService.selectedAsset;
        this.shareOwned = asset.shareOwned(value);
        this.userRent = asset.userRent(value);
        this.roi = asset.roi(value);
        this.totalCost = asset.totalCost(value);
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    if (this.data.amount) {
      console.log(this.data.amount);
      this.amount.patchValue(this.data.amount);
    }
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

  scrollToBottom() {
    const objDiv = document.getElementById('infos');
    console.log(objDiv);
    setTimeout(() => {
      // objDiv.scrollIntoView({ behavior: 'smooth', block: 'end'});
      objDiv.scrollIntoView(false);
    }, 50);
  }

  async buyAsset() {
    const order: IPurchaseOrder = {
      quantity: this.amount.value * this.data.asset.offer.price
    };

    const createPurchaseOrderResult: IPurchaseOrderResponse = await this.assetsService.createPurchaseOrder(this.data.asset.recordId, order);

    if (createPurchaseOrderResult.statusCode !== 200) {
      this.snackBar.open(messages[createPurchaseOrderResult.message]['pt-BR'], 'OK', {duration: 2000});
      return;
    }

    if (!createPurchaseOrderResult.data) {
      this.snackBar.open(messages[createPurchaseOrderResult.message]['pt-BR'], 'OK', {duration: 2000});
      return;
    }

    this.dialogRef.close(createPurchaseOrderResult);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
