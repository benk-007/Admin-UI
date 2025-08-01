import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageModel } from '../../../shared/models/pageable/page.model';
import { FeeGetModel } from '../models/fee/get/fee-get.model';
import { FeePostModel } from '../models/fee/post/fee-post.model';

@Injectable({
  providedIn: 'root'
})
export class FeeApiService {

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Create a new fee
   */
  createFee(payload: FeePostModel): Observable<FeeGetModel> {
    return this.httpClient.post<FeeGetModel>(
      environment.apiBaseUrl.concat(environment.fees),
      payload
    );
  }

  /**
   * Get fees by unit ID with pagination
   */
  getFeesByUnitId(
    unitId: string,
    page: number = 0,
    size: number = 5,
    sort: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<PageModel<FeeGetModel>> {
    let params = new HttpParams()
      .set('unitId', unitId)
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

    return this.httpClient.get<PageModel<FeeGetModel>>(
      environment.apiBaseUrl.concat(environment.fees),
      { params }
    );
  }

  /**
   * Update an existing fee
   */
  updateFee(feeId: string, payload: FeePostModel): Observable<FeeGetModel> {
    return this.httpClient.put<FeeGetModel>(
      environment.apiBaseUrl.concat(environment.fees).concat(`/${feeId}`),
      payload
    );
  }

  /**
   * Get all fees with pagination (for copy from functionality)
   */
  getAllFees(
    page: number = 0,
    size: number = 5,
    sort: string = 'createdAt',
    sortDirection: string = 'desc',
    search?: string
  ): Observable<PageModel<FeeGetModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PageModel<FeeGetModel>>(
      environment.apiBaseUrl.concat(environment.fees),
      { params }
    );
  }

  /**
   * Apply fees to units (copy)
   */
  applyFeesToUnits(payload: {
    feeIds: string[];
    unitIds: string[];
  }): Observable<void> {
    return this.httpClient.post<void>(
      environment.apiBaseUrl.concat(environment.feesApply),
      payload
    );
  }

  /**
   * Apply fees to units (overwrite)
   */
  overwriteUnitsWithFees(payload: {
    feeIds: string[];
    unitIds: string[];
  }): Observable<void> {
    return this.httpClient.post<void>(
      environment.apiBaseUrl.concat(environment.feesApply).concat('?overwrite=true'),
      payload
    );
  }
}
