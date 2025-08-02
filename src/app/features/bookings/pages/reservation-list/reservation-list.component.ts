import { Component } from '@angular/core';
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
import { TranslatePipe } from "@ngx-translate/core";
import { IconDirective } from "@coreui/icons-angular";
import { cilCalendar, cilCash, cilYen, cilPen, cilSearch, cilWc } from "@coreui/icons";
import { ListContentComponent } from "../../../../shared/components/list-content/list-content.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ReservationApiService } from "../../services/reservation-api.service";
import { AuditNamePipe } from "../../../../shared/pipes/audit-name.pipe";
import { TooltipDirective } from "ngx-bootstrap/tooltip";
import { TableControlComponent } from "../../../../shared/components/table-control/table-control.component";
import { EmptyDataComponent } from "../../../../shared/components/empty-data/empty-data.component";
import { PageTitleComponent } from "../../../../shared/components/page-title/page-title.component";
import { PageFilterModel } from "../../../../shared/models/page-filter.model";
import { ReservationItemGetModel } from '../../models/reservation/get/reservation-item-get.model';
import { UtilsService } from '../../../../shared/services/utils.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import {DatePipe, TitleCasePipe} from '@angular/common';
import { ReservationStatusEnum } from '../../models/reservation/enums/reservation-status.enum';
import { PaymentStatusEnum } from '../../models/reservation/enums/payment-status.enum';

@Component({
  selector: 'app-reservation-list',
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
    BadgeComponent,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent extends ListContentComponent {
  protected readonly UtilsService = UtilsService;
  protected readonly ReservationStatusEnum = ReservationStatusEnum;
  protected readonly PaymentStatusEnum = PaymentStatusEnum;

  icons = { cilSearch, cilCalendar, cilCash, cilPen, cilYen, cilWc };
  reservationIdExpanded!: string | null;
  expand: boolean = false;
  override listContent: ReservationItemGetModel[] = [];

  // Fixed date for check-in button logic (as per requirements)
  private readonly TODAY_DATE = new Date('2025-08-05');

  override listParamValidator = {
    page: /^[1-9]\d*$/,
    size: ['10', '20', '50', '100'],
    sort: /^(checkInDate|guest|status|createdAt|modifiedAt),(asc|desc)$/,
    search: /.{3,}/,
  };

  constructor(
    public override router: Router,
    public override route: ActivatedRoute,
    public readonly reservationApiService: ReservationApiService
  ) {
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
    console.log('Retrieving reservation list ...');

    let pageFilter: PageFilterModel = {
      page: this.page,
      size: this.size,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search
    };

    this.subscriptions.push(
      this.reservationApiService
        .getReservationsByPage(pageFilter)
        .subscribe({
          next: (data) => {
            super.handleSuccessData(data);
          },
          error: (err: any) => {
            console.warn('An error occurred when retrieving reservation list from API:', err);
            if (!this.firstCallDone) {
              this.firstCallDone = true;
            }
          }
        })
    );
  }

  /**
   * Expand sub-reservations for bulk reservations
   */
  expandSubReservations(reservation: ReservationItemGetModel) {
    if (this.reservationIdExpanded == reservation.id) {
      this.reservationIdExpanded = null;
      this.expand = false;
    } else {
      this.reservationIdExpanded = reservation.id;
      this.expand = true;
    }
  }

  /**
   * Check if the check-in date is today
   */
  isCheckInToday(checkInDate: Date): boolean {
    const checkIn = new Date(checkInDate);
    return checkIn.toDateString() === this.TODAY_DATE.toDateString();
  }

  /**
   * Get status badge color based on reservation status
   */
  getStatusBadgeColor(status: ReservationStatusEnum): string {
    switch (status) {
      case ReservationStatusEnum.CONFIRMED:
        return 'success'; // Green
      case ReservationStatusEnum.CANCELED:
        return 'danger'; // Red
      case ReservationStatusEnum.IN_HOUSE:
        return 'secondary'; // Blue
      default:
        return 'secondary';
    }
  }

  /**
   * Get payment status badge color
   */
  getPaymentBadgeColor(paymentStatus: PaymentStatusEnum): string {
    switch (paymentStatus) {
      case PaymentStatusEnum.PAID:
        return 'success';
      case PaymentStatusEnum.UNPAID:
        return 'mauve';
      default:
        return 'secondary';
    }
  }

  /**
   * Format occupancy display text
   */
  formatOccupancy(adults: number, children: number): string {
    let result = `${adults} Adult${adults > 1 ? 's' : ''}`;
    if (children > 0) {
      result += ` ${children} Child${children > 1 ? 'ren' : ''}`;
    }
    return result;
  }

  /**
   * Format payment display text
   */
  formatPaymentAmount(amountPaid: number, totalAmount: number, currency: string): string {
    return `${amountPaid.toFixed(2)}/${totalAmount.toFixed(2)} ${currency}`;
  }

  /**
   * Handle check-in action
   */
  handleCheckIn(reservation: ReservationItemGetModel): void {
    console.log('Check-in reservation:', reservation.id);
    // TODO: Implement check-in logic
  }

  /**
   * Handle edit action
   */
  handleEdit(reservation: ReservationItemGetModel): void {
    console.log('Edit reservation:', reservation.id);
    // TODO: Implement edit navigation
  }

  /**
   * Handle view action
   */
  handleView(reservation: ReservationItemGetModel): void {
    console.log('View reservation:', reservation.id);
    // TODO: Implement view navigation
  }

  override refreshListContent(): void {
    this.reservationIdExpanded = null;
    this.expand = false;
    super.refreshListContent();
  }
}
