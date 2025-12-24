export interface IAsset {
  recordId: string;
  recordIdHash?: string;
  supply: string;
  feesMap?: Map<string, number>;

  title: string;
  description: string;
  type: string;
  address: IAddress;
  totalArea: number;
  grossLettableArea: number;
  rented: boolean;
  netRent: number;
  offer?: IOffer;
  offersHistory?: IOffer[];
  purchaseOrders?: Map<string, IPurchaseOrder>;
  purchaseOrdersArray?: Array<IPurchaseOrder>;
  healthy?: boolean;
  homeGallery?: IGallery[];

  gallery?: IGallery[];
  showArrow?: boolean;
  documents?: File[];

  rentDisplay?: string;
  totalValue?: string;
  minCost?: string;
  shareOwned?: (value: number) => string;
  userRent?: (value: number) => string;
  roi?: (value: number) => string;
  totalCost?: (value: number) => string;
}

export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface IOffer {
  price: number;
  lot: number;
  allowFractionalIncrements: boolean;
  active?: boolean;
  feesMap?: Map<string, number>;

  numShares: number;
  preSale: boolean;
  preSaleEndDate: Date;
  preSaleThreshold: number;
  maxHolderShares?: number;
  availableBalance?: number;
  healthy?: boolean;
}

export interface IPurchaseOrder {
  quantity: number;
  shares?: number;
  from?: string;
  email?: string;
  account?: string;
}

export interface IBalance {
  recordId: string;
  balance: number;
  pendingBalance?: number;
}

export interface IHolder {
  account: string;
  balance: number;

  firstName?: string;
  lastName?: string;
  email?: string;
  bank?: string;
  bankBranch?: string;
  bankAccount?: string;
  yield?: number;
}

export interface IReport {
  recordId: string;
  reportHash: string;
  reportUrl: string;
}

enum FileType {
  Image = 'image',
  Document = 'documet'
}

export interface IFileObject {
  type: FileType;
  file: File;
  preview?: HTMLImageElement;
}

export interface IGallery {
  featured?: boolean;
  src: string;
  portrait: boolean;
}

export interface IAssetResponse {
  statusCode: number;
  message: string;
  data?: IAsset;
  error?: string;
}

export interface IAssetsResponse {
  statusCode: number;
  message: string;
  data?: IAsset[];
  error?: string;
}

export interface IOfferResponse {
  statusCode: number;
  message: string;
  data?: IOffer;
  error?: string;
}

export interface IPurchaseOrderResponse {
  statusCode: number;
  message: string;
  data?: IPurchaseOrder;
  error?: string;
}

export interface IBalancesResponse {
  statusCode: number;
  message: string;
  data?: IBalance[];
  error?: string;
}

export interface IHoldersResponse {
  statusCode: number;
  message: string;
  data?: IHolder[];
  error?: string;
}

export interface IUpdateReportResponse {
  statusCode: number;
  message: string;
  report?: IReport;
  error?: string;
}
