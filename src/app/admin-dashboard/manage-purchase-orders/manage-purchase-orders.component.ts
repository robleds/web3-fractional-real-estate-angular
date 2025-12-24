import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AssetsService} from '../../services/assets.service';
import {IPurchaseOrderResponse} from '../../interfaces';
import {messages} from '../../messages';

@Component({
  selector: 'app-manage-purchase-orders',
  templateUrl: './manage-purchase-orders.component.html',
  styleUrls: ['./manage-purchase-orders.component.css']
})
export class ManagePurchaseOrdersComponent implements OnInit {
  public displayedColumns: string[];

  constructor(private snackBar: MatSnackBar, public assetsService: AssetsService) {
    this.displayedColumns = ['from', 'email', 'quantity', 'shares', 'actions'];
  }

  ngOnInit(): void {
    this.assetsService.loadAssets().catch(console.log);
  }

  public onApprove(recordId: string, from: string) {
    this.assetsService.approvePurchaseOrder(recordId, from).then((result: IPurchaseOrderResponse) => {
      if (result.statusCode !== 200) {
        this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
        return;
      }

      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});

      this.assetsService.loadAssets(recordId).catch(console.log);
    });
  }

  public onDeny(recordId: string, from: string) {
    this.assetsService.denyPurchaseOrder(recordId, from).then((result: IPurchaseOrderResponse) => {
      if (result.statusCode !== 200) {
        this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});
        return;
      }

      this.snackBar.open(messages[result.message]['pt-BR'], 'OK', {duration: 2000});

      this.assetsService.loadAssets(recordId).catch(console.log);
    });
  }
}
