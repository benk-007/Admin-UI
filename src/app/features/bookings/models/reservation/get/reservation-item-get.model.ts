import { AuditGetModel } from '../../../../../shared/models/audit-get.model';
import { ReservationStatusEnum } from '../enums/reservation-status.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { ReservationTypeEnum } from '../enums/reservation-type.enum';
import { GuestModel } from '../commons/guest.model';
import { OccupancyModel } from '../commons/occupancy.model';
import { SegmentModel } from '../commons/segment.model';
import { PaymentModel } from '../commons/payment.model';

export interface ReservationItemGetModel {
  id: string;
  checkInDate: Date;
  checkOutDate: Date;
  guest: GuestModel;
  status: ReservationStatusEnum;
  paymentStatus: PaymentStatusEnum;
  payment: PaymentModel;
  occupancy: OccupancyModel;
  segment: SegmentModel;
  type: ReservationTypeEnum;
  audit: AuditGetModel;
  priority: number;
  subReservations: ReservationItemGetModel[];
}
