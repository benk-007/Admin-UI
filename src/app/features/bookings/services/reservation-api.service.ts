import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PageModel } from '../../../shared/models/pageable/page.model';
import { PageFilterModel } from '../../../shared/models/page-filter.model';
import { ReservationItemGetModel } from '../models/reservation/get/reservation-item-get.model';
import { ReservationStatusEnum } from '../models/reservation/enums/reservation-status.enum';
import { PaymentStatusEnum } from '../models/reservation/enums/payment-status.enum';
import { ReservationTypeEnum } from '../models/reservation/enums/reservation-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ReservationApiService {

  constructor() { }

  /**
   * Get reservations by page with mock data
   */
  getReservationsByPage(pageFilter: PageFilterModel): Observable<PageModel<ReservationItemGetModel>> {
    const mockData = this.generateMockReservations();

    // Apply search filter if provided
    let filteredData = mockData;
    if (pageFilter.search) {
      const searchTerm = pageFilter.search.toLowerCase();
      filteredData = mockData.filter(reservation =>
        reservation.guest.fullName.toLowerCase().includes(searchTerm) ||
        reservation.guest.email.toLowerCase().includes(searchTerm) ||
        reservation.segment.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = pageFilter.page * pageFilter.size;
    const endIndex = startIndex + pageFilter.size;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Create page response
    const pageResponse: PageModel<ReservationItemGetModel> = {
      content: paginatedData,
      pageable: {
        sort: { empty: true, unsorted: true, sorted: false },
        offset: startIndex,
        pageNumber: pageFilter.page,
        pageSize: pageFilter.size,
        paged: true,
        unpaged: false
      },
      last: endIndex >= filteredData.length,
      totalPages: Math.ceil(filteredData.length / pageFilter.size),
      totalElements: filteredData.length,
      first: pageFilter.page === 0,
      size: pageFilter.size,
      number: pageFilter.page,
      numberOfElements: paginatedData.length,
      empty: paginatedData.length === 0,
      sort: { empty: true, unsorted: true, sorted: false }
    };

    // Simulate API delay
    return of(pageResponse).pipe(delay(300));
  }

  /**
   * Generate mock reservation data
   */
  private generateMockReservations(): ReservationItemGetModel[] {
    return [
      {
        id: '1',
        checkInDate: new Date('2025-08-05'),
        checkOutDate: new Date('2025-08-10'),
        guest: {
          id: 'guest-1',
          fullName: 'Samir Fousssi',
          email: 'samir.fousssi@example.com',
          mobile: '+212 6 12 34 56 78'
        },
        status: ReservationStatusEnum.CONFIRMED,
        paymentStatus: PaymentStatusEnum.PAID,
        payment: {
          amountPaid: 12000.00,
          totalAmount: 12000.00,
          currency: 'MAD'
        },
        occupancy: { adults: 2, children: 1 },
        segment: { id: 'seg-1', name: 'Business' },
        type: ReservationTypeEnum.SINGLE,
        audit: {
          createdBy: 'John Doe',
          createdAt: new Date('2025-01-15'),
          modifiedBy: 'John Doe',
          modifiedAt: new Date('2025-01-20')
        },
        priority: 1,
        subReservations: []
      },
      {
        id: '2',
        checkInDate: new Date('2025-02-15'),
        checkOutDate: new Date('2025-02-20'),
        guest: {
          id: 'guest-2',
          fullName: 'Ahmed Ben Ali',
          email: 'ahmed.benali@example.com',
          mobile: '+212 6 87 65 43 21'
        },
        status: ReservationStatusEnum.IN_HOUSE,
        paymentStatus: PaymentStatusEnum.UNPAID,
        payment: {
          amountPaid: 5000.00,
          totalAmount: 9000.00,
          currency: 'MAD'
        },
        occupancy: { adults: 2, children: 0 },
        segment: { id: 'seg-2', name: 'Leisure' },
        type: ReservationTypeEnum.SINGLE,
        audit: {
          createdBy: 'Jane Smith',
          createdAt: new Date('2025-01-10'),
          modifiedBy: 'Jane Smith',
          modifiedAt: new Date('2025-01-18')
        },
        priority: 2,
        subReservations: []
      },
      {
        id: '3',
        checkInDate: new Date('2025-03-01'),
        checkOutDate: new Date('2025-03-05'),
        guest: {
          id: 'guest-3',
          fullName: 'Maria Gonzalez',
          email: 'maria.gonzalez@example.com',
          mobile: '+34 6 12 34 56 78'
        },
        status: ReservationStatusEnum.CANCELED,
        paymentStatus: PaymentStatusEnum.UNPAID,
        payment: {
          amountPaid: 0.00,
          totalAmount: 7500.00,
          currency: 'MAD'
        },
        occupancy: { adults: 1, children: 2 },
        segment: { id: 'seg-3', name: 'Group' },
        type: ReservationTypeEnum.SINGLE,
        audit: {
          createdBy: 'Mike Johnson',
          createdAt: new Date('2025-01-05'),
          modifiedBy: 'Mike Johnson',
          modifiedAt: new Date('2025-01-15')
        },
        priority: 3,
        subReservations: []
      },
      {
        id: '4',
        checkInDate: new Date('2025-04-10'),
        checkOutDate: new Date('2025-04-15'),
        guest: {
          id: 'guest-4',
          fullName: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          mobile: '+33 6 12 34 56 78'
        },
        status: ReservationStatusEnum.CONFIRMED,
        paymentStatus: PaymentStatusEnum.PAID,
        payment: {
          amountPaid: 6000.00,
          totalAmount: 6000.00,
          currency: 'MAD'
        },
        occupancy: { adults: 4, children: 2 },
        segment: { id: 'seg-1', name: 'Business' },
        type: ReservationTypeEnum.BULK,
        audit: {
          createdBy: 'Sarah Wilson',
          createdAt: new Date('2025-01-12'),
          modifiedBy: 'Sarah Wilson',
          modifiedAt: new Date('2025-01-22')
        },
        priority: 4,
        subReservations: [
          {
            id: '4-1',
            checkInDate: new Date('2025-04-10'),
            checkOutDate: new Date('2025-04-15'),
            guest: {
              id: 'guest-4-1',
              fullName: 'Sophie Dupont',
              email: 'sophie.dupont@example.com',
              mobile: '+33 6 87 65 43 21'
            },
            status: ReservationStatusEnum.CONFIRMED,
            paymentStatus: PaymentStatusEnum.PAID,
            payment: {
              amountPaid: 6000.00,
              totalAmount: 6000.00,
              currency: 'MAD'
            },
            occupancy: { adults: 2, children: 1 },
            segment: { id: 'seg-1', name: 'Business' },
            type: ReservationTypeEnum.SINGLE,
            audit: {
              createdBy: 'Sarah Wilson',
              createdAt: new Date('2025-01-12'),
              modifiedBy: 'Sarah Wilson',
              modifiedAt: new Date('2025-01-22')
            },
            priority: 1,
            subReservations: []
          },
          {
            id: '4-2',
            checkInDate: new Date('2025-04-10'),
            checkOutDate: new Date('2025-04-15'),
            guest: {
              id: 'guest-4-2',
              fullName: 'Pierre Dupont',
              email: 'pierre.dupont@example.com',
              mobile: '+33 6 98 76 54 32'
            },
            status: ReservationStatusEnum.CONFIRMED,
            paymentStatus: PaymentStatusEnum.PAID,
            payment: {
              amountPaid: 6000.00,
              totalAmount: 6000.00,
              currency: 'MAD'
            },
            occupancy: {adults: 2, children: 1},
            segment: {id: 'seg-1', name: 'Business'},
            type: ReservationTypeEnum.SINGLE,
            audit: {
              createdBy: 'Sarah Wilson',
              createdAt: new Date('2025-01-12'),
              modifiedBy: 'Sarah Wilson',
              modifiedAt: new Date('2025-01-22')
            },
            priority: 2,
            subReservations: [],
          }
        ]
      },
      {
        id: '5',
        checkInDate: new Date('2025-05-20'),
        checkOutDate: new Date('2025-05-25'),
        guest: {
          id: 'guest-5',
          fullName: 'Emma Thompson',
          email: 'emma.thompson@example.com',
          mobile: '+44 7 12 34 56 78'
        },
        status: ReservationStatusEnum.CONFIRMED,
        paymentStatus: PaymentStatusEnum.UNPAID,
        payment: {
          amountPaid: 3000.00,
          totalAmount: 8500.00,
          currency: 'MAD'
        },
        occupancy: { adults: 2, children: 0 },
        segment: { id: 'seg-2', name: 'Leisure' },
        type: ReservationTypeEnum.SINGLE,
        audit: {
          createdBy: 'David Brown',
          createdAt: new Date('2025-01-08'),
          modifiedBy: 'David Brown',
          modifiedAt: new Date('2025-01-25')
        },
        priority: 5,
        subReservations: []
      }
    ];
  }
}
