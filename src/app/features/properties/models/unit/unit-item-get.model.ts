import {AddressModel} from '../../../../shared/models/address.model';
import {ContactModel} from '../../../../shared/models/contact.model';
import {UnitNatureEnum} from './commons/unit-nature.enum';
import {AuditGetModel} from '../../../../shared/models/audit-get.model';
import {ParentUnitGetModel} from './parent-unit-get.model';


export interface UnitItemGetModel {
  id: string;
  name: string;
  subtitle: string;
  beds: number;
  bathrooms: number;
  audit: AuditGetModel;
  readiness: boolean;
  nature: UnitNatureEnum;
  contact: ContactModel,
  address: AddressModel;
  parent: ParentUnitGetModel;
  priority: number;
  subUnits: UnitItemGetModel[];
}

