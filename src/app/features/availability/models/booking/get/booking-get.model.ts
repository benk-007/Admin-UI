import {BookingItemGetModel} from './booking-item-get.model';
import {ContactModel} from '../../../../../shared/models/contact.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';
import {PartyItemGetModel} from '../../../../crm/models/party/party-item-get.model';

export interface BookingGetModel {
  id: string;
  checkinDate: string;
  checkoutDate: string;
  party: PartyItemGetModel | null;
  segmentId: string;
  subSegmentId: string;
  status: string;
  type: string;
  guestName: string;
  paymentMethod: string;
  guaranteeAmount: number;
  specialNotes: string;
  parentBookingId: string;
  items: BookingItemGetModel[];
  audit: AuditGetModel;
}

