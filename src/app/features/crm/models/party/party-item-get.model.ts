import {ContactModel} from '../../../../shared/models/contact.model';
import {SegmentItemGetModel} from '../../../settings/models/segment/segment-item-get.model';
import {AuditGetModel} from '../../../../shared/models/audit-get.model';

export interface PartyItemGetModel {
  id: string;
  name: string;
  contact: ContactModel;
  withIdentityDocument: boolean;
  segment: SegmentItemGetModel;
  audit: AuditGetModel;
}
