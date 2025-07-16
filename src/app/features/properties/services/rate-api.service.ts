import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {DefaultRateModel} from '../models/rates/commons/default-rate.model';


@Injectable({
  providedIn: 'root'
})
export class RateApiService {

  constructor(private httpClient: HttpClient) {
  }

  getDefaultRate(unitId: string) {
    return this.httpClient.get<DefaultRateModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById),
      {
        params: { unitId }
      }
    );
  }

  postDefaultRate(payload: DefaultRateModel) {
    return this.httpClient.post<DefaultRateModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById),
      payload
    );
  }

  patchDefaultRate(rateId: string, payload: DefaultRateModel) {
    return this.httpClient.patch<DefaultRateModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById).concat(`/${rateId}`),
      payload
    );
  }

}
