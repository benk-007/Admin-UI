import {AuditGetModel} from '../../../../shared/models/audit-get.model';

export interface SegmentItemGetModel {
  id: string;
  name: string;
  description: string;
  parent: SegmentItemGetModel;
  enabled: boolean;
  audit: AuditGetModel;
}
