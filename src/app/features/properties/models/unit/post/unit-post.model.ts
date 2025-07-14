import {AddressModel} from '../../../../../shared/models/address.model';
import {ContactModel} from '../../../../../shared/models/contact.model';
import {SubUnitModel} from '../commons/sub-unit.model';
import {UnitNatureEnum} from '../enums/unit-nature.enum';

export interface UnitPostModel {
  name: string;
  nature?: UnitNatureEnum;
  subtitle?: string;
  address: AddressModel;
  contact: ContactModel;
  subUnits?: SubUnitModel[];
  quantity?: number;
  subUnitPrefix?: string;
}
