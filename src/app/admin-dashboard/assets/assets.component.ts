import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {DataView} from 'primeng/dataview';
import {firstValueFrom, Subscription} from 'rxjs';

import {AddAssetComponent} from './add-asset/add-asset.component';
import {AssetsService} from '../../services/assets.service';
import {IAssetResponse} from '../../interfaces';
import {messages} from '../../messages';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private media: MediaObserver,
    public assetsService: AssetsService,
  ) {
  }

  disableList = false;
  dvLoaded = false;
  mediaSub: Subscription;

  @ViewChild('dv')
  dv: DataView;


  ngOnInit() {
    this.assetsService.loadAssets().catch(console.log).finally(() => {
      setTimeout(() => {
        this.detectBreakPoints();
      }, 0);
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
        if (this.dv && change.findIndex(value => value.mqAlias === 'lt-md') !== -1) {
          this.disableList = true;
          this.dv.changeLayout('grid');
        } else {
          this.disableList = false;
        }
      });
    }
  }

  public changeLayout(event: Event, layout: string) {
    this.dv.changeLayout(layout);
    event.preventDefault();
  }

  // public async onSelect(asset: IAsset) {
  //   await window.open('/asset/' + asset.recordId);
  // }

  async openAddAssetDialog(): Promise<void> {
    const dRef = this.dialog.open(AddAssetComponent, {
      panelClass: 'width-dialog',
      maxHeight: '100vh',
      data: {
        editMode: false,
      }
    });
    const result: any = await firstValueFrom(dRef.afterClosed());
    if (result && result.status && result.id) {
      this.snackBar.open(messages.SUCCESS_ASSET_INSERT['pt-BR'], 'Ok', {duration: 3000});
      this.assetsService.loadAssets(result.id).catch(console.log);
    }
  }
}
