import {ContactModel} from '../../../../../shared/models/contact.model';
import {AddressModel} from '../../../../../shared/models/address.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';
import {ParentUnitGetModel} from './parent-unit-get.model';
import {UnitNatureEnum} from '../enums/unit-nature.enum';

export interface UnitGetModel {
  id: string;
  name: string;
  subtitle: string;
  audit: AuditGetModel;
  readiness: boolean;
  contact: ContactModel
  address: AddressModel;
  parent: ParentUnitGetModel;
  nature: UnitNatureEnum;
}
