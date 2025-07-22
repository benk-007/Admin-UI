import {AuditGetModel} from '../../../../../shared/models/audit-get.model';
import {SegmentRefGetModel} from '../commons/segment-ref-get.model';
import {UnitRefGetModel} from '../commons/unit-ref-get.model';

export interface RatePlanGetModel {
  id: string;
  name: string;
  segments?: SegmentRefGetModel[];
  enabled: boolean;
  unit: UnitRefGetModel;
  audit: AuditGetModel;
}
