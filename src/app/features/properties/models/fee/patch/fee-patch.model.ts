import {FeeModalityEnum} from '../enum/fee-modality.enum';
import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';

export interface FeePatchModel {
  name?: string;
  amount?: number;
  modality?: FeeModalityEnum;
  description?: string;
  active?: boolean;
  required: boolean;
  unitIds?: string[];
  additionalGuestPrices?: AdditionalGuestFeeModel[];
}
