import {AddressModel} from '../../../../../shared/models/address.model';
import {ContactModel} from '../../../../../shared/models/contact.model';
import {UnitTypeEnum} from '../../../../properties/models/unit/enums/unit-type.enum';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';

export interface PropertyGetModel {
  id: string;
  name: string;
  logoId?: string;
  address: AddressModel;
  contact: ContactModel;
  type: UnitTypeEnum;
  timezone: string;
  currency: string;
  defaultUnitType: UnitTypeEnum;
  audit: AuditGetModel;
}
