import {AddressModel} from '../../../../../shared/models/address.model';

export interface UnitPostModel {
  name: string;
  subtitle?: string;
  address: AddressModel;
  contact: {
    mobile?: string;
    email?: string;
  };
}
