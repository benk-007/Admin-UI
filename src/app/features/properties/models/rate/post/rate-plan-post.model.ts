export interface RatePlanPostModel {
  name: string;
  enabled: boolean;
  segment?: {
    id: string;
    name: string;
  } | null;
  subSegment?: {
    id: string;
    name: string;
  } | null;
  unit: {
    uuid: string;
  };
}
