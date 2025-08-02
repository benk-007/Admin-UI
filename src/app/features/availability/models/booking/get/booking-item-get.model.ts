import {SupplementItem} from '../../supplement/commons/supplement-item.model';
import {OccupancyModel} from '../commons/occupancy.model';

export interface BookingItemGetModel {
  id: string;
  checkinDate: string;
  checkoutDate: string;
  unit: {
    unitId: string;
    unitName: string;
  };
  quantity: number;
  occupancy: OccupancyModel;
  nightlyRate: number;
  nights: number;
  total: number;
  supplements: SupplementItem[];
}
