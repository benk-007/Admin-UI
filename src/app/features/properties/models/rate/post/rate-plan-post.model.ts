export interface RatePlanPostModel {
  name: string;
  enabled: boolean;
  segment?: {
    uuid: string;
    name: string;
  } | null;
  subSegment?: {
    uuid: string;
    name: string;
  } | null;
  unit: {
    uuid: string;
  };
}
