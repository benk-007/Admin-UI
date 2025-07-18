import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';
import {DaySpecificPricingModel} from '../../../../../shared/models/day-specific-pricing.model';

export interface RateTablePostModel {
  name: string;
  startDate: string;
  endDate: string;

  type: 'STANDARD' | 'DYNAMIC';

  nightly?: number;
  lowRate?: number;

  lowestOccupancy?: number;
  maxRate?: number;
  maxOccupancy?: number;

  minStay: number;
  maxStay?: number;

  daySpecificRates: DaySpecificPricingModel[];
  additionalGuestFees: AdditionalGuestFeeModel[];

  ratePlan: { uuid: string };
}
