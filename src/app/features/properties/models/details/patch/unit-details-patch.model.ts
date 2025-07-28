import {FloorSizeUnitEnum} from '../../room-bedding/enums/floor-size-unit.enum';
import {OccupancyModel} from "../commons/occupancy.model";
import {AmenityEnum} from "../enums/amenity.enum";
import {UnitTypeEnum} from '../../unit/enums/unit-type.enum';

export interface UnitDetailsPatchModel {
  type?: UnitTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  description?: string;
  minOccupancy?: OccupancyModel;
  maxOccupancy?: OccupancyModel;
  travellerAge?: number;
  childrenAllowed?: boolean;
  eventsAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  amenities?: AmenityEnum[];
}
