export interface AvailabilityPostModel {
  party: string;
  checkinDate: string;
  checkoutDate: string;
  guests: {
    adults: number;
    children: {
      age: number;
      quantity: number;
    }[];
  };
  segmentId: string;
  subSegmentId: string;
}
