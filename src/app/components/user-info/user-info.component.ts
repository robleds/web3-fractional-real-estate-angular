import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {cpfValidator} from '../../onboarding-pages/register/register.component';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  userForm: FormGroup;
  user: any;

  constructor(public dialogRef: MatDialogRef<UserInfoComponent>,
              @Inject(MAT_DIALOG_DATA) public data, private fb: FormBuilder) {

    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      type: [''],
      phone: [''],
      email: [''],
      pf: this.fb.group({
        cpf: [''],
        birthday: [''],
      }),
      pj: this.fb.group({
        cnpj: [''],
        legalEntityName: [''],
        managers: this.fb.array([]),
      }),
      address: this.fb.group({
        country: [''],
        zip_code: [''],
        state: [''],
        city: [''],
        neighborhood: [''],
        street: [''],
        number: [''],
        complement: [''],
      }),
    });
    this.user = this.data.user;
  }

  get managers() {
    return this.userForm.get('pj.managers') as FormArray;
  }

  ngOnInit(): void {
    this.userForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      type: this.user.accType,
      phone: this.user.phone,
      email: this.user.email,
    });
    if (this.user.accType === 1) {
      this.userForm.get('pf').patchValue(this.user.pfInfo);
      const bday = moment(this.userForm.get('pf.birthday').value).format('DD/MM/YYYY');
      this.userForm.get('pf.birthday').setValue(bday);
    }
    if (this.user.accType === 2) {
      this.userForm.get('pj').patchValue({
        cnpj: this.user.pjInfo.cnpj,
        legalEntityName: this.user.pjInfo.legalEntityName,
      });
      (this.user.pjInfo.managers as any[]).forEach((manager) => {
        this.addManager(manager);
      });
      this.userForm.get('pj.managers').patchValue(this.user.pjInfo.managers);
    }
    this.userForm.get('address').patchValue(this.user.address);
  }

  // addPjManagerControl(manager: any) {
  //   const _key = `manager_${manager.cpf}`;
  //   this.managersIds.push(_key);
  //   this.pjDocsForm.setControl(_key, this.fb.group({
  //     name: [manager.name],
  //     cpf: [manager.cpf],
  //     docs: [[], Validators.required]
  //   }));
  // }

  addManager(manager?: { name: string, rg: string, cpf: string }) {
    this.managers.push(this.fb.group({
      name: [manager?.name || ''],
      rg: [manager?.rg || ''],
      cpf: [manager?.cpf || ''],
    }));
  }

}
