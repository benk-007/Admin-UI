import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageModel } from '../../../shared/models/pageable/page.model';
import { FeeGetModel } from '../models/fee/get/fee-get.model';
import { FeePostModel } from '../models/fee/post/fee-post.model';
import { FeePatchModel } from '../models/fee/patch/fee-patch.model';

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
   * Backend expects unitIds as Set<String> parameter
   */
  getFeesByUnitId(
    unitId: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<PageModel<FeeGetModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Backend expects unitIds as Set<String>, so we pass it as unitIds parameter
    params = params.set('unitIds', unitId);

    // Add sort parameter if provided
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
  updateFee(feeId: string, payload: FeePatchModel): Observable<FeeGetModel> {
    return this.httpClient.patch<FeeGetModel>(
      environment.apiBaseUrl.concat(environment.fees).concat(`/${feeId}`),
      payload
    );
  }

  /**
   * Delete a fee
   */
  deleteFee(feeId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.fees).concat(`/${feeId}`)
    );
  }

  /**
   * Get all fees with pagination and optional filters
   * Used for copy functionality
   */
  getAllFees(
    page: number = 0,
    size: number = 10,
    sort: string = 'name',
    sortDirection: string = 'asc',
    search?: string,
    unitIds?: string[]
  ): Observable<PageModel<FeeGetModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Add sort parameter
    if (sort) {
      params = params.set('sort', `${sort},${sortDirection}`);
    }

    // Add search parameter if provided
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    // Add unitIds filter if provided
    // Backend expects Set<String> so we add each unitId separately
    if (unitIds && unitIds.length > 0) {
      unitIds.forEach(unitId => {
        params = params.append('unitIds', unitId);
      });
    }

    return this.httpClient.get<PageModel<FeeGetModel>>(
      environment.apiBaseUrl.concat(environment.fees),
      { params }
    );
  }

  /**
   * Copy fees to units
   * Backend endpoint: POST /fees/copyTo?overwrite=true/false
   */
  copyFeesToUnits(payload: {
    feeIds: string[];
    unitIds: string[];
  }, overwrite: boolean = false): Observable<void> {
    const url = environment.apiBaseUrl.concat(environment.feesApply);
    let params = new HttpParams();

    if (overwrite) {
      params = params.set('overwrite', 'true');
    }

    return this.httpClient.post<void>(url, payload, { params });
  }
}
