export interface RatePlanGetModel {
  id: string;
  name: string;
  segment?: {
    id: string;
    name: string;
  };
  subSegment?: {
    id: string;
    name: string;
  };
  enabled: boolean;
  unit: {
    uuid: string;
  };
}
