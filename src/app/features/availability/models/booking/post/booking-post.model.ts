import {BookingItemPostModel} from './booking-item-post.model';
import {ContactModel} from '../../../../../shared/models/contact.model';


export interface BookingPostModel {
  party: {
    id: string;
    name: string;
    contact: ContactModel;
  } | null;
  segmentId: string | null;
  subSegmentId: string | null;
  status: string;
  guestName?: string;
  paymentMethod?: string;
  guaranteeAmount?: number;
  specialNotes?: string;
  items: BookingItemPostModel[];
}

