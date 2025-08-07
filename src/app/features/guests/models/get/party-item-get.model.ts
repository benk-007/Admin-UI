import {PartyTypeEnum} from '../enums/party-type.enum';
import {SegmentItemGetModel} from '../../../settings/models/segment/segment-item-get.model';
import {ContactModel} from '../../../../shared/models/contact.model';
import {AddressModel} from '../../../../shared/models/address.model';
import {AuditGetModel} from '../../../../shared/models/audit-get.model';


export interface PartyItemGetModel {
  id: string;
  audit: AuditGetModel;
  name?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  address?: AddressModel;
  contact?: ContactModel;
  withIdentityDocument: boolean;
  type: PartyTypeEnum;
  segment?: SegmentItemGetModel;
}

