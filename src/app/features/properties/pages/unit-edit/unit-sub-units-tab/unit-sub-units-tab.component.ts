import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from "ngx-bootstrap/modal";

// CoreUI Components
import {
  ButtonDirective, ColComponent, RowComponent, TableDirective,
  AvatarComponent, SpinnerComponent, FormControlDirective,
  InputGroupComponent, InputGroupTextDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilTrash, cilSearch, cilPen } from '@coreui/icons';

// Services and Models
import { UnitApiService } from '../../../services/unit-api.service';
import { UnitItemGetModel } from '../../../models/unit/get/unit-item-get.model';
import { PageFilterModel } from '../../../../../shared/models/page-filter.model';
import { ListContentComponent } from '../../../../../shared/components/list-content/list-content.component';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { AuditNamePipe } from '../../../../../shared/pipes/audit-name.pipe';

// Modals
import { SubUnitCreateModalComponent } from './sub-unit-create-modal/sub-unit-create-modal.component';
import { SubUnitEditModalComponent } from './sub-unit-edit-modal/sub-unit-edit-modal.component';

@Component({
  selector: 'app-unit-sub-units-tab',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ButtonDirective,
    ColComponent,
    RowComponent,
    TableDirective,
    AvatarComponent,
    SpinnerComponent,
    IconDirective,
    EmptyDataComponent,
    FormControlDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    AuditNamePipe
  ],
  providers: [BsModalService],
  templateUrl: './unit-sub-units-tab.component.html',
  styleUrl: './unit-sub-units-tab.component.scss'
})
export class UnitSubUnitsTabComponent extends ListContentComponent implements OnInit, OnDestroy {

  // Component properties
  multiUnitId!: string;
  subUnits: UnitItemGetModel[] = [];
  override listContent: UnitItemGetModel[] = [];
  icons = { cilTrash, cilSearch, cilPen };

  // List validation parameters
  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|priority|readiness|createdAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    private unitApiService: UnitApiService,
    private modalService: BsModalService,
    private toastrService: ToastrService,
  ) {
    super(router, route);
  }

  /**
   * Component initialization
   * Sets up default sorting and pagination, extracts multiUnitId from route
   */
  override ngOnInit(): void {
    super.ngOnInit();
    this.sort = 'priority';
    this.sortDirection = 'asc';
    this.size = 10;
    this.multiUnitId = this.route.parent?.snapshot.params['unitId'];
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  /**
   * Retrieve sub-units list from API
   * Handles pagination, sorting, and search functionality
   * @param params - Query parameters for API call
   */
  override retrieveListContent(params: any): void {
    super.retrieveListContent(params);
    console.log('Retrieving sub-units list for multiUnitId:', this.multiUnitId);

    const pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    };

    this.subscriptions.push(
      this.unitApiService.getSubUnits(this.multiUnitId, pageFilter).subscribe({
        next: (response) => {
          // Transform API response to match expected page structure
          const mockPageData = {
            content: response.content || [],
            totalElements: response.content?.length || 0,
            numberOfElements: response.content?.length || 0,
            pageable: { offset: 0 },
            empty: !response.content || response.content.length === 0,
            last: true,
            first: true
          };

          super.handleSuccessData(mockPageData);
          this.subUnits = this.listContent;
          console.log('Sub-units loaded successfully:', this.subUnits);
        },
        error: (err) => {
          console.error('Error loading sub-units:', err);
          if (!this.firstCallDone) {
            this.firstCallDone = true;
          }
          this.toastrService.error(
            'Failed to load sub-units. Please try again.',
            'Loading Error'
          );
        }
      })
    );
  }

  /**
   * Open modal to create new sub-units
   * Handles both new sub-unit creation and existing unit assignment
   */
  onAddNewSubUnit(): void {
    const initialState = {
      multiUnitId: this.multiUnitId
    };

    const modalRef = this.modalService.show(SubUnitCreateModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as SubUnitCreateModalComponent).subUnitCreated.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  /**
   * Open modal to edit existing sub-unit
   * @param subUnit - Sub-unit to edit
   */
  onEditSubUnit(subUnit: UnitItemGetModel): void {
    const initialState = {
      subUnit: subUnit
    };

    const modalRef = this.modalService.show(SubUnitEditModalComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.subscriptions.push(
      (modalRef.content as SubUnitEditModalComponent).subUnitUpdated.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

  /**
   * Show confirmation modal and detach sub-unit
   * @param subUnit - Sub-unit to detach from multi-unit
   */
  onRemoveSubUnit(subUnit: UnitItemGetModel): void {
    const initialState = {
      title: 'Detach SubUnit',
      message: `Are you sure you want to detach "${subUnit.name}" from this multi-unit? The unit will become independent but won't be deleted.`
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, {
      initialState
    });

    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.detachSubUnit(subUnit);
      })
    );
  }

  /**
   * Detach sub-unit from its parent multi-unit
   * @param subUnit - Sub-unit to detach
   */
  private detachSubUnit(subUnit: UnitItemGetModel): void {
    this.subscriptions.push(
      this.unitApiService.detachSubUnit(subUnit.id).subscribe({
        next: () => {
          this.refreshListContent();
          this.toastrService.success(
            `SubUnit "${subUnit.name}" has been successfully detached.`,
            'SubUnit Detached'
          );
        },
        error: (err) => {
          console.error('Error detaching sub-unit:', err);
          this.toastrService.error(
            `Failed to detach "${subUnit.name}". Please try again.`,
            'Detachment Failed'
          );
        }
      })
    );
  }

  /**
   * Cleanup component subscriptions
   */
  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
