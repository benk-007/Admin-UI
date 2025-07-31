import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {AvailabilityPostModel} from '../models/availability/post/availability-post.model';
import {AvailabilityGetModel} from '../models/availability/get/availability-get.model';
import {BookingPostModel} from '../models/booking/post/booking-post.model';
import {BookingItemGetModel} from '../models/booking/get/booking-item-get.model';
import {BookingGetModel} from '../models/booking/get/booking-get.model';
import {BookingItemPostModel} from '../models/booking/post/booking-item-post.model';
import {BookingPatchModel} from '../models/booking/patch/booking-patch.model';

@Injectable({
  providedIn: 'root'
})

export class BookingApiService {

  constructor(private httpClient: HttpClient) {
  }

  getAvailableUnits(payload: AvailabilityPostModel): Observable<{ content: AvailabilityGetModel[] }> {
    return this.httpClient.post<{ content: AvailabilityGetModel[] }>(
      environment.apiBaseUrl.concat(environment.inventory),
      payload
    );
  }

  createGroupBooking(payload: BookingPostModel): Observable<BookingGetModel> {
    return this.httpClient.post<BookingGetModel>(
      environment.apiBaseUrl.concat(environment.booking),
      payload
    );
  }

  updateBookingItems(parentId: string, item: BookingItemPostModel): Observable<BookingItemGetModel> {
    return this.httpClient.post<BookingItemGetModel>(
      environment.apiBaseUrl.concat(environment.bookingItems).replace(':parentId', parentId),
      item
    );
  }

  getBookingById(id: string): Observable<BookingGetModel> {
    return this.httpClient.get<BookingGetModel>(
      environment.apiBaseUrl.concat(environment.bookingByid).replace(':bookingId', id)
    );
  }

  deleteBookingItem(bookingId: string): Observable<void> {
    return this.httpClient.delete<void>(
      environment.apiBaseUrl.concat(environment.bookingByid).replace(':bookingId', bookingId)
    );
  }

  patchBooking(bookingId: string, payload: BookingPatchModel): Observable<BookingGetModel> {
    return this.httpClient.patch<BookingGetModel>(
      environment.apiBaseUrl.concat(environment.bookingByid).replace(':bookingId', bookingId),
      payload
    );
  }

}
