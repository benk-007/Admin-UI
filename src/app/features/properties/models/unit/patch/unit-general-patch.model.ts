import {AddressModel} from '../../../../../shared/models/address.model';
import {ContactModel} from '../../../../../shared/models/contact.model';

export interface UnitGeneralPatchModel {
  name?: string;
  subtitle?: string;
  address?: AddressModel;
  contact?: ContactModel,
  calendarColor?: string;
  readiness?: boolean;
  priority?: number;
}
