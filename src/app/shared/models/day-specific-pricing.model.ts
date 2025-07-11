export interface DaySpecificPricingModel {
  daysOfWeek: string[];
  nightly: number;
  ppPn?: number;
  guestCount?: number;
}
