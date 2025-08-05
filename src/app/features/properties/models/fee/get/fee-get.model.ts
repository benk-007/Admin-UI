import {FeeModalityEnum} from '../enum/fee-modality.enum';
import {UnitRefModel} from '../commons/unit-ref.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';
import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';


export interface FeeGetModel {
  id: string;
  name: string;
  amount: number;
  modality: FeeModalityEnum;
  description?: string;
  active: boolean;
  required: boolean;
  unit: UnitRefModel;
  audit: AuditGetModel;
  additionalGuestPrices?: AdditionalGuestFeeModel[];
}
