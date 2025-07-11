import {Injectable} from '@angular/core';
import {UnitDetailsPatchModel} from "../models/details/unit-details-patch.model";
import {AmenityEnum} from "../models/details/amenity.enum";
import {RoomPatchModel} from "../models/rooms-bedding/room-patch.model";
import {RoomPostModel} from "../models/rooms-bedding/room-post.model";

@Injectable({
  providedIn: 'root'
})
export class UnitMapperService {

  constructor() {
  }

  formToDetailsPatchModel(value: any, amenitiesRawValues: any): UnitDetailsPatchModel {

    const selected: AmenityEnum[] = Object.entries(amenitiesRawValues)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => AmenityEnum[key as keyof typeof AmenityEnum]);

    return {
      type: value.type,
      floorSize: value.floorSize,
      floorSizeUnit: value.floorSizeUnit,
      description: value.description,
      minOccupancy: {
        adults: value.minOccupancy.adults,
        children: value.minOccupancy.children,
        infants: value.minOccupancy.infants
      },
      maxOccupancy: {
        adults: value.maxOccupancy.adults,
        children: value.maxOccupancy.children,
        infants: value.maxOccupancy.infants
      },
      travellerAge: value.travellerAge,
      childrenAllowed: value.childrenAllowed,
      eventsAllowed: value.eventsAllowed,
      smokingAllowed: value.smokingAllowed,
      petsAllowed: value.petsAllowed,
      amenities: selected
    };

    /*
        let rooms: RoomGetModel[] = [];
        if (value.rooms.length > 0) {
          value.rooms.forEach((rm: any) => {

            let beds: BedGetModel[] = [];
            rm.beds.forEach((bed: any) => {
              beds.push({
                type: bed.type,
                quantity: bed.quantity
              })
            })
            let room = {
              id: rm.id ? rm.id : null,
              type: rm.type,
              bathroom: rm.bathroom,
              floorSize: rm.floorSize,
              beds: beds
            }
            rooms.push(room);
          })
        }
        payload.rooms = rooms;*/

  }

  formToRoomPatchModel(value: any): RoomPatchModel {
    let bathroomId;
    if (value.bathroom) {
      if (value.bathroom == 'null') {
        bathroomId = '';
      } else {
        bathroomId = value.bathroom.id;
      }
    } else {
      bathroomId = '';
    }
    let payload: RoomPatchModel = {
      name: value.name,
      type: value.type,
      subType: value.subType,
      floorSize: value.floorSize,
      floorSizeUnit: value.floorSizeUnit,
      bathroomId: bathroomId,
      description: value.description,
      beds: value.beds
    }
    return payload;
  }

  formToRoomPostModel(value: any): RoomPostModel {
    let bathroomId;
    if (value.bathroom) {
      if (value.bathroom == 'null') {
        bathroomId = '';
      } else {
        bathroomId = value.bathroom.id;
      }
    } else {
      bathroomId = '';
    }
    let payload: RoomPostModel = {
      name: value.name,
      type: value.type,
      subType: value.subType,
      floorSize: value.floorSize,
      floorSizeUnit: value.floorSizeUnit,
      bathroomId: bathroomId,
      description: value.description,
      beds: value.beds
    }
    return payload;
  }
}
