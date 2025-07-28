import {RoomSubTypeEnum} from '../enums/room-sub-type.enum';
import {FloorSizeUnitEnum} from '../enums/floor-size-unit.enum';
import {RoomTypeEnum} from '../enums/room-type.enum';
import {BedGetModel} from '../get/bed-get.model';

export interface RoomPostModel {
  name?: string;
  type?: RoomTypeEnum;
  subType?: RoomSubTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  bathroomId?: string;
  description?: string;
  beds?: BedGetModel[];
}
