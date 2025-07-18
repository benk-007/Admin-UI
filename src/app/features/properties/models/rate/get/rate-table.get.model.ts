import {AdditionalGuestFeeModel} from '../../../../../shared/models/additional-guest-fee.model';
import {DaySpecificPricingModel} from '../../../../../shared/models/day-specific-pricing.model';
import {AuditGetModel} from '../../../../../shared/models/audit-get.model';

export interface RateTableGetModel {
  id: string;
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

  audit: AuditGetModel;

  ratePlan: { uuid: string };
}
