import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {AssetsService} from '../../../services/assets.service';
import {IAsset, IOffer, IOfferResponse} from '../../../interfaces';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import {messages} from '../../../messages';
import {Subscription} from 'rxjs';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';

@Component({
  selector: 'app-setup-offer',
  templateUrl: './setup-offer.component.html',
  styleUrls: ['./setup-offer.component.css']
})
export class SetupOfferComponent implements OnInit, OnDestroy {
  setupOfferForm: FormGroup;
  minDate: Date;
  faQuestion = faQuestionCircle;
  clickedCheckForm = false;
  isPresale = false;
  private subscription: Subscription;
  setupErr = '';

  asset: IAsset;

  customCurrencyMaskConfig = {
    align: 'left',
    allowNegative: false,
    allowZero: false,
    decimal: ',',
    precision: 2,
    prefix: 'R$ ',
    thousands: '.',
  };

  icons = {
    solid: {
      warn: faExclamationCircle,
    }
  };

  constructor(
    public dialogRef: MatDialogRef<SetupOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private assetsService: AssetsService
  ) {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);

    this.setupOfferForm = this.fb.group({
      numShares: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      lot: ['', Validators.required],
      maxHolderShares: ['', Validators.required],
      preSale: ['', Validators.required],
      preSaleEndDate: [this.minDate],
      preSaleThreshold: [0]
    });

    this.initSubscription();
  }

  async ngOnInit() {
    this.asset = this.assetsService.assets.find(asset => asset.recordId === this.data.recordId);

    if (this.asset.offer) {
      this.setupOfferForm.setValue({
        price: this.asset.offer.price,
        lot: this.asset.offer.lot,
        numShares: this.asset.offer.numShares,
        preSale: this.asset.offer.preSale,
        preSaleEndDate: this.asset.offer.preSaleEndDate,
        preSaleThreshold: this.asset.offer.preSaleThreshold,
        maxHolderShares: this.asset.offer.maxHolderShares
      });
    }
  }

  initSubscription() {
    this.subscription = this.setupOfferForm.get('preSale').valueChanges.subscribe(val => {
      if (val === 'true') {
        this.isPresale = true;
        this.setupOfferForm.get('preSaleEndDate').setValidators([Validators.required]);
        this.setupOfferForm.get('preSaleThreshold').setValidators([Validators.required]);
        this.setupOfferForm.get('preSaleEndDate').updateValueAndValidity();
        this.setupOfferForm.get('preSaleThreshold').updateValueAndValidity();
      } else {
        this.isPresale = false;
        this.setupOfferForm.get('preSaleEndDate').clearValidators();
        this.setupOfferForm.get('preSaleThreshold').clearValidators();
        this.setupOfferForm.get('preSaleEndDate').updateValueAndValidity();
        this.setupOfferForm.get('preSaleThreshold').updateValueAndValidity();
      }
    });
  }

  checkForm() {
    this.clickedCheckForm = true;
    this.setupOfferForm.markAllAsTouched();
  }

  parse(input: string): number {
    return parseFloat(input);
  }

  async setupOffer() {
    const offer: IOffer = {
      price: parseFloat(this.setupOfferForm.get('price').value),
      lot: parseFloat(this.setupOfferForm.get('lot').value),
      allowFractionalIncrements: true,
      numShares: parseFloat(this.setupOfferForm.get('numShares').value),
      preSale: this.setupOfferForm.get('preSale').value === 'true',
      preSaleEndDate: this.setupOfferForm.get('preSaleEndDate').value,
      preSaleThreshold: this.setupOfferForm.get('preSaleThreshold').value,
      maxHolderShares: parseFloat(this.setupOfferForm.get('maxHolderShares').value)
    };

    if (offer.numShares > parseFloat(this.asset.supply)) {
      this.setupOfferForm.get('numShares').setErrors({invalid: true});
      this.setupOfferForm.updateValueAndValidity();
      return;
    }
    if (offer.lot > offer.numShares) {
      this.setupOfferForm.get('lot').setErrors({invalid: true});
      this.setupOfferForm.updateValueAndValidity();
      return;
    }
    if (offer.maxHolderShares > offer.numShares) {
      this.setupOfferForm.get('maxHolderShares').setErrors({invalid: true});
      this.setupOfferForm.updateValueAndValidity();
      return;
    }
    if (offer.preSaleThreshold > offer.numShares) {
      this.setupOfferForm.get('preSaleThreshold').setErrors({invalid: true});
      this.setupOfferForm.updateValueAndValidity();
      return;
    }
    if (offer.maxHolderShares < offer.lot) {
      this.setupOfferForm.get('maxHolderShares').setErrors({smaller: true});
      this.setupOfferForm.updateValueAndValidity();
      return;
    }

    if (!offer.preSale) {
      delete offer.preSaleEndDate;
    }

    const setupOfferResult: IOfferResponse = await this.assetsService.setupOffer(this.data.recordId, offer);

    if (setupOfferResult.data) {
      this.setupErr = '';
      this.dialogRef.close({status: true, id: this.data.recordId});
      if (!offer.preSale) {
        await this.assetsService.activateOffer(this.data.recordId);
      }
    } else {
      if (messages[setupOfferResult.message]) {
        this.setupErr = messages[setupOfferResult.message]['pt-BR'];
      } else {
        this.setupErr = 'e';
      }
    }

    // if (setupOfferResult.statusCode !== 200) {
    //   this.snackBar.open(messages[setupOfferResult.message]['pt-BR'], 'OK', {duration: 2000});
    //   return;
    // }

    // if (!setupOfferResult.data) {
    //   this.snackBar.open(messages[setupOfferResult.message]['pt-BR'], 'OK', {duration: 2000});
    //   return;
    // }
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
