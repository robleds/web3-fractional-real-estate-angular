import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {parallelLimit} from 'async';
import {
  IAsset,
  IAssetResponse,
  IAssetsResponse,
  IBalancesResponse,
  IHoldersResponse,
  IOffer,
  IOfferResponse,
  IPurchaseOrder,
  IPurchaseOrderResponse,
  IReport,
  IUpdateReportResponse
} from '../interfaces';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';
import {firstValueFrom} from 'rxjs';
import {DecimalPipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {

  constructor(private httpClient: HttpClient,
              private authService: AuthService,
              private decimalPipe: DecimalPipe) {
    this._assets = [];
    this._loaded = false;
    this._selectedAsset = null;
    this._purchaseData = null;

    this.assetsUrl = environment.serverApiUrl + '/assets';
    this.offersUrl = environment.serverApiUrl + '/offers';
    this.ordersUrl = environment.serverApiUrl + '/orders';
    this.balancesUrl = environment.serverApiUrl + '/balances';
    this.holdersUrl = environment.serverApiUrl + '/holders';
    this.reportsUrl = environment.serverApiUrl + '/reports';
  }

  get assets(): IAsset[] {
    return this._assets;
  }

  set assets(data: IAsset[]) {
    this._assets = data;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get selectedAsset(): IAsset {
    return this._selectedAsset;
  }

  get purchaseData(): any {
    return this._purchaseData;
  }

  set purchaseData(data: any) {
    this._purchaseData = data;
  }

  private _assets: IAsset[];
  private _loaded: boolean;
  private _selectedAsset: IAsset;
  private _purchaseData: any;

  private readonly assetsUrl: string;
  private offersUrl: string;
  private ordersUrl: string;
  private readonly balancesUrl: string;
  private holdersUrl: string;
  private readonly reportsUrl: string;
  private loading = false;

  private static convertToCSV(objectArray) {
    let data = '';

    for (const element of objectArray) {
      if (data === '') {
        for (const key in element) {
          if (!element.hasOwnProperty(key)) {
            continue;
          }

          if (data !== '') {
            data += ',';
          }
          data += key;
        }
        data += '\r\n';
      }

      let row = '';

      for (const key in element) {
        if (!element.hasOwnProperty(key)) {
          continue;
        }

        if (row !== '') {
          row += ',';
        }
        row += element[key];
      }

      data += row + '\r\n';
    }

    return data;
  }

  public async addAsset(asset: IAsset): Promise<IAssetResponse> {
    try {
      if (this.assets.find((element: IAsset) => element.recordId === asset.recordId)) {
        return {
          statusCode: 400,
          message: 'ASSET_ALREADY_REGISTERED'
        };
      }
      return await this.upsertAsset(asset);
    } catch (error) {
      return {
        statusCode: 500,
        error: error.message,
        message: error.message
      };
    }
  }

  public async editAsset(asset: IAsset): Promise<void> {
    return;
  }

  public async deleteAsset(recordId: string): Promise<IAssetResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.delete(this.assetsUrl + '/', {params, headers}).toPromise() as IAssetResponse;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async loadAssets(recordId: string = ''): Promise<void> {
    try {
      const result = await this.getAssets(recordId);
      if (result.statusCode !== 200) {
        return;
      }

      // Load specific asset
      if (recordId && result.data.length > 0) {
        const assetIndex = this._assets.findIndex((asset: IAsset) => asset.recordId === recordId);
        await this.processAsset(result.data[0])((error, asset) => {
          if (!error) {
            if (assetIndex === -1) {
              this._assets.push(asset);
            } else {
              this._assets[assetIndex] = asset;
            }
            this.selectAsset(asset.recordId).catch(console.log);
          } else {
            console.log(error);
            return;
          }
        });

      } else {
        for (const item of result.data) {
          const idx = this._assets.findIndex((asset: IAsset) => asset.recordId === item.recordId);
          if (idx !== -1) {
            item.gallery = this._assets[idx].gallery;
            this._assets[idx] = item;
          } else {
            this._assets.push(item);
          }
        }
        const processAssetFuncs = [];
        this._assets.forEach((asset: IAsset) => {
          processAssetFuncs.push(this.processAsset(asset));
        });
        await parallelLimit(processAssetFuncs, 10);
      }
      this._loaded = true;
    } catch (error) {
      this._loaded = false;
      console.log(error);
    }
  }

  public async selectAsset(recordId?: string): Promise<void> {
    if (!this._loaded && !this.loading) {
      this.loading = true;
      await this.loadAssets(recordId);
      this.loading = false;
    }
    if (recordId) {
      this._selectedAsset = this._assets.find((asset: IAsset) => asset.recordId === recordId);
    }
  }

  public async setupOffer(recordId: string, offer: IOffer): Promise<IOfferResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };

      return await this.httpClient.post(this.offersUrl, {recordId, offer}, {headers}).toPromise() as IOfferResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async deleteOffer(recordId: string): Promise<IOfferResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.delete(this.offersUrl + '/', {params, headers}).toPromise() as IOfferResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async activateOffer(recordId: string): Promise<IOfferResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.post(this.offersUrl + '/activate/', {}, {params, headers}).toPromise() as IOfferResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async deactivateOffer(recordId: string): Promise<IOfferResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.post(this.offersUrl + '/deactivate/', {}, {params, headers}).toPromise() as IOfferResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async createPurchaseOrder(recordId: string, purchaseOrder: IPurchaseOrder): Promise<IPurchaseOrderResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const body = {
        recordId,
        purchaseOrder
      };

      return await this.httpClient.post(this.ordersUrl, body, {headers}).toPromise() as IPurchaseOrderResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async approvePurchaseOrder(recordId: string, from: string): Promise<IPurchaseOrderResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.post(this.ordersUrl + '/approve/', {from}, {params, headers}).toPromise() as IPurchaseOrderResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async denyPurchaseOrder(recordId: string, from: string): Promise<IPurchaseOrderResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.post(this.ordersUrl + '/deny/', {from}, {params, headers}).toPromise() as IPurchaseOrderResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async getBalances(): Promise<IBalancesResponse> {
    try {
      const getBalances$ = this.httpClient.get(this.balancesUrl, this.authService.buildOptions());
      return await firstValueFrom(getBalances$) as unknown as IBalancesResponse;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public async getHolders(recordId: string): Promise<IHoldersResponse> {
    try {
      const headers = {
        Authorization: 'Bearer ' + this.authService.token
      };
      const params = new HttpParams().set('recordId', recordId);

      return await this.httpClient.get(this.holdersUrl + '/', {params, headers}).toPromise() as IHoldersResponse;
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  public exportIncomePaymentFile(data: any) {
    const csvData = AssetsService.convertToCSV(data);

    const blob = new Blob(['\ufeff' + csvData], {type: 'text/csv;charset=utf-8;'});
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);

    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      dwldLink.setAttribute('target', '_blank');
    }

    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', `IncomePayment_${new Date(Date.now()).toISOString()}.csv`);
    dwldLink.style.visibility = 'hidden';

    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  async upsertAsset(asset: IAsset): Promise<IAssetResponse> {
    try {
      const headers = {Authorization: 'Bearer ' + this.authService.token};
      const upsertAsset$ = this.httpClient.post(this.assetsUrl, asset, {headers});
      return await firstValueFrom(upsertAsset$) as IAssetResponse;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  private async getAssets(recordId: string = ''): Promise<IAssetsResponse> {
    try {
      const headers = {Authorization: 'Bearer ' + this.authService.token};
      const params = new HttpParams().set('recordId', recordId);
      const getAssets$ = this.httpClient.get(this.assetsUrl + '/', {params, headers});
      return await firstValueFrom(getAssets$) as IAssetsResponse;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  private async updateReport(report: IReport): Promise<IUpdateReportResponse> {
    try {
      const headers = {Authorization: 'Bearer ' + this.authService.token};
      const updateReport$ = this.httpClient.post(this.reportsUrl, report, {headers});
      return await firstValueFrom(updateReport$) as IUpdateReportResponse;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: error.statusText,
        error: error.message
      };
    }
  }

  private processAsset(asset: IAsset) {
    return async (callback) => {
      try {
        asset.purchaseOrdersArray = [];
        if (asset.purchaseOrders) {
          asset.purchaseOrders = new Map<string, IPurchaseOrder>(Object.entries(asset.purchaseOrders));

          for (const [from, purchaseOrder] of asset.purchaseOrders.entries()) {
            this.authService.getAccountInfo(from).then((result: any) => {
              if (result && result.status) {
                purchaseOrder.from = result.user.firstName;
                purchaseOrder.email = result.user.email;
              }
            });

            purchaseOrder.account = from;
            asset.purchaseOrdersArray.push(purchaseOrder);
          }
        }

        if (asset.offer && asset.offer.preSaleEndDate) {
          asset.offer.preSaleEndDate = new Date(asset.offer.preSaleEndDate);
        }

        // Load Images
        if (!asset.gallery) {
          const assetImages = await this.getImages(asset.recordId);
          if (assetImages.length > 0) {
            asset.gallery = assetImages.map((image) => {
              return {src: image[0], portrait: image[1] === 'portrait'};
            });
          } else {
            asset.gallery = [];
          }
        }

      } catch (error) {
        console.log(error);
      }

      // TODO: Load documents

      // decimal display calcs
      const pipeAndAddZero = (n: number): string => {
        const val = this.decimalPipe.transform(n, '1.0-2', 'pt-BR');
        return val + this.addZero(n);
      };

      asset.rentDisplay = pipeAndAddZero(Math.round(asset.netRent * 100) / 100);

      const offer = asset.offer;
      if (offer) {
        asset.totalValue = pipeAndAddZero(Math.round(offer.price * parseFloat(asset.supply) * 100) / 100);
        asset.minCost = pipeAndAddZero(Math.round(offer.price * offer.lot * 100) / 100);

        asset.shareOwned = (value) => this.decimalPipe.transform(
          (value / parseFloat(asset.supply)) * 100,
          '1.0-2',
          'pt-BR'
        );

        asset.userRent = (value) => pipeAndAddZero(Math.round((value / parseFloat(asset.supply)) * asset.netRent * 100) / 100);

        asset.roi = (value) => this.decimalPipe.transform(
          (((value / parseFloat(asset.supply)) * asset.netRent) / (offer.price * value)) * 100,
          '1.0-2',
          'pt-BR'
        );
        asset.totalCost = (value) => pipeAndAddZero(Math.round(offer.price * value * 100) / 100);
      }

      callback(null, asset);
    };
  }

  addZero(num: number) {
    const str = num.toFixed(2);
    if (num.toString().split('.').length > 1) {
      return str.endsWith('0') ? '0' : '';
    } else {
      return '';
    }
  }

  private async getImages(recordId: string) {
    const getAssetImages$ = this.httpClient.get(`${environment.apiHost}/public/getAssetImages/${recordId}`);
    const data = await firstValueFrom(getAssetImages$) as string[];
    if (data.length === 0) {
      console.warn(`No images found for asset ${recordId}`);
    }
    return data;
  }
}
