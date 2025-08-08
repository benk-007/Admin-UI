import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PageModel } from '../../../shared/models/pageable/page.model';
import { FeeGetModel } from '../../properties/models/fee/get/fee-get.model';
import { FeePostModel } from '../../properties/models/fee/post/fee-post.model';
import { FeePatchModel } from '../../properties/models/fee/patch/fee-patch.model';

@Injectable({
  providedIn: 'root'
})
export class GenericFeeApiService {

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Create a new generic fee (property-wide)
   */
  createGenericFee(payload: Omit<FeePostModel, 'unit'>): Observable<FeeGetModel> {
    return this.httpClient.post<FeeGetModel>(
      environment.apiBaseUrl.concat(environment.fees),
      payload
    );
  }

  /**
   * Get generic fees (property-wide fees without unitId)
   */
  getGenericFees(
    page: number = 0,
    size: number = 10,
    sort: string = 'name',
    sortDirection: string = 'asc',
    search?: string
  ): Observable<PageModel<FeeGetModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('generic', 'true'); // Parameter to indicate we want only generic fees

    // Add sort parameter if provided
    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

    // Add search parameter if provided
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.httpClient.get<PageModel<FeeGetModel>>(
      environment.apiBaseUrl.concat(environment.fees),
      { params }
    );
  }

  /**
   * Update an existing generic fee
   */
  updateGenericFee(feeId: string, payload: FeePatchModel): Observable<FeeGetModel> {
    return this.httpClient.patch<FeeGetModel>(
      environment.apiBaseUrl.concat(environment.fees).concat(`/${feeId}`),
      payload
    );
  }

  /**
   * Delete a generic fee
   */
  deleteGenericFee(feeId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.fees).concat(`/${feeId}`)
    );
  }

  /**
   * Get all generic fees for selection (without pagination)
   * Used for copy functionality or selection lists
   */
  getAllGenericFees(search?: string): Observable<FeeGetModel[]> {
    let params = new HttpParams()
      .set('generic', 'true')
      .set('size', '1000'); // Large size to get all

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.httpClient.get<PageModel<FeeGetModel>>(
      environment.apiBaseUrl.concat(environment.fees),
      { params }
    ).pipe(
      map(response => response.content)
    );
  }
}
