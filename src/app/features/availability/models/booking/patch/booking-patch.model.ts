import {SupplementItem} from '../../supplement/commons/supplement-item.model';

export interface BookingPatchModel {
  status?: string;

  guestName?: string;
  paymentMethod?: string;
  guaranteeAmount?: number;
  specialNotes?: string;

  nightlyRate?: number;
  supplements?: SupplementItem[];

  email?: string;
  mobile?: string;
}
