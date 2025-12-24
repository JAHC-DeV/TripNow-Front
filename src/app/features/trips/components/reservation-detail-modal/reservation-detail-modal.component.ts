import { Component, Input, OnChanges, Signal, signal } from '@angular/core';
import { Reservation } from '@app/shared/models/reservation.model';
import { ReservationService } from '@app/core/services/reservation.service';
import { DatePipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-reservation-detail-modal',
  templateUrl: './reservation-detail-modal.component.html',
  styleUrl: './reservation-detail-modal.component.css',
  imports: [DatePipe, LowerCasePipe],
})
export class ReservationDetailModalComponent implements OnChanges {
  isOpen = signal(false);
  reservationId = signal<number | null>(null);

  reservation?: Reservation;
  loading = false;
  error?: string;

  constructor(private reservationService: ReservationService) {}

  ngOnChanges() {
    if (this.isOpen() && this.reservationId()) {
      this.loadreservation();
    }
  }

  loadreservation() {
    this.loading = true;
    this.error = undefined;
    this.reservation = undefined;

    this.reservationService.getById(this.reservationId()!).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la información de la reserva';
        this.loading = false;
      },
    });
  }

  close() {
    this.isOpen.set(false);
  }

  open(id: number) {
    this.isOpen.set(true);
    this.reservationId.set(id);
      this.reservationService.getById(this.reservationId()!).subscribe({
        next: (reservation) => {
          this.reservation = reservation;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar la información de la reserva';
          this.loading = false;
        },
      });
  }
}
