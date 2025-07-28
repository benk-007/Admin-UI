import {BedGetModel} from "./bed-get.model";
import {RoomSubTypeEnum} from '../enums/room-sub-type.enum';
import {FloorSizeUnitEnum} from '../enums/floor-size-unit.enum';
import {RoomTypeEnum} from '../enums/room-type.enum';

export interface RoomGetModel {
  id?: string;
  name?: string;
  type?: RoomTypeEnum;
  subType?: RoomSubTypeEnum;
  floorSize?: number;
  floorSizeUnit?: FloorSizeUnitEnum;
  bathroom?: RoomGetModel;
  beds?: BedGetModel[];
}
