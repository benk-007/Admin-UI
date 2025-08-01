import {FeeTypeEnum} from '../enum/fee-type.enum';
import {FeeModalityEnum} from '../enum/fee-modality.enum';
import {UnitRefModel} from '../commons/unit-ref.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';


export interface FeeGetModel {
  id: string;
  name: string;
  amount: number;
  type: FeeTypeEnum;
  modality: FeeModalityEnum;
  description?: string;
  active: boolean;
  unit: UnitRefModel;
  audit: AuditGetModel;
}
