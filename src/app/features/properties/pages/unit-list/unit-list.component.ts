import {Component} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from "@coreui/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {IconDirective} from "@coreui/icons-angular";
import {cilArrowBottom, cilBath, cilBed, cilChevronRight, cilMediaPlay, cilPen, cilSearch} from "@coreui/icons";
import {BsModalService} from "ngx-bootstrap/modal";
import {UnitCreateModalComponent} from "../unit-create-modal/unit-create-modal.component";
import {ListContentComponent} from "../../../../shared/components/list-content/list-content.component";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {UnitApiService} from "../../services/unit-api.service";
import {AuditNamePipe} from "../../../../shared/pipes/audit-name.pipe";
import {TooltipDirective} from "ngx-bootstrap/tooltip";
import {TableControlComponent} from "../../../../shared/components/table-control/table-control.component";
import {EmptyDataComponent} from "../../../../shared/components/empty-data/empty-data.component";
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {MultiUnitCreateModalComponent} from "../multi-unit-create-modal/multi-unit-create-modal.component";
import {PageFilterModel} from "../../../../shared/models/page-filter.model";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {UnitItemGetModel} from '../../models/unit/unit-item-get.model';

@Component({
  selector: 'app-unit-list',
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    TranslatePipe,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TableDirective,
    AuditNamePipe,
    AvatarComponent,
    RouterLink,
    TooltipDirective,
    ButtonGroupComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    TableControlComponent,
    EmptyDataComponent,
    SpinnerComponent,
    PageTitleComponent,
    BsDatepickerModule,
  ],
  templateUrl: './unit-list.component.html',
  styleUrl: './unit-list.component.scss',
  providers: [BsModalService]
})
export class UnitListComponent extends ListContentComponent {

  icons = {cilSearch, cilBed, cilBath, cilPen, cilMediaPlay, cilArrowBottom, cilChevronRight}
  unitIdExpanded!: string | null;
  expand: boolean = false;
  override listContent: UnitItemGetModel[] = [];
  // Nouvel état pour gérer l'expansion des multi-units
  expandedUnits: Set<string> = new Set();
  // Unités qui doivent être auto-expandues à cause de la recherche
  autoExpandedUnits: Set<string> = new Set();

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|type|website|status|creationDate|modifiedAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly unitApiService: UnitApiService,
              public readonly modalService: BsModalService) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'modifiedAt';
    this.sortDirection = 'desc';
    this.size = 10;
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    console.log('Retrieving unit list ...')
    let pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    }
    this.subscriptions.push(
      this.unitApiService
        .getUnitsByPage(pageFilter)
        .subscribe({
          next: (data) => {
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving unit list from API:', err)
            if (!this.firstCallDone) {
              this.firstCallDone = true;
            }
          }
        })
    );
  }

  expandSubUnits(unit: UnitItemGetModel) {
    if (this.unitIdExpanded == unit.id) {
      this.unitIdExpanded = null;
      this.expand = false;
    } else {
      this.unitIdExpanded = unit.id;
      this.expand = true;
    }
  }

  openCreateUnitModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let unitCreateModalRef = this.modalService.show(UnitCreateModalComponent, initialState);

    this.subscriptions.push((unitCreateModalRef.content as UnitCreateModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }

  openCreateMultiUnitModal() {
    let initialState = {
      class: 'modal-lg'
    }
    let multiUnitCreateModalRef = this.modalService.show(MultiUnitCreateModalComponent, initialState);

    this.subscriptions.push((multiUnitCreateModalRef.content as MultiUnitCreateModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }

  override refreshListContent(): void {

    this.expandedUnits.clear();
    this.autoExpandedUnits.clear();
    super.refreshListContent();
  }


}
