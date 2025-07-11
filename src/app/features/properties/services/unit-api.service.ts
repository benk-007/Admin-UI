import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
// import {UnitPostModel} from "../models/unit-post.model";
// import {UnitItemGetModel} from "../models/unit-item-get.model";
import {PageModel} from "../../../shared/models/pageable/page.model";
// import {UnitGetModel} from "../models/unit-get.model";
import {environment} from "../../../../environments/environment";
/*import {UnitInfosGetModel} from "../models/unit-infos-get.model";
import {UnitInfosPatchModel} from "../models/unit-infos-patch.model";
import {UnitInstructionsGetModel} from "../models/unit-instructions-get.model";
import {UnitInstructionsPatchModel} from "../models/unit-instructions-patch.model";
import {UnitDetailsGetModel} from "../models/details/unit-details-get.model";
import {UnitDetailsPatchModel} from "../models/details/unit-details-patch.model";
import {RoomGetModel} from "../models/rooms-bedding/room-get.model";
import {RoomPostModel} from "../models/rooms-bedding/room-post.model";
import {RoomPatchModel} from "../models/rooms-bedding/room-patch.model";*/
import {PageFilterModel} from 'src/app/shared/models/page-filter.model';
import {UnitItemGetModel} from '../models/unit/unit-item-get.model';
// import {MultiUnitPostModel} from "../models/multi-unit-post.model";


@Injectable({
  providedIn: 'root'
})
export class UnitApiService {

  constructor(private httpClient: HttpClient) {
  }

/*
  postUnit(payload: UnitPostModel) {
    return this.httpClient.post<UnitItemGetModel>(environment.apiBaseUrl.concat(environment.unitList), payload);
  }
*/
/*
  updateUnitInfosById(unitId: string, payload: UnitInfosPatchModel) {
    return this.httpClient.patch<UnitInfosGetModel>(environment.apiBaseUrl.concat(environment.unitInfosById).replace(':unitId', unitId), payload);
  }*/

  getUnitsByPage(pageFilter: PageFilterModel) {
    let params = new HttpParams();
    params = params.set('page', pageFilter.page);
    params = params.set('size', pageFilter.size);

    if (pageFilter.search || pageFilter.advancedSearchFormValue?.search) {
      let searchValue = pageFilter.search ? pageFilter.search : pageFilter.advancedSearchFormValue.advancedSearch;
      params = params.set('search', searchValue);
    }

    // Ajout du filtrage par nature si spécifié
    if (pageFilter.advancedSearchFormValue?.nature) {
      params = params.set('nature', pageFilter.advancedSearchFormValue.nature);
    }

    // Ajout du filtrage pour exclure les sous-unités si nécessaire
    if (pageFilter.advancedSearchFormValue?.withParent !== undefined && pageFilter.advancedSearchFormValue?.withParent !== null) {
      params = params.set('withParent', pageFilter.advancedSearchFormValue.withParent);
    }

    return this.httpClient.get<PageModel<UnitItemGetModel>>(environment.apiBaseUrl.concat(environment.unitList), {params});
  }
/*
  getUnitById(unitId: string) {
    return this.httpClient.get<UnitGetModel>(environment.apiBaseUrl.concat(environment.unitById).replace(':unitId', unitId));
  }

  getUnitInfosById(unitId: string) {
    return this.httpClient.get<UnitInfosGetModel>(environment.apiBaseUrl.concat(environment.unitInfosById).replace(':unitId', unitId));
  }

  getUnitDetailsById(unitId: string) {
    return this.httpClient.get<UnitDetailsGetModel>(environment.apiBaseUrl.concat(environment.unitDetailsById).replace(':unitId', unitId))
  }

  updateUnitDetailsById(unitId: string, payload: UnitDetailsPatchModel) {
    return this.httpClient.patch<UnitDetailsGetModel>(environment.apiBaseUrl.concat(environment.unitDetailsById).replace(':unitId', unitId), payload);
  }

  getUnitInstructionsById(unitId: string) {
    return this.httpClient.get<UnitInstructionsGetModel>(
      environment.apiBaseUrl.concat(environment.unitInstructionsById).replace(':unitId', unitId)
    );
  }

  updateUnitInstructionsById(unitId: string, payload: UnitInstructionsPatchModel) {
    return this.httpClient.patch<UnitInstructionsGetModel>(
      environment.apiBaseUrl.concat(environment.unitInstructionsById).replace(':unitId', unitId),
      payload
    );
  }


  getUnitRooms(unitId: string) {
    return this.httpClient.get<PageModel<RoomGetModel>>(environment.apiBaseUrl.concat(environment.unitRoomsById).replace(':unitId', unitId));
  }

  createRoom(payload: RoomPostModel, unitId: string) {
    return this.httpClient.post<RoomGetModel>(environment.apiBaseUrl.concat(environment.unitRoomsById).replace(':unitId', unitId), payload);
  }

  updateRoom(payload: RoomPatchModel, unitId: string, roomId: string) {
    return this.httpClient.patch<RoomGetModel>(environment.apiBaseUrl.concat(environment.unitRoomById).replace(':unitId', unitId).replace(':roomId', roomId), payload);
  }

  deleteRoom(unitId: string, roomId: string) {
    return this.httpClient.delete<void>(environment.apiBaseUrl.concat(environment.unitRoomById).replace(':unitId', unitId).replace(':roomId', roomId));
  }

  postMultiUnit(payload: MultiUnitPostModel) {
    return this.httpClient.post<UnitItemGetModel>(environment.apiBaseUrl.concat(environment.unitList), payload);
  }*/

  getSubUnits(multiUnitId: string, pageFilter?: PageFilterModel ) {
    let params = new HttpParams();

    if (pageFilter) {
      params = params.set('page', pageFilter.page);
      params = params.set('size', pageFilter.size);

      if (pageFilter.search || pageFilter.advancedSearchFormValue?.search) {
        let searchValue = pageFilter.search ?? pageFilter.advancedSearchFormValue?.advancedSearch;
        params = params.set('search', searchValue);
      }

      if (pageFilter.sort) {
        params = params.set('sort', `${pageFilter.sort},${pageFilter.sortDirection}`);
      }


      if (pageFilter.advancedSearchFormValue?.nature) {
        params = params.set('nature', pageFilter.advancedSearchFormValue.nature);
      }
    }
    // GET /units/{unitId}/sub-units
    return this.httpClient.get<PageModel<UnitItemGetModel>>(
      environment.apiBaseUrl.concat(environment.unitSubUnits).replace(':unitId', multiUnitId),
      { params }
    );
  }


  postSubUnit(multiUnitId: string, payload: any) {
    return this.httpClient.post<any>(
      environment.apiBaseUrl.concat(environment.unitSubUnits).replace(':unitId', multiUnitId),
      payload
    );
  }

  assignExistingUnits(multiUnitId: string, payload: any) {
    return this.httpClient.post<UnitItemGetModel[]>(
      environment.apiBaseUrl.concat(environment.unitSubUnits).replace(':unitId', multiUnitId) + '/assign',
      payload
    );
  }



  detachSubUnit(subUnitId: string) {
    // PATCH /units/{subUnitId}/detach
    return this.httpClient.patch<void>(
      environment.apiBaseUrl.concat(environment.unitDetach).replace(':unitId', subUnitId),
      {}
    );
  }
}
