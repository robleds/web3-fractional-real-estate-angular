import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AssetsService} from '../../services/assets.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  brltBalance: number;
  assetsBalance: any[]; // Balance[];
  transactions: any[];

  constructor(
    private router: Router,
    private assetsService: AssetsService,
  ) {
    this.brltBalance = 0;
    this.assetsBalance = [];

    this.transactions = [
      {
        id: 0,
        record_id: 'cnr0001reg0001',
        shares: '100',
        value: 'R$ 100.000,00'
      },
      {
        id: 1,
        record_id: 'cnr0001reg0002',
        shares: '200',
        value: 'R$ 250.000,00'
      }
    ];

  }

  async ngOnInit() {
    await this.assetsService.loadAssets().catch(console.log);
    // const getBalanceResult = await this.financialService.getBrltBalance(this.usersService.currentUser);
    // this.brltBalance = getBalanceResult.balance;
    // this.assetsBalance = await this.processAssetsBalance();
  }

  // async processAssetsBalance(): Promise<any> {
  //   const assetsBalance = await this.financialService.getAssetBalances(this.usersService.currentUser);
  //   const contractAssetsBalance = await this.financialService.getAssetBalances('bricksoffers');

    // this.dataService.assets.forEach(asset => {
    //   if (asset.offer && asset.offer.owner === this.usersService.currentUser) {
    //     const contractBalance = contractAssetsBalance.find(balance => balance.record_id === asset.recordId);
    //
    //     if (contractBalance.balance > 0) {
    //       const balance = assetsBalance.find(assetBalance => assetBalance.record_id === asset.recordId);
    //       if (balance) {
    //         balance.balance += contractBalance.balance;
    //       } else {
    //         assetsBalance.push(contractBalance);
    //       }
    //     }
    //   }
    // });

    // return assetsBalance;
  // }
  //
  async onSelect(recordId) {
    // await window.open('/asset/' + recordId);
  }
}
