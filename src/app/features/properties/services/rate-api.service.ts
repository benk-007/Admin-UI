import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {RatesModel} from "../models/rates/rates.model";
/*import {TablePostModel} from "../../settings/rates/tables/models/table-post.model";
import {TableItemGetModel} from "../../settings/rates/tables/models/table-get.model";*/
import {RatesTableItemGetModel} from "../models/rates/rates-table-item-get.model";
import {RatesTableGetModel} from "../models/rates/rates-table-get.model";


@Injectable({
  providedIn: 'root'
})
export class RateApiService {

  constructor(private httpClient: HttpClient) {
  }

  getUnitRatesById(unitId: string) {
    return this.httpClient.get<RatesModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById).replace(':unitId', unitId)
    );
  }

  patchUnitRatesById(unitId: string, payload: RatesModel) {
    return this.httpClient.patch<RatesModel>(
      environment.apiBaseUrl.concat(environment.unitBaseRateById).replace(':unitId', unitId),
      payload
    );
  }




  getRatesTablesByPage(page: number, size: number, sort: string, sortDirection: string, search: string, unitId: string): Observable<PageModel<RatesTableItemGetModel>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    params = params.set('size', size.toString());
    params = params.set('page', page.toString());

    return this.httpClient.get<PageModel<RatesTableItemGetModel>>(environment.apiBaseUrl.concat(environment.rateList), {params});
  }

  getRatesTableById(ratesTableId: string) {
    return this.httpClient.get<RatesTableGetModel>(environment.apiBaseUrl.concat(environment.rateById).replace(':ratesTableId', ratesTableId));
  }

  postRatesTable(payload: any): Observable<RatesTableGetModel> {
    return this.httpClient.post<RatesTableGetModel>(
      environment.apiBaseUrl.concat(environment.rateList), payload);
  }

  patchRatesTableById(payload: any, rateId: string): Observable<RatesTableGetModel> {
    return this.httpClient.patch<RatesTableGetModel>(
      environment.apiBaseUrl.concat(environment.rateById).replace(':ratesTableId', rateId),
      payload
    );
  }

  deleteRatesTableById(ratesTableId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.rateById).replace(':ratesTableId', ratesTableId)
    );
  }


}
