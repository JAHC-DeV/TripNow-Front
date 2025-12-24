/**
 * Datos Mock para testing local
 * Usa estos datos si no tienes acceso a una API real
 */

import { Reservation, ReservationsListResponse, ReservationStatus } from '@app/shared/models/reservation.model';

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    customerEmail: 'josea21@nauta.com',
    tripCountry: 'ES',
    amount: 3,
    status: ReservationStatus.PENDING_RISK_CHECK,
    riskScore: 88.92,
    idempotencyKey: 'key-001',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15'),
  },
  {
    id: 2,
    customerEmail: 'maria.garcia@email.com',
    tripCountry: 'FR',
    amount: 2,
    status: ReservationStatus.APPROVED,
    riskScore: 45.3,
    idempotencyKey: 'key-002',
    createdAt: new Date('2024-12-14'),
    updatedAt: new Date('2024-12-14'),
  },
  {
    id: 3,
    customerEmail: 'juan.rodriguez@email.com',
    tripCountry: 'IT',
    amount: 4,
    status: ReservationStatus.PENDING_RISK_CHECK,
    riskScore: 62.15,
    idempotencyKey: 'key-003',
    createdAt: new Date('2024-12-13'),
    updatedAt: new Date('2024-12-13'),
  },
  {
    id: 4,
    customerEmail: 'ana.martinez@email.com',
    tripCountry: 'DE',
    amount: 1,
    status: ReservationStatus.APPROVED,
    riskScore: 20.45,
    idempotencyKey: 'key-004',
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-12'),
  },
  {
    id: 5,
    customerEmail: 'carlos.lopez@email.com',
    tripCountry: 'PT',
    amount: 2,
    status: ReservationStatus.REJECTED,
    riskScore: 95.8,
    idempotencyKey: 'key-005',
    createdAt: new Date('2024-12-11'),
    updatedAt: new Date('2024-12-11'),
  },
  {
    id: 6,
    customerEmail: 'isabel.sanchez@email.com',
    tripCountry: 'ES',
    amount: 5,
    status: ReservationStatus.APPROVED,
    riskScore: 55.6,
    idempotencyKey: 'key-006',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 7,
    customerEmail: 'david.fernandez@email.com',
    tripCountry: 'UK',
    amount: 3,
    status: ReservationStatus.PENDING_RISK_CHECK,
    riskScore: 72.25,
    idempotencyKey: 'key-007',
    createdAt: new Date('2024-12-09'),
    updatedAt: new Date('2024-12-09'),
  },
  {
    id: 8,
    customerEmail: 'laura.torres@email.com',
    tripCountry: 'NL',
    amount: 2,
    status: ReservationStatus.APPROVED,
    riskScore: 38.4,
    idempotencyKey: 'key-008',
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-08'),
  },
];

export const MOCK_RESERVATIONS_RESPONSE: ReservationsListResponse = {
  reservations: MOCK_RESERVATIONS,
  total: MOCK_RESERVATIONS.length,
  page: 1,
  pageSize: 10,
};

/**
 * Servicio HTTP mock para desarrollo sin API real
 * Usar en lugar del HttpClient real durante desarrollo
 */
export class MockHttpService {
  private Reservations: Reservation[] = [...MOCK_RESERVATIONS];
  private nextId = MOCK_RESERVATIONS.length + 1;

  getReservations(page: number = 1, pageSize: number = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return Promise.resolve(this.Reservations.slice(start, end));
  }

  getReservationById(id: number) {
    return Promise.resolve(this.Reservations.find((t) => t.id === id));
  }

  createReservation(data: any) {
    const newReservation: Reservation = {
      id: this.nextId++,
      customerEmail: data.customerEmail,
      tripCountry: data.tripCountry,
      amount: data.amount,
      status: ReservationStatus.PENDING_RISK_CHECK, // Pending
      riskScore: Math.random() * 100,
      idempotencyKey: `key-${this.nextId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.Reservations.unshift(newReservation);
    return Promise.resolve(newReservation);
  }
}
