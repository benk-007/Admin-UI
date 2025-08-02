export interface AvailabilityGetModel {
  id: string;
  name: string;
  inventory: {
    availableCount: number;
    totalCount: number;
  };
  price: {
    nightRates: {
      date: string;
      rate: number;
    }[];
    nightlyRate: number;
    totalAmount: number;
    minStay: number;
    maxStay: number;
  };
  bedding: {
    type: string;
    quantity: number;
  }[];
  occupancy: number;
}
