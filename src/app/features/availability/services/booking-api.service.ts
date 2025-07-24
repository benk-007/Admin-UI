import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {AvailabilityPostResource} from '../models/availability/post/availability-post.model';
import {AvailabilityGetResource} from '../models/availability/get/availability-get.model';

@Injectable({
  providedIn: 'root'
})

export class AvailabilityApiService {

  constructor(private httpClient: HttpClient) {
  }

  getAvailableUnits(payload: AvailabilityPostResource): Observable<AvailabilityGetResource[]> {
    return this.httpClient.post<AvailabilityGetResource[]>(
      environment.apiBaseUrl.concat(environment.availability),
      payload
    );
  }
}
