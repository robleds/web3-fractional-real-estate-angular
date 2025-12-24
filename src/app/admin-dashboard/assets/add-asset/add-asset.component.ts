import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AddressService} from '../../../services/address.service';
import {AssetsService} from '../../../services/assets.service';
import {IAddress, IAsset} from '../../../interfaces';
import {environment} from '../../../../environments/environment';
import {messages} from '../../../messages';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {MatHorizontalStepper} from '@angular/material/stepper';
import {firstValueFrom, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent implements OnInit, OnDestroy {
  public assetForm: FormGroup;
  public docsForm: FormGroup;
  docStep: FormControl;

  public assetTypes: any[];
  public hasZipCode: boolean;
  clickedCheckForm = false;
  registerSuccess = false;
  registerErr = '';
  uploadSuccess = false;
  uploadErr = '';

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
      chevronRight: faChevronRight,
      check: faCheck,
      warn: faExclamationCircle,
    }
  };
  private stateSub: Subscription;
  updated = false;
  private docsSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private assetsService: AssetsService,
    public addressService: AddressService,
    public dialogRef: MatDialogRef<AddAssetComponent>,
    private http: HttpClient,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.assetForm = this.fb.group({
      address: this.fb.group({
        country: ['Brasil', Validators.required],
        zipCode: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        neighborhood: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
      }),
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      totalArea: ['', [Validators.required, Validators.min(1)]],
      grossLettableArea: ['', [Validators.required, Validators.min(1)]],
      rented: ['', Validators.required],
      netRent: ['', [Validators.required, Validators.min(1)]],
      supply: ['', [Validators.required, Validators.min(1)]],
      recordId: ['', Validators.required],
    });
    this.docsForm = this.fb.group({
      images: [[], Validators.required],
      documents: [[], Validators.required]
    });
    this.docStep = new FormControl(null, Validators.required);
    this.assetTypes = [];
    this.hasZipCode = false;

    if (data.editMode && data.asset) {
      this.loadOnEditMode().catch(console.log);
    }

    this.docsSub = this.docsForm.valueChanges.subscribe(value => {
      console.log(value);
      if (value.images.length > 0 || value.documents.length > 0) {
        this.updated = true;
      }
    });
  }

  async ngOnInit() {
    this.assetTypes = environment.assets.assetTypes;

    if (this.addressService.states.length === 0) {
      status = await firstValueFrom(this.addressService.events.asObservable());
    } else {
      status = 'LOADED_STATES';
    }

    if (status === 'LOADED_STATES') {
      this.stateSub = this.assetForm.get('address').get('state').valueChanges.subscribe((value) => {
        if (value !== this.addressService.lastLoadState) {
          this.assetForm.get('address').get('city').reset();
          const selectedState: any = this.addressService.states.find((state: any) => state.code === value);
          this.addressService.searchCities(selectedState.id).catch(console.log);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.stateSub) {
      this.stateSub.unsubscribe();
    }

    if (this.docsSub) {
      this.docsSub.unsubscribe();
    }
  }

  async loadDocuments() {
    try {
      const url = `${environment.apiHost}/admin/getDocuments/${this.data.asset.recordId}`;
      const getDocs$ = this.http.get(url, this.auth.buildOptions());
      const results = await firstValueFrom(getDocs$) as any;
      if (results.status) {
        const _docs = [];
        const _images = [];
        for (const doc of results.docs) {

          console.log(doc);

          if (doc.docType === 1) {
            _images.push({
              extension: doc.extension,
              hash: doc.hash
            });
          }

          if (doc.docType === 2) {
            _docs.push({
              extension: doc.extension,
              hash: doc.hash
            });
          }
        }
        this.docsForm.get('images').setValue(_images);
        this.docsForm.get('documents').setValue(_docs);
        this.docsForm.updateValueAndValidity();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async loadOnEditMode() {

    if (this.data.step === 1) {
      await this.loadDocuments();
    }

    const asset = this.data.asset;
    let status;

    if (this.addressService.states.length === 0) {
      status = await firstValueFrom(this.addressService.events.asObservable());
    } else {
      status = 'LOADED_STATES';
    }

    if (status === 'LOADED_STATES') {
      const state = this.addressService.states.find(value => value.code === asset.address.state);
      if (state) {
        await this.addressService.searchCities(state.code);
      }
    }

    this.assetForm.patchValue(asset);
    this.assetForm.patchValue({
      rented: (asset.rented === 'yes' || asset.rented === true) ? 'yes' : 'no'
    });
    this.assetForm.get('recordId').disable();
    this.assetForm.get('supply').disable();
    this.assetForm.updateValueAndValidity();
  }

  checkForm() {
    this.clickedCheckForm = true;
    this.assetForm.markAllAsTouched();
  }

  loadAddress() {
    const zipCode = this.assetForm.get('address').get('zipCode').value;

    this.addressService.searchZipCode(zipCode).then((address: IAddress) => {
      if (!address) {
        this.hasZipCode = false;
        return;
      }

      // Set state independently to avoid city value from being erased
      this.assetForm.get('address').get('state').setValue(address.state);
      this.assetForm.get('address').get('state').disable();

      this.assetForm.get('address').patchValue({
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city
      });

      this.assetForm.get('address').get('street').disable();
      this.assetForm.get('address').get('neighborhood').disable();
      this.assetForm.get('address').get('city').disable();

      this.hasZipCode = true;
    }).catch(() => {
      this.hasZipCode = false;
    });
  }

  async onSubmit(stepper: MatHorizontalStepper) {
    const assetData = this.assetForm.getRawValue();
    const asset: IAsset = {
      recordId: assetData.recordId,
      supply: parseFloat(assetData.supply).toFixed(2),
      title: assetData.title,
      description: assetData.description,
      type: assetData.type,
      address: assetData.address,
      totalArea: parseFloat(assetData.totalArea),
      grossLettableArea: parseFloat(assetData.grossLettableArea),
      rented: assetData.rented === 'yes',
      netRent: parseFloat(assetData.netRent)
    };
    if (asset.grossLettableArea > asset.totalArea) {
      this.assetForm.get('grossLettableArea').setErrors({invalid: true});
      this.assetForm.updateValueAndValidity();
      return;
    }

    const addAssetResult: any = await this.assetsService[this.data.editMode ? 'upsertAsset' : 'addAsset'](asset);
    if (addAssetResult.data) {
      this.registerErr = '';
      if (this.data.editMode) {
        this.dialogRef.close({status: true, id: this.data.asset.recordId});
      } else {
        stepper.next();
      }
    } else {
      if (messages[addAssetResult.message]) {
        this.registerErr = messages[addAssetResult.message]['pt-BR'];
      } else {
        this.registerErr = 'e';
      }
    }
  }

  close(_status: boolean) {
    if (this.data.asset) {
      this.dialogRef.close({status: _status, id: this.data.asset.recordId});
    } else {
      if (this.assetForm.get('recordId').value) {
        this.dialogRef.close({status: _status, id: this.assetForm.get('recordId').value});
      } else {
        this.dialogRef.close({status: false, id: null});
      }
    }
  }
}
