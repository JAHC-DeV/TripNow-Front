import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateReservationRequest, Reservation,ReservationStatus } from '@app/shared/models/reservation.model';
import { environment } from '@app/environments/environment';
import { UuidService } from './uuid.service';

/**
 * Servicio para gestionar operaciones con viajes
 * Implementa el patrón Repository
 * Principios: Single Responsibility, Dependency Inversion
 */
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly apiUrl = environment.apiUrl;

  // Signals para estado reactivo
  private readonly reservationsSignal = signal<Reservation[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly totalReservationsSignal = signal<number>(0);

  // Signals de solo lectura para componentes
  readonly reservations = this.reservationsSignal;
  readonly loading = this.loadingSignal;
  readonly error = this.errorSignal;
  readonly totalReservations = this.totalReservationsSignal;

  constructor(private readonly http: HttpClient, private readonly uuidService: UuidService) {}

  /**
   * Obtiene el listado de reservas
   */
  fetchTrips(page: number = 1, pageSize: number = 10): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const idempotencyKey = this.uuidService.getUuid();
    this.http
      .get<Reservation[]>(`${this.apiUrl}/Reservations/by-idempotency-key/${idempotencyKey}`)
      .subscribe({
        next: (response) => {
          if (!response || response.length === 0) {
            this.reservationsSignal.set([]);
            this.totalReservationsSignal.set(0);
            this.errorSignal.set('No existen reservas aún');
            this.loadingSignal.set(false);
          } else {
            this.reservationsSignal.set(response);
            this.totalReservationsSignal.set(response.length);
            this.errorSignal.set(null);
            this.loadingSignal.set(false);
          }
        },
        error: (err) => {
          if (err.status === 404) {
            this.errorSignal.set('No existen reservas aún');
          } else {
            this.errorSignal.set('Error al cargar las reservas');
          }
          this.reservationsSignal.set([]);
          this.totalReservationsSignal.set(0);
          this.loadingSignal.set(false);
          console.error('Error fetching reservations:', err);
        },
      });
  }

  /**
   * Crea una nueva reserva
   */
  createReservation(request: CreateReservationRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    request.idempotencyKey = this.uuidService.getUuid();
    this.http.post<Reservation>(`${this.apiUrl}/Reservations/create`, request).subscribe({
      next: (newReservation) => {
        this.fetchTrips();
      },
      error: (err) => {
        this.errorSignal.set('Error al crear la reserva');
        this.loadingSignal.set(false);
        console.error('Error creating trip:', err);
      },
    });
  }

  /**
   * Obtiene una reserva por ID
   */
  getById(id: number): Observable<Reservation> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return new Observable((observer) => {
      this.http.get<Reservation>(`${this.apiUrl}/Reservations/${id}`).subscribe({
        next: (reservation) => {
          // Actualiza la reserva en la lista si existe
          // this.reservationsSignal.update((reservations) => reservations.map((r) => (r.id === reservation.id ? reservation : r)));
          this.loadingSignal.set(false);
          observer.next(reservation);
          observer.complete();
        },
        error: (err) => {
          this.errorSignal.set('Error al obtener la reserva');
          this.loadingSignal.set(false);
          console.error('Error fetching reservation:', err);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this.reservationsSignal.set([]);
    this.errorSignal.set(null);
    this.totalReservationsSignal.set(0);
  }
}
