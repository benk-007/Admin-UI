import {UnitTypeEnum} from '../../../../properties/models/unit/enums/unit-type.enum';
import {AddressModel} from '../../../../../shared/models/address.model';
import {ContactModel} from '../../../../../shared/models/contact.model';

export interface PropertyPostModel {
  name: string;
  type: UnitTypeEnum;
  address?: AddressModel;
  contact?: ContactModel;
  timezone?: string;
  currency?: string;
  defaultUnitType?: UnitTypeEnum;
}
