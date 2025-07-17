import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
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

  createRatePlan(payload: RatePlanPostModel) {
    return this.httpClient.post<RatePlanPostModel>(
      environment.apiBaseUrl.concat(environment.RatePlan),
      payload
    );
  }

  /*getRatePlansByPage(
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
  }*/

  getRatePlansByPage(
    unitId: string,
    page: number,
    size: number,
    sort: string,
    sortDirection: string,
    search: string
  ): Observable<PageModel<RatePlanGetModel>> {
    const mockData: PageModel<RatePlanGetModel> = {
      content: [
        {
          id: 'rate-plan-001',
          name: 'Standard Rate Plan',
          enabled: true,
          segment: {
            id: 'seg-001',
            name: 'Segment A'
          },
          subSegment: {
            id: 'sub-001',
            name: 'Subsegment A1'
          },
          unit: {
            uuid: unitId
          }
        },
        {
          id: 'rate-plan-002',
          name: 'Flexible Rate Plan',
          enabled: false,
          segment: {
            id: 'seg-002',
            name: 'Segment B'
          },
          subSegment: {
            id: 'sub-002',
            name: 'Subsegment B1'
          },
          unit: {
            uuid: unitId
          }
        }
      ],
      totalElements: 2,
      totalPages: 1,
      size: size,
      number: page,
      pageable: {
        sort: {
          sorted: false,
          unsorted: true,
          empty: true
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
        sorted: false,
        unsorted: true,
        empty: true
      },
      empty: false
    };

    return of(mockData);
  }
}
