import {ContactModel} from '../../../../shared/models/contact.model';
import {AddressModel} from '../../../../shared/models/address.model';


export interface PartyItemPatchModel {
  firstName?: string;
  lastName?: string;

  name?: string;
  segmentId?: string;

  birthDate?: string;
  address?: AddressModel;
  contact?: ContactModel;
}
