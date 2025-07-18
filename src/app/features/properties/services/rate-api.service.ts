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
            uuid: 'seg-001',
            name: 'Segment A'
          },
          subSegment: {
            uuid: 'sub-001',
            name: 'Subsegment A1'
          },
          unit: {
            uuid: unitId
          },
          audit: {
            createdAt: new Date('2024-06-01T10:00:00Z'),
            createdBy: 'Admin',
            modifiedAt: new Date('2024-06-10T15:30:00Z'),
            modifiedBy: 'Admin'
          }
        },
        {
          id: 'rate-plan-002',
          name: 'Flexible Rate Plan',
          enabled: false,
          segment: {
            uuid: 'seg-002',
            name: 'Segment B'
          },
          subSegment: {
            uuid: 'sub-002',
            name: 'Subsegment B1'
          },
          unit: {
            uuid: unitId
          },
          audit: {
            createdAt: new Date('2024-06-05T12:00:00Z'),
            createdBy: 'Manager',
            modifiedAt: new Date('2024-06-15T18:45:00Z'),
            modifiedBy: 'Manager'
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
