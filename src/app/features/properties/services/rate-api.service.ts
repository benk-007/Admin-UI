import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {DefaultRateModel} from '../models/rate/commons/default-rate.model';
import {environment} from '../../../../environments/environment';
import {RatePlanPostModel} from '../models/rate/post/rate-plan-post.model';
import {RatePlanGetModel} from '../models/rate/get/rate-plan-get.model';
import {PageModel} from '../../../shared/models/pageable/page.model';
import {Observable, of} from 'rxjs';


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

  createRatePlan(payload: RatePlanPostModel) {
    return this.httpClient.post<RatePlanPostModel>(
      environment.apiBaseUrl.concat(environment.RatePlan),
      payload
    );
  }

  getRatePlansByPage(
    unitId: string,
    page: number,
    size: number,
    sort: string,
    sortDirection: string,
    search: string
  ): Observable<PageModel<RatePlanGetModel>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PageModel<RatePlanGetModel>>(
      `${environment.apiBaseUrl}${environment.RatePlan}?unitId=${unitId}`,
      { params }
    );
  }

  updateRatePlan(ratePlanId: string, payload: RatePlanPostModel) {
    return this.httpClient.patch<RatePlanPostModel>(
      `${environment.apiBaseUrl}${environment.RatePlan}/${ratePlanId}`,
      payload
    );
  }

  deleteRatePlan(ratePlanId: string) {
    return this.httpClient.delete<void>(
      `${environment.apiBaseUrl}${environment.RatePlan}/${ratePlanId}`
    );
  }
}
