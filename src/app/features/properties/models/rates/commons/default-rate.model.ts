import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';
import {DaySpecificPricingModel} from '../../../../../shared/models/day-specific-pricing.model';

export interface DefaultRateModel {
  id?: string;
  nightly: number;
  minStay: number;
  maxStay?: number;
  unit: {
    uuid: string;
  };
  additionalGuestFees: AdditionalGuestFeeModel[];
  daySpecificRates: DaySpecificPricingModel[];

}
