/**
 * Modelo que representa una reserva de viaje
 * Cumple con el principio de Single Responsibility
 */
export interface Reservation {
  id: number;
  customerEmail: string;
  tripCountry: string;
  amount: number;
  status: ReservationStatus;
  riskScore: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Estados posibles de una reserva
 */
export enum ReservationStatus {
  PENDING_RISK_CHECK = 'PENDING_RISK_CHECK',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Request para crear una nueva reserva
 * Sigue el principio de Interface Segregation
 */
export interface CreateReservationRequest {
  customerEmail: string;
  tripCountry: string;
  amount: number;
  idempotencyKey: string;
}

/**
 * Response genérica de la API
 * Permite reutilizar para diferentes tipos de datos
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Response para listado de viajes
 */
export interface ReservationsListResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  pageSize: number;
}
