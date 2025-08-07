import {Injectable} from '@angular/core';

import {HttpClient, HttpParams} from "@angular/common/http";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {PartyItemGetModel} from '../models/get/party-item-get.model';
import {PartyItemPatchModel} from '../models/patch/party-patch.model';



@Injectable({
  providedIn: 'root'
})
export class PartyService {

  constructor(private readonly httpClient: HttpClient) {}

  getPartiesByPage(page: number, size: number, sort: string, sortDirection: string, search: string, type: string): Observable<PageModel<PartyItemGetModel>> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', `${sort},${sortDirection}`);

    if (search) {
      params = params.set('search', search);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.httpClient.get<PageModel<PartyItemGetModel>>(environment.apiBaseUrl.concat(environment.partyList), { params });
  }

  getPartyById(partyId: string): Observable<PartyItemGetModel> {
    return this.httpClient.get<PartyItemGetModel>(
      environment.apiBaseUrl.concat(environment.partyById).replace(':partyId', partyId)
    );
  }

  postParty(formData: FormData) {
    return this.httpClient.post(environment.apiBaseUrl.concat(environment.partyList), formData);
  }

  patchPartyById(payload: PartyItemPatchModel, partyId: string): Observable<PartyItemGetModel> {
    return this.httpClient.patch<PartyItemGetModel>(
      environment.apiBaseUrl.concat(environment.partyById).replace(':partyId', partyId),
      payload
    );
  }

  deletePartyById(id: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.partyById).replace(':partyId', id)
    );
  }
}
