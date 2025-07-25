import {SelectedRoomModel} from '../selected-room.model';
import {PaymentMethodEnum} from '../enums/payment-method.enum';

export interface BookingPostModel {
  party?: string;
  guestName: string;
  email?: string;
  mobile?: string;
  rooms: SelectedRoomModel[];
  paymentMethod?: PaymentMethodEnum;
  guaranteeAmount?: number;
  specialNotes?: string;
}
