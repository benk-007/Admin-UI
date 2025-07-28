import {UnitTypeEnum} from '../../unit/enums/unit-type.enum';
import {FloorSizeUnitEnum} from '../enums/floor-size-unit.enum';
import {OccupancyModel} from '../commons/occupancy.model';
import {AmenityEnum} from '../enums/amenity.enum';
import {ParentUnitGetModel} from '../../unit/get/parent-unit-get.model';
import {UnitNatureEnum} from '../../unit/enums/unit-nature.enum';

export interface UnitDetailsGetModel {
  id: string;
  name: string;
  type: UnitTypeEnum;
  floorSize: number;
  floorSizeUnit: FloorSizeUnitEnum;
  description: string;
  minOccupancy: OccupancyModel;
  maxOccupancy: OccupancyModel;
  travellerAge: number;
  childrenAllowed: boolean;
  eventsAllowed: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  amenities: AmenityEnum[];
  parent: ParentUnitGetModel;
  nature: UnitNatureEnum;
}
