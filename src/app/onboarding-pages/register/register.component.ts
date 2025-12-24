import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, firstValueFrom, fromEvent, Observable, Subscription} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map, tap} from 'rxjs/operators';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {validateCNPJ, validateCPF} from '../../../helpers';
import {MatDatepickerInput} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {faShare} from '@fortawesome/free-solid-svg-icons/faShare';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {MatHorizontalStepper} from '@angular/material/stepper';
import {ActivatedRoute} from '@angular/router';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
  },
};

export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const test = validateCNPJ(control.value);
    return test ? null : {invalidCNPJ: {value: control.value}};
  };
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const test = validateCPF(control.value);
    return test ? null : {invalidCPF: {value: control.value}};
  };
}

export function bankRefValidator(): ValidatorFn {
  return (group: FormGroup) => {
    const _bank = group.get('bank').value;
    const _branch = group.get('branch').value;

    if (group.pristine || (!_bank && !_branch)) {

      group.get('branch').clearValidators();
      group.get('branch').setErrors(null);

      group.get('bank').clearValidators();
      group.get('bank').setErrors(null);

      return null;
    }

    // console.log(_bank, _branch, group.touched);
    if (group.get('bank').value !== '' && group.get('branch').value !== '') {
      return null;
    } else {
      console.log('bank ref error');
      if (group.get('bank').value !== '') {
        group.get('branch').setValidators(Validators.required);
        // console.log(group.get('branch'));
      } else {
        group.get('bank').setErrors({invalidBankRef: {value: ''}});
      }
      if (group.get('branch').value !== '') {
        group.get('bank').setValidators(Validators.required);
        // console.log(group.get('bank'));
      } else {
        group.get('branch').setErrors({invalidBankRef: {value: ''}});
      }
      return {invalidBankRef: {value: ''}};
    }
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS
    }
  ]
})
export class RegisterComponent implements OnInit, OnDestroy {

  eventSubscription: Subscription;
  @ViewChild('dateOfBirth') dateOfBirth: ElementRef;
  @ViewChild('stepper') stepper: MatHorizontalStepper;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<any>;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  hasZipCode: boolean;
  isPF = false;
  isJoint = false;
  states: any;
  cities: any;
  banks: any[] = [];
  filteredBanks: Observable<any[]>;
  bankSearchInput: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  registerForm: FormGroup;
  bankAccForm: FormGroup;
  pfDocsForm: FormGroup;
  pjDocsForm: FormGroup;

  registerErr = '';
  codeSent = false;
  clickedCheckForm = false;
  sendCodeErr = '';
  codeIsValid: boolean;
  codeErr = '';

  faPlus = faPlus;
  faChevronRight = faChevronRight;
  faSkip = faShare;
  faQuestionCircle = faQuestionCircle;
  faWarn = faExclamationCircle;

  private lastSentCode = '';
  bankRefValid = false;
  managersIds: any[] = [];
  public loading = true;
  private subscriptions: Subscription[] = [];
  validManagerDocs = false;
  sentDocs = true;
  missingDocs = true;
  docStep: FormControl;
  uploadSuccess = false;
  uploadErr = '';

  updateMode = false;
  stepperEvents = new EventEmitter();

  constructor(private breakpointObserver: BreakpointObserver,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private fb: FormBuilder, private http: HttpClient, private auth: AuthService) {
    this.hasZipCode = false;
    this.createForms();
    this.initSubscriptions();
  }

  createForms() {
    this.bankAccForm = this.fb.group({
      bank: ['', [Validators.required, this.bankValidator()]],
      branch: ['', Validators.required],
      account: ['', Validators.required],
      type: ['', Validators.required],
      joint: ['', Validators.required],
      otherOwner: [''],
      bankReferences: this.fb.array([]),
    });
    (this.bankAccForm.get('bankReferences') as FormArray).push(this.fb.group({
      bank: ['', this.bankValidator()],
      branch: [''],
    }, {
      validators: bankRefValidator()
    }));

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      type: ['', Validators.required],
      phone: ['', Validators.required],
      code: ['', Validators.required],
      pf: this.fb.group({
        cpf: ['', [Validators.required, cpfValidator()]],
        birthday: ['', Validators.required],
      }),
      pj: this.fb.group({
        cnpj: ['', [Validators.required, cnpjValidator()]],
        legalEntityName: ['', Validators.required],
        managers: this.fb.array([]),
      }),
      address: this.fb.group({
        country: ['Brasil', Validators.required],
        zip_code: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        neighborhood: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
      }),
      questions: this.fb.group({
        isRegularInvestor: ['', Validators.required],
        marketExpLevel: ['', Validators.required],
        patrimonyLevel: ['', Validators.required],
        isPropOwner: ['', Validators.required],
      }),
    });

    // add first manager
    (this.registerForm.get('pj.managers') as FormArray).push(this.fb.group({
      name: ['', Validators.required],
      rg: ['', Validators.required],
      cpf: ['', [Validators.required, cpfValidator(), this.cpfUniqueValidator()]],
    }));

    this.pfDocsForm = this.fb.group({
      photoId: [[], Validators.required],
      proofOfResidence: [[], Validators.required],
      maritalStatus: [[], Validators.required]
    });

    this.pjDocsForm = this.fb.group({
      cnpjCard: [[], Validators.required],
      socialContract: [[], Validators.required]
    });

    this.docStep = new FormControl(null, Validators.required);
  }

  initSubscriptions() {
    this.subscriptions.push(
      this.bankAccForm.get('joint').valueChanges.subscribe(val => {
        if (val === 'conjunta') {
          this.isJoint = true;
          this.bankAccForm.get('otherOwner').setValidators([Validators.required]);
          this.bankAccForm.get('otherOwner').updateValueAndValidity();
        } else {
          this.isJoint = false;
          this.bankAccForm.get('otherOwner').clearValidators();
          this.bankAccForm.get('otherOwner').updateValueAndValidity();
        }
      })
    );

    this.subscriptions.push(
      this.bankAccForm.get('bankReferences').valueChanges.subscribe(val => {
        this.checkBankRefs().catch(console.log);
      })
    );

    this.subscriptions.push(
      this.registerForm.get('type').valueChanges.subscribe(val => {
        if (val === 'pf') {
          this.isPF = true;
          this.registerForm.get('pf.cpf').setValidators([Validators.required, cpfValidator()]);
          this.registerForm.get('pf.birthday').setValidators([Validators.required]);
          this.registerForm.get('pf.cpf').updateValueAndValidity();
          this.registerForm.get('pf.birthday').updateValueAndValidity();
          const questionsGroup = this.registerForm.get('questions');
          for (const key in questionsGroup.value) {
            if (questionsGroup.value.hasOwnProperty(key)) {
              questionsGroup.get(key).setValidators([Validators.required]);
              questionsGroup.get(key).updateValueAndValidity();
            }
          }

          this.bankAccForm.get('type').setValidators([Validators.required]);
          this.bankAccForm.get('type').updateValueAndValidity();

          this.bankAccForm.get('joint').setValidators([Validators.required]);
          this.bankAccForm.get('joint').updateValueAndValidity();

          this.registerForm.get('pj.cnpj').clearValidators();
          this.registerForm.get('pj.legalEntityName').clearValidators();
          this.registerForm.get('pj.cnpj').updateValueAndValidity();
          this.registerForm.get('pj.legalEntityName').updateValueAndValidity();
          this.managers.controls.forEach(group => {
            for (const key in group.value) {
              if (group.value.hasOwnProperty(key)) {
                group.get(key).clearValidators();
                group.get(key).updateValueAndValidity();
              }
            }
          });

          setTimeout(() => {
            if (!this.eventSubscription) {
              this.eventSubscription = fromEvent(this.dateOfBirth.nativeElement, 'input').subscribe(_ => {
                this.datepickerInput._onInput(this.dateOfBirth.nativeElement.value);
              });
            }
          }, 100);

        } else {

          this.isPF = false;
          this.registerForm.get('pf.cpf').clearValidators();
          this.registerForm.get('pf.birthday').clearValidators();
          this.registerForm.get('pf.cpf').updateValueAndValidity();
          this.registerForm.get('pf.birthday').updateValueAndValidity();

          this.bankAccForm.get('type').clearValidators();
          this.bankAccForm.get('type').updateValueAndValidity();

          this.bankAccForm.get('joint').clearValidators();
          this.bankAccForm.get('joint').updateValueAndValidity();

          this.registerForm.get('pj.cnpj').setValidators([Validators.required, cnpjValidator()]);
          this.registerForm.get('pj.legalEntityName').setValidators([Validators.required]);
          this.registerForm.get('pj.cnpj').updateValueAndValidity();
          this.registerForm.get('pj.legalEntityName').updateValueAndValidity();

          const questionsGroup = this.registerForm.get('questions');
          for (const key in questionsGroup.value) {
            if (questionsGroup.value.hasOwnProperty(key)) {
              questionsGroup.get(key).clearValidators();
              questionsGroup.get(key).updateValueAndValidity();
            }
          }

          this.managers.controls.forEach(group => {
            for (const key in group.value) {
              if (group.value.hasOwnProperty(key)) {
                const validators = [Validators.required];
                if (key === 'cpf') {
                  validators.push(cpfValidator());
                }
                group.get(key).setValidators(validators);
                group.get(key).updateValueAndValidity();
              }
            }
          });
        }
      })
    );

    this.subscriptions.push(
      this.registerForm.get('code').valueChanges.subscribe(val => {
        if (val.length === 6) {
          this.validatePhoneCode().catch(console.log);
        }
      })
    );

    this.subscriptions.push(
      this.pjDocsForm.valueChanges.subscribe(value => {
        this.validManagerDocs = this.managersIds.every((manager) => {
          if (value[manager]) {
            if (value[manager].docs.length > 0) {
              return value[manager].docs.some((doc: any) => {
                return doc.hash !== null;
              });
            } else {
              return false;
            }
          } else {
            return false;
          }
        });
      })
    );

    this.filteredBanks = this.bankSearchInput.pipe(map((event: InputEvent) => {
      return this.banks.filter((value) => {
        if (event && event.target) {
          const target = event.target as HTMLInputElement;
          if (target.value && target.value !== '') {
            const text = target.value.toLowerCase();
            const bank = (`${value.code} - ${value.name}`).toLowerCase();
            if (bank.includes(text)) {
              return true;
            }

            if (value.code.includes(text)) {
              return true;
            }

            const normalizedValue = value.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedValue.includes(text);
          } else {
            return true;
          }
        } else {
          return true;
        }
      });
    }));

    firstValueFrom(this.activatedRoute.paramMap).then((value) => {
      if (value.has('page')) {
        this.updateMode = true;
        console.log('Update Mode!');
      }
    });
  }

  ngOnInit() {
    this.getUserData().then(() => {
      this.loading = false;
    }).catch(console.log);
    this.searchStates();
    this.searchBanks().then(value => {
      this.bankSearchInput.next({target: {value: ''}});
    }).catch(console.log);

    // external page controller
    this.loading = true;
    firstValueFrom(this.stepperEvents.asObservable()).then((event) => {
      if (event === 'ready' && this.updateMode) {
        const paramSub = this.activatedRoute.paramMap.pipe(tap(value => {
          if (value.has('page') && this.updateMode) {
            console.log('changing to page', value.get('page'));
            this.stepper.selectedIndex = parseInt(value.get('page'), 10);
          }
        })).subscribe();
        this.subscriptions.push(paramSub);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(value => {
      value.unsubscribe();
    });
  }

  skip() {
    console.log('skip!');
    this.docStep.patchValue(true);
    this.docStep.updateValueAndValidity();
    const _form = this[this.isPF ? 'pfDocsForm' : 'pjDocsForm'];
    this.sentDocs = Object.keys(_form.controls).some(value => {
      console.log(value);
      let data = _form.get(value).value;
      if (!Array.isArray(data) && data.docs) {
        data = data.docs;
      }

      if (Array.isArray(data)) {
        return data.some(item => (item.hash !== null || item.hash !== ''));
      } else {
        return false;
      }

    });
    this.stepper.next();
  }

  bankValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const arr = control.value.split(' - ');
      if (arr.length > 1) {
        const [bankCode, bankName] = control.value.split(' - ');
        const test = this.banks.find(value => {
          return value.code === bankCode && value.name && bankName;
        });
        return test ? null : {invalidBank: {value: control.value}};
      } else {
        return {invalidBank: {value: control.value}};
      }
    };
  }

  cpfUniqueValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let count = 0;
      if (control.value.length === 11 && this.managers.controls.length > 0) {
        for (const manager of this.managers.controls) {
          if (control.value === manager.get('cpf').value) {
            count++;
          }
        }
      }
      if (count <= 1) {
        return null;
      } else {
        return {duplicatedCPF: {value: control.value}};
      }
    };
  }

  checkUniqueManagers() {
    for (const manager of this.managers.controls) {
      manager.get('cpf').updateValueAndValidity();
    }
  }

  get managers() {
    return this.registerForm.get('pj.managers') as FormArray;
  }

  get bankRefs() {
    return this.bankAccForm.get('bankReferences') as FormArray;
  }

  addManager(manager?: { name: string, rg: string, cpf: string }) {
    this.managers.push(this.fb.group({
      name: [manager?.name || '', Validators.required],
      rg: [manager?.rg || '', Validators.required],
      cpf: [manager?.cpf || '', [Validators.required, cpfValidator(), this.cpfUniqueValidator()]],
    }));
  }

  addBankReference() {
    this.bankRefs.push(this.fb.group({
      bank: ['', this.bankValidator()],
      branch: [''],
    }, {
      validators: bankRefValidator()
    }));
  }

  removeManager(i: number) {
    const removedCPF = this.managers.at(i).value.cpf;
    const _key = `manager_${removedCPF}`;
    const idx = this.managersIds.findIndex(value => value === _key);
    this.managersIds.splice(idx, 1);
    this.pjDocsForm.removeControl(_key);
    this.managers.removeAt(i);
  }

  removeBankRef(i: number) {
    this.bankRefs.removeAt(i);
  }

  async checkBankRefs() {
    let valid = true;
    this.bankRefs.controls.forEach(group => {
      for (const key in group.value) {
        if (group.value.hasOwnProperty(key)) {
          if (group.value[key] === '') {
            valid = false;
            break;
          }
        }
      }
    });
    this.bankRefValid = valid;
  }

  async searchBanks() {
    if (this.banks.length === 0) {
      const url = 'https://raw.githubusercontent.com/guibranco/BancosBrasileiros/master/bancos.json';
      const getBanks$ = this.http.get(url);
      const bancos = await firstValueFrom(getBanks$) as any[];
      this.banks = bancos.map(value => {
        return {
          code: value.Code,
          name: value.Name
        };
      });
    }
  }

  searchCNPJ(cnpj: string) {
    if (cnpj === '' || !cnpj) {
      return;
    }
    return this.http.get(`${environment.apiHost}/cnpj/${cnpj}`).subscribe((result: any) => {
      try {
        const addr = result.endereco;

        const patchBody = {
          zip_code: addr.cep.replace('-', ''),
          state: this.states.find(estado => estado.nome === addr.estado.nome)?.sigla,
          city: addr.cidade.nome,
          neighborhood: addr.bairro,
          street: `${addr.descricao_tipo_logradouro} ${addr.logradouro}`,
          number: addr.numero,
          complement: addr.complemento,
        };

        if (result.socios) {
          result.socios.forEach((value, index) => {
            if (this.managers.at(index)) {
              this.managers.at(index).patchValue({
                name: value.nome
              });
            } else {
              this.managers.push(this.fb.group({
                name: [value.nome, Validators.required],
                rg: ['', Validators.required],
                cpf: ['', Validators.required],
              }));
            }
          });
        }

        this.registerForm.get('pj').patchValue({
          legalEntityName: result.razao_social,
        });
        this.registerForm.get('address').patchValue(patchBody);
        this.hasZipCode = true;
      } catch (e) {
        console.log(e);
      }
    });
  }

  searchCEP(cep: string) {
    if (cep === '' || !cep) {
      return;
    }
    return this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((result: any) => {
      this.registerForm.get('address').patchValue({
        state: result.uf,
        city: result.localidade,
        neighborhood: result.bairro,
        street: result.logradouro,
        complement: result.complemento,
      });

      this.hasZipCode = true;
    });
  }

  searchStates() {
    return this.http.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados`).subscribe((result: any) => {
      this.states = result;
    });
  }

  searchCities(state: string) {
    return this.http.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
      .subscribe((result: any) => {
        this.cities = result;
      });
  }

  checkForm() {
    this.clickedCheckForm = true;
    this.registerForm.markAllAsTouched();
  }

  async submitUserData(stepper: MatHorizontalStepper) {
    try {
      const submitData$ = this.http.post(`${environment.apiHost}/submitUserData`, this.registerForm.value, this.auth.buildOptions());
      const result = await firstValueFrom(submitData$) as any;
      if (result.status) {
        this.managersIds = [];
        for (const manager of this.registerForm.get('pj.managers').value) {
          this.addPjManagerControl(manager);
        }
        if (result.token) {
          this.auth.setToken(result.token);
          stepper.next();
        }
      } else {
        this.registerErr = 'e';
      }
    } catch (e) {
      console.log(e);
      this.registerErr = 'e';
    }
  }

  async getUserData() {
    const getUserData$ = this.http.get(`${environment.apiHost}/getUserData`, this.auth.buildOptions());
    const result = await firstValueFrom(getUserData$) as any;
    if (result && result.status && result.user) {

      const newData = {} as any;
      const user = result.user;

      if (user.firstName) {
        newData.firstName = user.firstName;
      }

      if (user.lastName) {
        newData.lastName = user.lastName;
      }

      if (user.accType) {
        newData.type = user.accType === 1 ? 'pf' : 'pj';
      }

      if (user.phone) {
        newData.phone = user.phone;
      }

      if (user.accType === 1 && user.pfInfo) {
        newData.pf = {
          cpf: user.pfInfo.cpf,
          birthday: user.pfInfo.birthday,
        };
      }

      if (user.accType === 2 && user.pjInfo) {
        newData.pj = {
          cnpj: user.pjInfo.cnpj,
          legalEntityName: user.pjInfo.legalEntityName,
        };
      }

      if (user.address) {
        newData.address = user.address;
      }

      if (user.pfInfo) {
        newData.questions = {
          isRegularInvestor: user.pfInfo?.isRegularInvestor ? '1' : '0',
          marketExpLevel: user.pfInfo?.marketExpLevel.toString(),
          patrimonyLevel: user.pfInfo?.patrimonyLevel.toString(),
          isPropOwner: user.pfInfo?.isPropOwner ? '1' : '0',
        };
      }

      this.registerForm.patchValue(newData);

      if (user.bankRefs) {
        this.bankRefs.clear();
        for (const ref of user.bankRefs) {
          this.bankRefs.push(this.fb.group({
            bank: [ref.bank, this.bankValidator()],
            branch: [ref.branch],
          }, {
            validators: bankRefValidator()
          }));
        }
      }

      if (user.bankAccountInfo) {
        this.bankAccForm.patchValue({
          bank: user.bankAccountInfo.bank,
          branch: user.bankAccountInfo.branch,
          account: user.bankAccountInfo.account,
          joint: user.bankAccountInfo.joint,
          otherOwner: user.bankAccountInfo.otherOwner,
          type: user.bankAccountInfo.type
        });
        this.bankAccForm.updateValueAndValidity();
      }

      this.hasZipCode = result.user?.address?.zip_code !== '';
      if (result.user.pjInfo?.managers.length > 0) {
        this.managers.clear();

        (result.user.pjInfo.managers as any[]).forEach((manager) => {
          this.addPjManagerControl(manager);
          this.addManager(manager);
        });

      }
      if (result.user.phone && result.user.phone !== '') {
        this.codeSent = true;
      }
      if (result.user.smsValid) {
        this.registerForm.get('code').clearValidators();
        this.registerForm.get('code').updateValueAndValidity();
        this.codeSent = true;
        this.codeIsValid = true;

        if (result.user.status === 2 && result.user.firstName && result.user.firstName !== '') {
          await this.getUserDocuments();
          this.stepperEvents.emit('ready');
          if (!this.updateMode) {
            this.stepper.next();
          }
        }
      }
    }
  }

  addPjManagerControl(manager: any) {
    const _key = `manager_${manager.cpf}`;
    this.managersIds.push(_key);
    this.pjDocsForm.setControl(_key, this.fb.group({
      name: [manager.name],
      cpf: [manager.cpf],
      docs: [[], Validators.required]
    }));
  }

  async sendPhoneCode() {
    this.clickedCheckForm = false;
    try {
      const startSMSValidation$ = this.http.post(`${environment.apiHost}/startSMSValidation`, {
        phone: this.registerForm.get('phone').value
      }, this.auth.buildOptions());
      const result = await firstValueFrom(startSMSValidation$) as any;
      if (result.status) {
        this.codeSent = true;
        this.sendCodeErr = '';
      } else {
        this.sendCodeErr = result.error;
      }
    } catch (e) {
      console.log(e);
      this.sendCodeErr = 'e';
    }
  }

  async validatePhoneCode() {
    const _code = this.registerForm.get('code').value;
    if (_code === this.lastSentCode) {
      return;
    }
    try {

      const submitSMSValidation$ = this.http.post(`${environment.apiHost}/submitSMSValidation`, {
        code: _code
      }, this.auth.buildOptions());

      const result = await firstValueFrom(submitSMSValidation$) as any;

      this.lastSentCode = _code;
      console.log(result);
      if (result.status) {
        this.codeIsValid = true;
        this.codeErr = '';
      } else {
        this.codeIsValid = false;
        this.codeErr = result.error;
      }
    } catch (e) {
      console.log(e);
      this.codeIsValid = false;
      this.codeErr = 'e';
    }
  }

  async getUserDocuments() {
    const getDocuments$ = this.http.get(`${environment.apiHost}/getDocuments`, this.auth.buildOptions());
    const result = await firstValueFrom(getDocuments$) as any;
    if (result.status && result.docs && result.docs.length > 0) {
      const pjDocs = {};
      const pfDocs = {};
      for (const doc of result.docs) {
        let [prefix, idx] = doc.category.split(':');
        if (!idx) {
          idx = 0;
          prefix = doc.category;
        }
        const el = {hash: doc.hash, extension: doc.extension};
        if (this.pjDocsForm.controls[prefix]) {
          if (!pjDocs[prefix]) {
            pjDocs[prefix] = [el];
          } else {
            pjDocs[prefix].push(el);
          }
          // console.log(`[PJ] Restoring ${prefix}... ${idx}`);
        }
        if (this.pfDocsForm.controls[prefix]) {
          if (!pfDocs[prefix]) {
            pfDocs[prefix] = [el];
          } else {
            pfDocs[prefix].push(el);
          }
          // console.log(`[PF] Restoring ${prefix}... ${idx}`);
        }
      }
      Object.keys(pjDocs).forEach((key) => {
        if (key.startsWith('manager_')) {
          this.pjDocsForm.get(key).get('docs').setValue(pjDocs[key]);
        } else {
          this.pjDocsForm.get(key).setValue(pjDocs[key]);
        }
      });
      Object.keys(pfDocs).forEach((key) => {
        this.pfDocsForm.get(key).setValue(pfDocs[key]);
      });
    }
  }

  setSearch(event) {
    this.bankSearchInput.next({target: {value: event}});
  }

  async submitDocsForm() {
    const formBody = {
      docs: this.isPF ? this.pfDocsForm.value : this.pjDocsForm.value,
      bankRefs: this.bankAccForm.value
    };
    console.log(formBody);
    try {
      const submitDocs$ = this.http.post(`${environment.apiHost}/submitDocs`, formBody, this.auth.buildOptions());
      const result = await firstValueFrom(submitDocs$) as any;
      console.log(result);
      if (result.status) {
        this.uploadSuccess = true;
        this.uploadErr = '';
        this.skip();
      } else {
        this.uploadErr = result.error;
      }
    } catch (e) {
      this.uploadSuccess = false;
      this.uploadErr = 'e';
      console.log(e);
    }
  }
}
