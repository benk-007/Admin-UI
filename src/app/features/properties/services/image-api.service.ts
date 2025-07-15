import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PageModel } from '../../../shared/models/pageable/page.model';
import { Observable } from 'rxjs';
import {ImageGetModel} from '../models/unit/get/image-get.model';

@Injectable({
  providedIn: 'root'
})
export class ImageApiService {

  constructor(private httpClient: HttpClient) {}

  // Récupérer les images d'une unité
  getImagesByUnitId(unitId: string) {
    let params = new HttpParams();
    params = params.set('unitId', unitId);
    return this.httpClient.get<PageModel<ImageGetModel>>(
      environment.apiBaseUrl.concat(environment.unitImages),
      { params }
    );
  }

  // récupère l'image via le service Media avec le bon paramètre
  getImageById(imageId: string): Observable<Blob> {
    return this.httpClient.get(
      `${environment.apiBaseUrl}mediaMgtApi/medias/${imageId}?file=true`,
      { responseType: "blob" }
    );
  }

  /**
   * Get image binary data from Media Service using UUID
   */
  getImageByUuid(mediaUuid: string): Observable<Blob> {
    const url = `${environment.apiBaseUrl}mediaMgtApi/medias/${mediaUuid}?file=true`;
    console.log('Requesting image from URL:', url); // Debug log

    return this.httpClient.get(url, { responseType: "blob" });
  }

  // Uploader des images
  postImages(unitId: string, files: File[]): Observable<ImageGetModel[]> {
    const formData = new FormData();
    formData.append('unitId', unitId);

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.httpClient.post<ImageGetModel[]>(
      environment.apiBaseUrl.concat(environment.unitImages),
      formData
    );
  }

  // Supprimer une image
  deleteById(imageId: string) {
    return this.httpClient.delete(
      environment.apiBaseUrl.concat(environment.unitImageById).replace(':imageId', imageId)
    );
  }

  // Définir une image comme cover
  setAsCover(imageId: string) {
    return this.httpClient.patch<ImageGetModel>(
      environment.apiBaseUrl.concat(environment.unitImageById).replace(':imageId', imageId),
      { cover: true }
    );
  }
}
