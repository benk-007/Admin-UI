import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {PageModel} from "../../../shared/models/pageable/page.model";
import {IdentityDocumentItemGetModel} from '../models/get/identity-document-item-get.model';


@Injectable({
  providedIn: 'root'
})
export class IdentityDocumentService {
  constructor(private readonly httpClient: HttpClient) {
  }

  getIdentityDocuments(guestId: string, page: number, size: number): Observable<PageModel<IdentityDocumentItemGetModel>> {
    const params = new HttpParams()
      .set('guestId', guestId)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.httpClient.get<PageModel<IdentityDocumentItemGetModel>>(
      environment.apiBaseUrl.concat(environment.identityDocuments), {params}
    );
  }

  getIdentityDocumentImageById(mediaId: string): Observable<Blob> {
    const url = environment.apiBaseUrl.concat(environment.mediaById).replace(':mediaId', mediaId);
    return this.httpClient.get(url, {
      responseType: 'blob',
      params: { file: true }
    });
  }

  createDocument(payload: FormData): Observable<IdentityDocumentItemGetModel> {
    return this.httpClient.post<IdentityDocumentItemGetModel>(
      environment.apiBaseUrl.concat(environment.identityDocuments), payload);
  }

  updateDocument(identityDocumentId: string, formData: FormData) {
    return this.httpClient.patch<IdentityDocumentItemGetModel>(environment.apiBaseUrl.concat(environment.identityDocumentById.replace(':identityDocumentId', identityDocumentId)), formData)
  }

  deleteDocumentById(identityDocumentId: string): Observable<void> {
    return this.httpClient.delete<void>(environment.apiBaseUrl.concat(environment.identityDocumentById.replace(':identityDocumentId', identityDocumentId)));
  }

}
