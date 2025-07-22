import {SegmentRefGetModel} from '../commons/segment-ref-get.model';
import {UnitRefGetModel} from '../commons/unit-ref-get.model';

export interface RatePlanPostModel {
  name: string;
  enabled: boolean;
  segments: SegmentRefGetModel[];
  unit: UnitRefGetModel;
}
