import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {DefaultRateModel} from '../models/rate/commons/default-rate.model';
import {environment} from '../../../../environments/environment';
import {RatePlanPostModel} from '../models/rate/post/rate-plan-post.model';
import {RatePlanGetModel} from '../models/rate/get/rate-plan-get.model';
import {PageModel} from '../../../shared/models/pageable/page.model';
import {Observable, of} from 'rxjs';
import {RateTablePostModel} from '../models/rate/post/rate-table-post.model';
import {RateTableGetModel} from '../models/rate/get/rate-table.get.model';


@Injectable({
  providedIn: 'root'
})
export class RateApiService {

  constructor(private httpClient: HttpClient) {
  }

  /*===========Default Rate===========*/

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

  /*===========Rate Plan===========*/

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

    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

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

  /*===========Rate Table===========*/

  createRateTable(payload: RateTablePostModel) {
    return this.httpClient.post<RateTablePostModel>(
      environment.apiBaseUrl.concat(environment.RateTable),
      payload
    );
  }

  /*getRateTablesByRatePlan(
    ratePlanId: string,
    page: number,
    size: number,
    sort: string,
    sortDirection: string,
    search: string
  ): Observable<PageModel<RateTableGetModel>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString());

    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PageModel<RateTableGetModel>>(
      `${environment.apiBaseUrl}${environment.RateTable}?ratePlanUuid=${ratePlanId}`,
      { params }
    );
  }*/

  updateRateTable(rateTableId: string, payload: RateTablePostModel) {
    return this.httpClient.patch<RateTablePostModel>(
      `${environment.apiBaseUrl}${environment.RateTable}/${rateTableId}`,
      payload
    );
  }


  getRateTablesByRatePlan(
    ratePlanId: string,
    page: number,
    size: number,
    sort: string,
    sortDirection: string,
    search: string
  ): Observable<PageModel<RateTableGetModel>> {
    const mockData: PageModel<RateTableGetModel> = {
      content: [
        {
          id: 'table-001',
          name: 'Standard Table A',
          startDate: '2025-06-01',
          endDate: '2025-09-01',
          type: 'STANDARD',
          nightly: 120,
          minStay: 2,
          maxStay: 10,
          daySpecificRates: [
            { nightly: 110, days: ['FRIDAY', 'SATURDAY'] },
            { nightly: 150, days: ['SUNDAY'] },
            { nightly: 100, days: ['SUNDAY'] },
            { nightly: 110, days: ['FRIDAY', 'SATURDAY'] },
            { nightly: 150, days: ['SUNDAY'] },
            { nightly: 100, days: ['SUNDAY'] }
          ],
          additionalGuestFees: [
            {
              guestCount: 1,
              guestType: 'ADULT',
              amountType: 'FLAT',
              value: 20,
              ageBucket: {}
            },
            {
              guestCount: 1,
              guestType: 'CHILD',
              amountType: 'PERCENT',
              value: 0,
              ageBucket: { fromAge: 0, toAge: 4 }
            },
            {
              guestCount: 2,
              guestType: 'CHILD',
              amountType: 'PERCENT',
              value: 15,
              ageBucket: { fromAge: 5, toAge: 12 }
            },
            {
              guestCount: 2,
              guestType: 'CHILD',
              amountType: 'PERCENT',
              value: 15,
              ageBucket: { fromAge: 13, toAge: 18 }
            }
          ],
          audit: {
            createdBy: 'admin',
            createdAt: new Date(),
            modifiedBy: 'admin',
            modifiedAt: new Date()
          },
          ratePlan: { uuid: ratePlanId }
        },
        {
          id: 'table-002',
          name: 'Dynamic Table B',
          startDate: '2025-12-15',
          endDate: '2026-01-10',
          type: 'DYNAMIC',
          lowRate: 100,
          lowestOccupancy: 1,
          maxRate: 300,
          maxOccupancy: 4,
          minStay: 3,
          maxStay: 14,
          daySpecificRates: [],
          additionalGuestFees: [],
          audit: {
            createdBy: 'manager',
            createdAt: new Date(),
            modifiedBy: 'manager',
            modifiedAt: new Date()
          },
          ratePlan: { uuid: ratePlanId }
        }
      ],
      totalElements: 2,
      totalPages: 1,
      size: size,
      number: page,
      pageable: {
        sort: {
          sorted: !!sort,
          unsorted: !sort,
          empty: !sort
        },
        offset: page * size,
        pageNumber: page,
        pageSize: size,
        paged: true,
        unpaged: false
      },
      last: true,
      first: true,
      numberOfElements: 2,
      sort: {
        sorted: !!sort,
        unsorted: !sort,
        empty: !sort
      },
      empty: false
    };

    return of(mockData);
  }


}
