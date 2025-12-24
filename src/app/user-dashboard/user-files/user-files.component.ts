import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {firstValueFrom} from 'rxjs';
import * as moment from 'moment';
import {ConfirmationDialogComponent} from '../../components/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

interface UserFile {
  categoria?: string;
  regId?: string;
  seqNum?: number;
  category: string;
  createdAt: string;
  docType: number;
  extension: string;
  hash: string;
  owner: string;
  private: boolean;
  updatedAt: string;
  verified: number;
  url?: string;
}

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrls: ['./user-files.component.css']
})
export class UserFilesComponent implements OnInit {

  files: UserFile[];
  private categoryMap = {
    asset: 'Documento de imóvel'
  };

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    this.loadFiles().catch(console.log);
  }

  async loadFiles() {
    const getDocuments$ = this.http.get(`${environment.apiHost}/getDocuments`, this.auth.buildOptions());
    const data = await firstValueFrom(getDocuments$) as unknown as { status: boolean, docs: UserFile[] };
    if (data.status) {
      data.docs.forEach(value => {
        value.createdAt = moment(value.createdAt).format('DD-MM-YYYY @ HH:mm:ss');
        if (value.docType === 1 && !value.private) {
          value.url = `https://d375qrow5gni7z.cloudfront.net/${value.owner}/${value.hash}.webp`;
        }
        const [cat, rec] = value.category.split('_');
        const [reg, seq] = rec.split(':');
        value.regId = reg;
        value.seqNum = parseInt(seq, 10);

        if (value.docType === 1) {
          value.categoria = 'Foto de imóvel';
        } else {
          value.categoria = this.categoryMap[cat];
        }
      });

      this.files = data.docs;
    }
  }

  async loadDocument(file: UserFile) {
    const getDocument$ = this.http.get(`${environment.apiHost}/getDocument/${file.hash}.${file.extension}`, this.auth.buildOptions({
      responseType: 'blob'
    }));
    const results = await firstValueFrom(getDocument$);
    const url = window.URL.createObjectURL(results);
    window.open(url);
  }

  async deleteDocument(file: UserFile) {
    const dialogConfig = {
      data: {
        title: 'Excluir Arquivo',
        description: `Tem certeza que deseja excluir o arquivo ${file.regId} [${file.seqNum}]?`
      }
    };
    const dialogReference = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    const confirmation = await firstValueFrom(dialogReference.afterClosed());
    if (!confirmation) {
      return;
    }

    try {
      const deleteDocument$ = this.http.delete(
        `${environment.apiHost}/deleteDocument/${file.hash}.${file.extension}`,
        this.auth.buildOptions()
      );
      const result = await firstValueFrom(deleteDocument$) as any;
      if (result.status) {
        await this.loadFiles();
      }
    } catch (e) {
      console.log(e);
    }
  }
}
