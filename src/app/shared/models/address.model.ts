import {LocationModel} from "./location.model";

export interface AddressModel {
  street1?: string;
  street2?: string;
  postCode?: string;
  city?: string;
  country?: string;
  location?: LocationModel;
}
