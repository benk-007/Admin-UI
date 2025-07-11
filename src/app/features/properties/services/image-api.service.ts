import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ImageGetModel} from "../models/image-get.model";
import {PageModel} from "../../../shared/models/pageable/page.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageApiService {

  constructor(private httpClient: HttpClient) {
  }

  getImagesByUnitId(unitId: string) {
    let params = new HttpParams();
    params = params.set('unitId', unitId);
    return this.httpClient.get<PageModel<ImageGetModel>>(environment.apiBaseUrl.concat(environment.unitImages), {params});
  }

  getImageById(imageId: string): Observable<Blob> {
    return this.httpClient.get(environment.apiBaseUrl.concat(environment.unitImageById).replace(':imageId', imageId), {
      responseType: "blob"
    });
  }

  postImage(formData: FormData) {
    return this.httpClient.post<ImageGetModel>(environment.apiBaseUrl.concat(environment.unitImages), formData);
  }

  deleteById(imageId: string) {
    return this.httpClient.delete(environment.apiBaseUrl.concat(environment.unitImageById).replace(':imageId', imageId));
  }

  patchById(imageId: string) {
    return this.httpClient.patch<ImageGetModel>(environment.apiBaseUrl.concat(environment.unitImageById).replace(':imageId', imageId), {cover: true});
  }
}
