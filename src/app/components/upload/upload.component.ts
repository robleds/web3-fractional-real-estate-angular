import {Component, Input, OnInit} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';
import {faPaperclip} from '@fortawesome/free-solid-svg-icons/faPaperclip';
import {HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpRequest, HttpSentEvent} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import {faDownload} from '@fortawesome/free-solid-svg-icons/faDownload';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {AbstractControl} from '@angular/forms';
import {catchError, last, map} from 'rxjs/operators';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {queue} from 'async';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';

interface IFile {
  meta?: {
    imageWidth: number;
    imageOrientation: string;
    imageHeight: number
  };
  b64preview?: string;
  file?: File;
  progress?: number;
  hash?: string;
  extension?: string;
  name?: string;
  error?: string;
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  @Input()
  type: string;

  @Input()
  category: string;

  @Input()
  isPrivate: string;

  @Input()
  sizeLimit: number;

  @Input()
  isUnique: string;

  @Input()
  limit = 10;

  parentControl: AbstractControl;

  faTimes = faTimes;
  faPaperclip = faPaperclip;
  faPaperPlane = faPaperPlane;
  faDownload = faDownload;
  faTrash = faTrashAlt;
  faWarn = faExclamationCircle;
  faEye = faEye;

  documentTypes: string[];
  fileError = '';
  uploadError = '';
  fileProgress: number;
  fileName = '';
  uploadSuccess = false;
  private file: any;
  deleteErr = '';
  files: IFile[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  ngOnInit() {
    if (this.type === '1') {
      this.documentTypes = [
        'image/png',
        'image/jpeg',
        'image/heic',
        'image/webp'
      ];
    } else {
      this.documentTypes = [
        'image/png',
        'image/jpeg',
        'application/pdf'
      ];
    }
  }

  @Input()
  set control(formControl: AbstractControl) {
    if (formControl) {
      this.parentControl = formControl;
      firstValueFrom(formControl.valueChanges).then(value => {
        if (Array.isArray(value)) {
          for (const item of value) {
            const existing = this.files.findIndex(value1 => value1.hash === item.hash);
            const _data = {
              hash: item.hash,
              extension: item.extension,
              name: item.file ? item.name : `${item.hash.slice(0, 8)}...${item.extension}`,
              file: null,
              progress: 100
            };
            if (existing !== -1) {
              this.files[existing] = _data;
            } else {
              this.files.push(_data);
            }
          }
        }
        this.uploadSuccess = true;
      });
    }
  }

  get valid() {
    return this.files.some(value => value.hash);
  }

  get pending() {
    return this.files.some(value => !value.hash);
  }

  async selectDoc(event: any, fileSelect: HTMLInputElement) {
    let newDocs = 0;
    if ((event.target.files.length + this.files.length) > this.limit) {
      this.fileError = 'LIMIT';
      return;
    }
    const _files = this.files;
    const unique = new Set(_files.map(f => f.file?.name ?? ''));
    for (const file of event.target.files) {
      if (unique.has(file.name)) {
        continue;
      }
      this.fileName = file.name;
      this.fileError = '';
      if (!this.documentTypes.includes(file.type)) {
        this.fileError = 'UNSUPPORTED_FORMAT';
        return;
      }
      if (file.size > this.sizeLimit) {
        this.fileError = 'SIZE_LIMIT';
        return;
      }

      let _imageData = null;
      if (FileReader) {
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            _imageData = reader.result;
            resolve();
          };
          reader.onerror = () => {
            reject();
          };
          reader.readAsDataURL(file);
        });
      }

      _files.push({
        file,
        extension: '',
        hash: '',
        progress: 0,
        name: file.name,
        b64preview: _imageData
      });
      newDocs++;
      unique.add(file.name);
    }
    if (newDocs > 0) {
      this.uploadSuccess = false;
    }
    this.files = _files;
    fileSelect.value = null;
  }

  removeDoc(i: number) {
    this.files.splice(i, 1);
    this.parentControl.setValue(this.files);
    this.uploadSuccess = false;
  }

  async deleteDocument(idx: number) {
    const doc = this.files[idx];
    try {
      const deleteDocument$ = this.http.delete(
        `${environment.apiHost}/deleteDocument/${doc.hash}.${doc.extension}`,
        this.auth.buildOptions()
      );
      const result = await firstValueFrom(deleteDocument$) as any;
      if (result.status) {
        this.removeDoc(idx);
        this.deleteErr = '';
      } else {
        this.deleteErr = result.error;
      }
    } catch (e) {
      console.log(e);
      this.deleteErr = 'e';
    }
  }

  convertBytes(bytes: number) {
    return (bytes / (1024 ** 2)).toFixed(0) + ' MB';
  }

  async downloadDocument(idx: number) {
    const doc = this.files[idx];
    const getDocument$ = this.http.get(`${environment.apiHost}/getDocument/${doc.hash}.${doc.extension}`, this.auth.buildOptions({
      responseType: 'blob'
    }));
    const results = await firstValueFrom(getDocument$);
    const url = window.URL.createObjectURL(results);
    window.open(url);
  }

  async uploadDocuments() {
    this.uploadSuccess = false;
    let valid = true;

    // create queue
    const _queue = queue((task: { data: IFile, idx: number }, callback) => {
      this.uploadSingleDocument(task.data, task.idx).then((data) => {
        this.files[task.idx].hash = data.body.data.hash;
        this.files[task.idx].extension = data.body.data.extension;
        callback();
      }).catch((err) => {
        callback(err);
      });
    }, 2);

    // push to queue
    this.files.forEach((value: IFile, index: number) => {
      if (value.file && !value.hash) {
        if (value.file.type.startsWith('image/')) {
          const image = new Image();
          image.addEventListener('load', () => {
            let orientation;
            if (image.width > image.height) {
              orientation = 'landscape';
            } else {
              orientation = 'portrait';
            }
            value.meta = {
              imageWidth: image.width,
              imageHeight: image.height,
              imageOrientation: orientation
            };
            _queue.push({data: value, idx: index});
          });
          image.src = URL.createObjectURL(value.file);
        } else {
          _queue.push({data: value, idx: index});
        }
      }
    });

    // detect drain
    _queue.drain(() => {
      if (valid) {
        this.uploadError = '';
        this.parentControl.setValue(this.files);
      }
      this.uploadSuccess = valid;
    });

    _queue.error((e) => {
      valid = false;
      console.log(e);
      if (e instanceof HttpErrorResponse) {
        this.uploadError = e.error.error;
      }
    });

  }

  async uploadSingleDocument(inputFile: IFile, idx: number) {
    const formData = new FormData();

    formData.append('file', inputFile.file);

    let _headers = new HttpHeaders({
      type: this.type,
      'private-document': this.isPrivate,
      category: this.category + ':' + idx.toString(),
      unique: this.isUnique
    });

    if (inputFile.meta) {
      _headers = _headers.append('image-width', inputFile.meta.imageWidth.toString());
      _headers = _headers.append('image-height', inputFile.meta.imageHeight.toString());
      _headers = _headers.append('image-orientation', inputFile.meta.imageOrientation);
    }

    const req = new HttpRequest('POST', `${environment.apiHost}/uploadDocument`, formData, this.auth.buildOptions({
      reportProgress: true,
      headers: _headers
    }));

    const executeReq$ = this.http.request(req).pipe(
      map((value: HttpSentEvent | any) => {
        switch (value.type) {
          case HttpEventType.Sent: {
            return `Uploading file "${inputFile.name}" of size ${inputFile.file.size}.`;
          }
          case HttpEventType.UploadProgress: {
            const percentDone = Math.round(100 * value.loaded / value.total);
            inputFile.progress = percentDone;
            return `File "${inputFile.file.name}" is ${percentDone}% uploaded.`;
          }
          case HttpEventType.Response: {
            console.log(`File "${inputFile.file.name}" finished uploading!`);
            return value;
          }
          default: {
            return `File "${inputFile.file.name}" surprising upload event: ${value.type}.`;
          }
        }
      }),
      last(),
      catchError(err => {
        throw err;
      })
    );

    return await lastValueFrom(executeReq$);
  }

}
