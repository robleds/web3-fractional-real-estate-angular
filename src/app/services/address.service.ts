import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IAddress} from '../interfaces';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly _states: any[];
  private _cities: any[];
  public events = new EventEmitter();
  public lastLoadState: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this._states = [];
    this._cities = [];
    this.loadStates();
  }

  get states(): any[] {
    return this._states;
  }

  get cities(): any[] {
    return this._cities;
  }

  private loadStates() {
    const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
    this.httpClient.get(url).toPromise().then((states: any) => {
      for (const state of states) {
        this._states.push({
          id: state.id,
          code: state.sigla,
          name: state.nome
        });
      }
      this.events.emit('LOADED_STATES');
    }).catch(() => {
      this.events.emit('ERROR');
    });
  }

  async searchCities(stateId: string) {

    if (this.lastLoadState === stateId) {
      return;
    }

    this._cities = [];
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`;
    const req$ = this.httpClient.get(url);
    const cities = await firstValueFrom(req$) as any;
    for (const city of cities) {
      this._cities.push({
        id: city.id,
        name: city.nome
      });
    }
    this.lastLoadState = stateId;
  }

  public searchZipCode(zipCode: string): Promise<IAddress> {
    return new Promise((resolve, reject) => {
      const url = `https://viacep.com.br/ws/${zipCode}/json/`;
      this.httpClient.get(url).toPromise().then((result: any) => {
        if (result.hasOwnProperty('erro')) {
          reject();
        }

        const address: IAddress = {
          street: result.logradouro,
          number: '',
          zipCode,
          neighborhood: result.bairro,
          city: result.localidade,
          state: result.uf,
          country: result.pais
        };

        resolve(address);
      }).catch(() => {
        reject();
      });
    });
  }
}
