import {FeeModalityEnum} from '../enum/fee-modality.enum';
import {UnitRefModel} from '../commons/unit-ref.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';
import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';
import {PropertyRefModel} from '../commons/property-ref.model';


export interface FeeGetModel {
  id: string;
  name: string;
  amount: number;
  modality: FeeModalityEnum;
  description?: string;
  active: boolean;
  required: boolean;
  unit?: UnitRefModel;
  property?: PropertyRefModel;
  audit: AuditGetModel;
  additionalGuestPrices?: AdditionalGuestFeeModel[];
}
