import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyPostModel } from '../models/property/post/property-post.model';
import {PropertyGetModel} from '../models/property/get/property-get.model';
import {environment} from '../../../../environments/environment';
import {PropertyPatchModel} from '../models/property/patch/property-patch.model';



@Injectable({
  providedIn: 'root'
})
export class PropertyApiService {

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get current property
   */
  getCurrentProperty(): Observable<PropertyGetModel> {
    return this.httpClient.get<PropertyGetModel>(
      environment.apiBaseUrl.concat(environment.properties)
    );
  }

  /**
   * Create new property with logo
   */
  createProperty(payload: PropertyPostModel, logoFile?: File): Observable<PropertyGetModel> {
    const formData = new FormData();

    const propertyJsonBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
    // Add payload as JSON string
    formData.append('payload', propertyJsonBlob);

    // Add logo file if provided
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.httpClient.post<PropertyGetModel>(
      environment.apiBaseUrl.concat(environment.properties),
      formData
    );
  }

  /**
   * Update existing property with optional logo
   */
  updateProperty(propertyId: string, payload: PropertyPatchModel, logoFile?: File): Observable<PropertyGetModel> {
    const formData = new FormData();

    const propertyJsonBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
    // Add payload as JSON string
    formData.append('payload', propertyJsonBlob);

    // Add logo file if provided
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.httpClient.patch<PropertyGetModel>(
      environment.apiBaseUrl.concat(environment.propertyById).replace(':propertyId', propertyId),
      formData
    );
  }

  /**
   * Get media/logo by ID
   */
  getMediaById(mediaId: string): Observable<Blob> {
    const url = environment.apiBaseUrl.concat(environment.mediaById).replace(':mediaId', mediaId);
    return this.httpClient.get(url, {
      responseType: 'blob'
    });
  }
}
