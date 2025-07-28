import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardTitleDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IconDirective} from "@coreui/icons-angular";
import {JsonPipe, NgClass, NgForOf} from "@angular/common";
import {cilPlus, cilSave, cilTrash, cilX} from "@coreui/icons";
import {EmptyDataComponent} from "../../../../../../shared/components/empty-data/empty-data.component";
import {Subscription} from "rxjs";
import {UnitApiService} from "../../../../services/unit-api.service";
import {UnitMapperService} from "../../../../services/unit-mapper.service";
import {ToastrService} from "ngx-toastr";
import {RoomGetModel} from '../../../../models/room-bedding/get/room-get.model';
import {RoomSubTypeEnum} from '../../../../models/room-bedding/enums/room-sub-type.enum';
import {RoomTypeEnum} from '../../../../models/room-bedding/enums/room-type.enum';
import {BedTypeEnum} from '../../../../models/room-bedding/enums/bed-type.enum';
import {FloorSizeUnitEnum} from '../../../../models/room-bedding/enums/floor-size-unit.enum';
import {BedGetModel} from '../../../../models/room-bedding/get/bed-get.model';

@Component({
  selector: 'app-room',
  imports: [
    ColComponent,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    CardTitleDirective,
    TranslatePipe,
    ButtonDirective,
    IconDirective,
    NgClass,
    FormControlDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    ReactiveFormsModule,
    FormDirective,
    DropdownComponent,
    DropdownItemDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    FormSelectDirective,
    InputGroupComponent,
    NgForOf,
    EmptyDataComponent
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {
  @Input()
  unitId!: string;
  @Input()
  roomIndex: number = 0;
  @Input()
  room!: RoomGetModel;
  bathrooms: RoomGetModel[] = [];
  @Output()
  deletedEvent: EventEmitter<{ index: number, room: RoomGetModel }> = new EventEmitter();
  @Output()
  createdEvent: EventEmitter<{ index: number, room: RoomGetModel }> = new EventEmitter();
  icons = {cilTrash, cilX, cilPlus, cilSave}
  roomForm: FormGroup;
  roomTypes = Object.values(RoomTypeEnum);
  bedTypes = Object.values(BedTypeEnum);
  livingTypes = [RoomSubTypeEnum.LIVING_ROOM, RoomSubTypeEnum.BED_IN_LIVING_ROOM];
  bedroomTypes = [RoomSubTypeEnum.MASTER, RoomSubTypeEnum.CHILDREN, RoomSubTypeEnum.GUEST];
  kitchenTypes = [RoomSubTypeEnum.FULL, RoomSubTypeEnum.KITCHENETTE];
  bathroomTypes = [RoomSubTypeEnum.FULL, RoomSubTypeEnum.THREE_QUARTER, RoomSubTypeEnum.HALF, RoomSubTypeEnum.QUARTER];
  floorSizeUnits = Object.values(FloorSizeUnitEnum);
  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private unitApiService: UnitApiService,
              private unitMapperService: UnitMapperService, private toastrService: ToastrService,
              private readonly translateService: TranslateService) {
    this.roomForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('your room input is:', this.room);
    if (!this.room.id) {
      if (!this.room.beds) {
        this.addBed();
      }
    } else {
      this.handleSuccessAction(this.room);
    }
  }

  @Input()
  set bathroomOptions(value: RoomGetModel[]) {
    this.bathrooms = value;
    if (this.room.id && this.room.bathroom) {
      this.bathrooms.push(this.room.bathroom);
    }
  }

  private createForm() {
    const form = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      type: [null, [Validators.required]],
      subType: [null, [Validators.required]],
      floorSize: [null],
      floorSizeUnit: [FloorSizeUnitEnum.SQM],
      bathroom: [null],
      description: [null],
      beds: this.fb.array([])
    })
    this.subscriptions.push(form.get('type')!.valueChanges.subscribe(value => {
      const subTypeControl = form.get('subType');
      const bedsControl = form.get('beds') as FormArray;
      if (value == "BEDROOM" || (value == "LIVING" && (subTypeControl && subTypeControl.value == "BED_IN_LIVING_ROOM"))) {
        if (bedsControl.length == 0) {
          this.addBed();
        }
      } else {
        bedsControl.clear();
      }
    }))
    return form;
  }

  roomBeds(): FormArray {
    return this.roomForm.get('beds') as FormArray;
  }

  compareBathroom(o1: RoomGetModel, o2: RoomGetModel) {
    return o1?.id == o2?.id;
  }

  setFloorSizeUnit(floorSizeUnit: string) {
    this.roomForm.patchValue({
      floorSizeUnit: floorSizeUnit
    })
  }

  getRoomSubTypes(type: string) {
    if (type == 'BEDROOM') {
      return this.bedroomTypes;
    } else if (type == 'KITCHEN') {
      return this.kitchenTypes;
    } else if (type == 'LIVING') {
      return this.livingTypes;
    } else if (type == 'BATHROOM') {
      return this.bathroomTypes;
    } else {
      return [];
    }
  }

  removeRoom(roomIndex: number) {
    if (this.room.id) {
      this.subscriptions.push(this.unitApiService.deleteRoom(this.unitId, this.room.id).subscribe({
        next: (data) => {
          console.log('Room deleted successfully. API response is:', data);
          this.deletedEvent.emit({index: roomIndex, room: this.room});
        },
        error: (err: any) => {
          console.error('An error occurred when deleting room. API error:', err);
        }
      }))
    } else {
      this.deletedEvent.emit({index: roomIndex, room: this.room});
    }
  }

  submit() {
    if (!this.room.id) {
      let payload = this.unitMapperService.formToRoomPostModel(this.roomForm.value);
      //create room
      this.subscriptions.push(this.unitApiService.createRoom(payload, this.unitId).subscribe({
        next: (data) => {
          console.log('Room created successfully. API response is:', data);
          this.handleSuccessAction(data);
          this.createdEvent.emit({index: this.roomIndex, room: data});
          this.toastrService.success(this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.creation.success.message').replace(':room', data.name),
            this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.creation.success.title'));
        },
        error: (err: any) => {
          console.error('An error occurred when creating room. API error:', err);
          this.toastrService.error(this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.creation.error.message').replace(':room', this.roomForm.value.name),
            this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.creation.error.title'));
        }
      }))
    } else {
      //update room
      let payload = this.unitMapperService.formToRoomPatchModel(this.roomForm.value);
      this.subscriptions.push(this.unitApiService.updateRoom(payload, this.unitId, this.room.id).subscribe({
        next: (data) => {
          console.log('Room updated successfully. API response is:', data);
          this.handleSuccessAction(data);
          this.createdEvent.emit({index: this.roomIndex, room: data});
          this.toastrService.info(this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.edition.success.message').replace(':room', data.name),
            this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.edition.success.title'));
        },
        error: (err: any) => {
          console.error('An error occurred when updating room. API error message:', err);
          this.toastrService.error(this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.edition.error.message').replace(':room', this.roomForm.value.name),
            this.translateService.instant('units.edit-unit.tabs.rooms-bedding.notifications.edition.error.title'));
        }
      }))
    }
  }

  private handleSuccessAction(data: RoomGetModel) {
    this.room = data;
    this.roomForm.patchValue({...data, beds: []});
    if (data.beds) {
      this.setBeds(data.beds);
    }
  }

  private setBeds(beds: BedGetModel[]) {
    const bedsArray = new FormArray<FormGroup>([]);
    beds.forEach(bed => {
      bedsArray.push(this.fb.group({
        type: [bed.type, [Validators.required]],
        quantity: [bed.quantity, [Validators.required]]
      }))
    })
    this.roomForm.setControl('beds', bedsArray);
  }

  get beds(): FormArray {
    return this.roomForm.get('beds') as FormArray;
  }

  addBed() {
    this.beds.push(this.fb.group({
      type: [null, [Validators.required]],
      quantity: [1, [Validators.required]]
    }));
  }

  removeBed(bedIndex: number) {
    this.beds.removeAt(bedIndex);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
