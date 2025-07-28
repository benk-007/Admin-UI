import {BedTypeEnum} from '../enums/bed-type.enum';


export interface BedGetModel{
  type: BedTypeEnum;
  quantity: number;
}
