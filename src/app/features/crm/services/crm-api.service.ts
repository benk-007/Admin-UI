import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {PageFilterModel} from '../../../shared/models/page-filter.model';
import {PageModel} from '../../../shared/models/pageable/page.model';
import {environment} from '../../../../environments/environment';
import {SegmentPostModel} from '../../settings/models/segment/segment-post.model';
import {SegmentItemGetModel} from '../../settings/models/segment/segment-item-get.model';
import {PartyItemGetModel} from '../models/party/party-item-get.model';

@Injectable({
  providedIn: 'root'
})
export class CrmApiService {

  constructor(private readonly httpClient: HttpClient) {
  }

  getSegmentsByPage(pageFilter: PageFilterModel) {
    let params = new HttpParams();
    params = params.set('page', pageFilter.page);
    params = params.set('size', pageFilter.size);
    if (pageFilter.search || pageFilter.advancedSearchFormValue?.search) {
      let searchValue = pageFilter.search ? pageFilter.search : pageFilter.advancedSearchFormValue.advancedSearch;
      params = params.set('search', searchValue);
    }
    if (pageFilter.advancedSearchFormValue?.withParent != null) {
      params = params.set('withParent', pageFilter.advancedSearchFormValue.withParent)
    }
    if (pageFilter.advancedSearchFormValue?.enabled != null) {
      params = params.set('enabled', pageFilter.advancedSearchFormValue.enabled);
    }
    return this.httpClient.get<PageModel<SegmentItemGetModel>>(environment.apiBaseUrl.concat(environment.segmentList), {params});
  }

  postSegment(payload: SegmentPostModel) {
    return this.httpClient.post<SegmentItemGetModel>(environment.apiBaseUrl.concat(environment.segmentList), payload);
  }

  patchSegmentById(segmentId: string, payload: SegmentPostModel) {
    return this.httpClient.patch<SegmentItemGetModel>(environment.apiBaseUrl.concat(environment.segmentById.replace(':segmentId', segmentId)), payload);
  }

  getPartiesByPage(pageFilter: PageFilterModel) {
    let params = new HttpParams();
    params = params.set('page', pageFilter.page);
    params = params.set('size', pageFilter.size);
    if (pageFilter.search) {
      params = params.set('search', pageFilter.search);
    }
    return this.httpClient.get<PageModel<PartyItemGetModel>>(environment.apiBaseUrl.concat(environment.partyList), {params});
  }
}
