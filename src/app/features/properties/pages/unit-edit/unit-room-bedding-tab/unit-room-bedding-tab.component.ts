import { Component } from '@angular/core';
import {ButtonDirective, ColComponent, RowComponent} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {TranslatePipe} from '@ngx-translate/core';
import {NgForOf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RoomComponent} from './room/room.component';
import {cilPlus, cilTrash, cilX} from '@coreui/icons';
import {ActivatedRoute} from '@angular/router';
import {UnitApiService} from '../../../services/unit-api.service';
import {combineLatest, Subscription} from 'rxjs';
import {RoomGetModel} from '../../../models/room-bedding/get/room-get.model';

@Component({
  selector: 'app-rooms-bedding',
  imports: [
    ColComponent,
    RowComponent,
    ButtonDirective,
    TranslatePipe,
    NgForOf,
    ReactiveFormsModule,
    IconDirective,
    RoomComponent,
  ],
  templateUrl: './unit-room-bedding-tab.component.html',
  standalone: true,
  styleUrl: './unit-room-bedding-tab.component.scss'
})
export class UnitRoomBeddingTabComponent {

  icons = {cilTrash, cilX, cilPlus}
  unitId!: string;
  rooms: RoomGetModel[] = [];
  bathrooms: RoomGetModel[] = [];
  subscriptions: Subscription[] = []

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly unitApiService: UnitApiService) {
    this.setUnitIdFromRoute();
  }

  addRoom() {
    this.rooms.push({})
  }

  handleRoomDeletion(event: { index: number, room: RoomGetModel }) {
    this.rooms.splice(event.index, 1);
  }

  handleRoomCu(event: { index: number, room: RoomGetModel }) {
    this.rooms[event.index] = event.room;
    this.setBathrooms();
  }

  private setUnitIdFromRoute() {
    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const unitId = paramMaps
          .map(paramMap => paramMap.get('unitId'))
          .find(id => id !== null);
        if (unitId) {
          this.unitId = unitId;
          this.retrieveUnitRooms();
        }
      })
    );
  }

  private retrieveUnitRooms() {
    this.subscriptions.push(this.unitApiService.getUnitRooms(this.unitId).subscribe({
      next: (res) => {
        console.log('Unit rooms call response is:', res);
        if (res.content.length != 0) {
          this.rooms = res.content;
          this.setBathrooms();
        } else {
          this.addRoom();
        }
      },
      error: (err: any) => {
        console.error('An error occurred when retrieving rooms for unit with Id:', this.unitId, 'Error details:', err);
      }
    }))
  }

  setBathrooms() {
    const assignedBathroomIds = this.rooms.map(room => room.bathroom?.id).filter(id => !!id);
    this.bathrooms = this.rooms.filter(room => room.type === 'BATHROOM' && !assignedBathroomIds.includes(room.id));
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
