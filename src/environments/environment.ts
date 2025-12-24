// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiHost: 'https://brbrix.com/v1',
  serverApiUrl: 'https://brbrix.com/api',
  imageApiUrl: 'https://brbrix.com/image_api',
  imageServer: 'https://brbrix.com/images',
  documentsApiUrl: '',
  assets: {
    assetTypes: [
      {name: 'Galpão/Armazém'},
      {name: 'Hotel'},
      {name: 'Loja'},
      {name: 'Lote/Terreno'},
      {name: 'Prédio Comercial'},
      {name: 'Sala'},
      {name: 'Shopping'}
    ]
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
