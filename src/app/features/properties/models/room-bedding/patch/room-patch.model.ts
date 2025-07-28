import {RoomTypeEnum} from '../enums/room-type.enum';
import {RoomSubTypeEnum} from '../enums/room-sub-type.enum';
import {FloorSizeUnitEnum} from '../enums/floor-size-unit.enum';
import {BedGetModel} from '../get/bed-get.model';

export interface RoomPatchModel {
  id?: string;
  name?: string;
  type?: RoomTypeEnum;
  subType?: RoomSubTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  bathroomId?: string;
  description: string;
  beds?: BedGetModel[] | null;
}
