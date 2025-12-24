import {Component, OnInit} from '@angular/core';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {EXPANSION_PANEL_ANIMATION_TIMING} from '@angular/material/expansion';
import {environment} from '../../../environments/environment';
import {firstValueFrom} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faCheckCircle} from '@fortawesome/free-regular-svg-icons/faCheckCircle';
import {MatDialog} from '@angular/material/dialog';
import {UserInfoComponent} from '../../components/user-info/user-info.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css'],
  animations:
    [
      trigger('indicatorRotate', [
        state('collapsed, void', style({transform: 'rotate(0deg)'})),
        state('expanded', style({transform: 'rotate(90deg)'})),
        transition('expanded <=> collapsed, void => collapsed',
          animate(EXPANSION_PANEL_ANIMATION_TIMING))]),

      trigger('rowExpansionTrigger', [
        state('collapsed, void', style({height: '0px', visibility: 'hidden'})),
        state('expanded', style({height: '*', visibility: 'visible'})),
        transition('expanded <=> collapsed, void => collapsed',
          animate(EXPANSION_PANEL_ANIMATION_TIMING))])
    ]
})

export class ManageUsersComponent implements OnInit {

  constructor(private http: HttpClient, private auth: AuthService,
              private dialog: MatDialog) {

  }

  pfUsers: any[] = [];
  pjUsers: any[] = [];
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faQuestionCircle = faQuestionCircle;
  faEye = faEye;
  faPaperPlane = faPaperPlane;
  faWarn = faExclamationCircle;
  faCheck = faCheckCircle;
  getUsersSuccess = false;
  getUsersErr = '';
  approveUserSuccess = false;
  sendEmailSuccess = false;
  approveUserErr = '';
  sendEmailErr = '';

  static parseDocs(user: any) {
    if (user.documentsJsonData) {
      try {
        user.documents = JSON.parse(user.documentsJsonData);
        for (const [key, value] of Object.entries(user.documents)) {
          const prop = value as any;
          if (user.accType === 2 && key.startsWith('manager_')) {
            if (!user.managerDocs) {
              user.managerDocs = [];
            }
            user.managerDocs.push(prop);
          }

          let items = [];
          if (Array.isArray(prop)) {
            items = prop;
          } else if (prop.docs) {
            items = prop.docs;
          }

          for (const item of items) {
            if (item.hash && item.extension) {
              item.name = `${item.hash.slice(0, 8)}...${item.extension}`;
              item.approved = 0;
            }
          }
        }
      } catch (e) {
        console.log(user.documentsJsonData);
        console.log(e);
      }
    }
    user.name = user.firstName + ' ' + user.lastName;
    user.approvals = new Map();
    user.missing = new Map();
    user.approved = false;
    return user;
  }

  ngOnInit(): void {
    this.getPendingUsers().catch(console.log);
  }

  async getPendingUsers() {
    if (this.auth.userData.role === 'admin') {
      const getPendingUsers = this.http.get(`${environment.apiHost}/getPendingUsers`, this.auth.buildOptions());
      const result = await firstValueFrom(getPendingUsers) as any;
      if (result.status) {
        const users = result.users;
        this.pfUsers = users['1'].map(ManageUsersComponent.parseDocs).filter(d => d.documentsJsonData);
        this.pjUsers = users['2'].map(ManageUsersComponent.parseDocs).filter(d => d.documentsJsonData);
      } else {

      }
    } else {
      alert('ACCESS DENIED!');
    }
  }

  async downloadDocument(doc: any, id: string) {
    const getDocument$ = this.http.get(
      `${environment.apiHost}/admin/getDocument/${id}/${doc.hash}.${doc.extension}`,
      this.auth.buildOptions({
        responseType: 'blob'
      })
    );
    const results = await firstValueFrom(getDocument$);
    const url = window.URL.createObjectURL(results);
    window.open(url);
  }

  async setDocStatus(file: any, user: any, status: number, reason?: string) {
    const formBody = {
      hash: file.hash,
      owner: user._id,
      status,
      reason
    };
    user.approvals.set(file.hash, formBody);
    if (status === 1) {
      file.rejectedReason = '';
    }
    file.approved = status;
  }

  openUserDialog(user: any): void {
    const dRef = this.dialog.open(UserInfoComponent, {
      width: '860px',
      panelClass: 'width-dialog',
      data: {
        user,
      }
    });
  }

  async getDocState(event: any) {
    const user = event.data;
    const getStates$ = this.http.get(`${environment.apiHost}/admin/getUserDocumentsMetadata/${event.data._id}`, this.auth.buildOptions());
    const result = await firstValueFrom(getStates$) as any;
    if (result.status) {
      let rejectCount = 0;
      for (const doc of result.docs) {
        const key = doc.category.split(':')[0];
        let documentArray;

        // find array reference
        if (key.startsWith('manager_')) {
          const cpf = key.split('_')[1];
          const localRef = user.managerDocs.find(value => value.cpf === cpf);
          if (localRef) {
            documentArray = localRef.docs;
          }
        } else {
          if (user.documents[key]) {
            documentArray = user.documents[key];
          }
        }

        // find document reference
        if (documentArray && documentArray.length > 0) {
          const localDocRef = documentArray.find(value => value.hash === doc.hash);
          if (localDocRef) {
            localDocRef.approved = doc.verified;
            localDocRef.rejectedReason = doc.rejectedReason;
            if (doc.verified === 2) {
              rejectCount++;
            }
          }
        }
      }
      if (rejectCount > 0) {
        console.log(`User ${user._id} has ${rejectCount} rejected documents!`);
      } else {
        user._fullApproval = true;
      }
    }
  }

  async sendEmail(user: any) {
    const approvals = user.approvals as Map<string, any>;
    const missing = user.missing as Map<string, any>;
    try {
      const sendEmail$ = this.http.post(`${environment.apiHost}/admin/submitApprovals`, {
        data: Array.from(approvals),
        missing: Array.from(missing)
      }, this.auth.buildOptions());
      const result = await firstValueFrom(sendEmail$) as any;
      if (result.status) {
        this.sendEmailSuccess = true;
        this.sendEmailErr = '';
      } else {
        this.sendEmailErr = result.error;
      }
    } catch (e) {
      this.sendEmailSuccess = false;
      this.sendEmailErr = 'e';
      console.log(e);
    }
  }

  writeMissingDoc(event: any, user: any, label: string) {
    user.missing.set(label, event.target.value);
  }

  writeReason(event: any, user: any, file: any) {
    if (user.approvals.has(file.hash)) {
      const approval = user.approvals.get(file.hash);
      if (approval.status === 2) {
        approval.reason = event.target.value;
      }
    }
  }

  async approveUser(user: any) {
    try {
      const approveUser$ = this.http.post(`${environment.apiHost}/admin/approveUser`, {id: user._id}, this.auth.buildOptions());
      const result = await firstValueFrom(approveUser$) as any;
      console.log(result);
      if (result.status) {
        this.approveUserErr = '';
        user.approved = true;
      } else {
        this.approveUserErr = result.error;
      }
    } catch (e) {
      user.approved = false;
      this.approveUserErr = 'e';
      console.log(e);
    }
  }

}
