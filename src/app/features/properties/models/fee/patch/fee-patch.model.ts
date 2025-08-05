import {FeeTypeEnum} from '../enum/fee-type.enum';
import {FeeModalityEnum} from '../enum/fee-modality.enum';
import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';

export interface FeePatchModel {
  name?: string;
  amount?: number;
  type?: FeeTypeEnum;
  modality?: FeeModalityEnum;
  description?: string;
  active?: boolean;
  unitIds?: string[];
  additionalGuestPrices?: AdditionalGuestFeeModel[];
}
