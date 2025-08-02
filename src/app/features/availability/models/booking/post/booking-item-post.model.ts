import {SupplementItem} from '../../supplement/commons/supplement-item.model';
import {OccupancyModel} from '../commons/occupancy.model';

export interface BookingItemPostModel {
  unit: {
    unitId: string;
    unitName: string;
  };
  checkinDate: string;
  checkoutDate: string;
  occupancy: OccupancyModel;
  quantity: number;
  nightlyRate: number;
  nights: number;
  supplements: SupplementItem[];
}
