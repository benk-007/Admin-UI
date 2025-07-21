import {AuditGetModel} from '../../../../../shared/models/audit-get.model';

export interface RatePlanGetModel {
  id: string;
  name: string;
  segment?: {
    uuid: string;
    name: string;
  };
  enabled: boolean;
  unit: {
    uuid: string;
  };
  audit: AuditGetModel;
}
