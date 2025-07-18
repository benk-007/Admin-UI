export interface AdditionalGuestFeeModel {
  id?: string;
  guestCount: number;
  guestType: 'ADULT' | 'CHILD';
  amountType: 'FLAT' | 'PERCENT';
  value: number;
  ageBucket:{
    fromAge?: number;
    toAge?: number;
  }
}
