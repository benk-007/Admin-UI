import {Component} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {TranslatePipe} from '@ngx-translate/core';
import {cilPen, cilSearch} from '@coreui/icons';
import {ListContentComponent} from '../../../../../shared/components/list-content/list-content.component';
import {TableControlComponent} from '../../../../../shared/components/table-control/table-control.component';
import {AuditNamePipe} from '../../../../../shared/pipes/audit-name.pipe';
import {EmptyDataComponent} from '../../../../../shared/components/empty-data/empty-data.component';
import {SegmentItemGetModel} from '../../../models/segment/segment-item-get.model';
import {ActivatedRoute, Router} from '@angular/router';
import {BsModalService} from 'ngx-bootstrap/modal';
import {PageFilterModel} from '../../../../../shared/models/page-filter.model';
import {CrmApiService} from '../../../../crm/services/crm-api.service';
import {SegmentCuModalComponent} from '../segment-cu-modal/segment-cu-modal.component';

@Component({
  selector: 'app-segment-list',
  imports: [
    ColComponent,
    FormControlDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    TranslatePipe,
    TableControlComponent,
    SpinnerComponent,
    AuditNamePipe,
    ButtonDirective,
    EmptyDataComponent,
    TableDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective
  ],
  templateUrl: './segment-list.component.html',
  styleUrl: './segment-list.component.scss',
  providers: [BsModalService]
})
export class SegmentListComponent extends ListContentComponent {
  private component = '[Segment-List-Component]: ';

  icons = {cilSearch, cilPen};
  override listContent: SegmentItemGetModel[] = [];

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(name|status|creationDate|modifiedAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(public override router: Router,
              public override route: ActivatedRoute,
              public readonly crmApiService: CrmApiService,
              public readonly modalService: BsModalService) {
    super(router, route);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.sort = 'modifiedAt';
    this.sortDirection = 'desc';
    this.size = 10;
    this.subscribeToQueryParam();
    this.isAdvancedSearchDisplayed = false;
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    console.debug(this.component.concat('retrieving segment list ...'));
    let pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    }
    this.subscriptions.push(
      this.crmApiService
        .getSegmentsByPage(pageFilter)
        .subscribe({
          next: (data) => {
            console.info(this.component.concat('segments retrieved successfully. API response is:'), data);
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn(this.component.concat('An error occurred when retrieving unit list from API:'), err)
            if (!this.firstCallDone) {
              this.firstCallDone = true;
            }
          }
        })
    );
  }

  openCuModal(segment?: any) {
    let initialState = {
      segmentToEdit: segment
    }

    let segmentCuModalRef = this.modalService.show(SegmentCuModalComponent, {initialState});
    this.subscriptions.push((segmentCuModalRef.content as SegmentCuModalComponent).actionConfirmed.subscribe(
      () => {
        this.refreshListContent();
      }
    ));
  }

}
