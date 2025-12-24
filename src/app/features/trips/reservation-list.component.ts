import {
  Component,
  ViewChild,
  signal,
  effect,
  OnInit,
  OnDestroy,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationService } from '@app/core/services/reservation.service';
import { CreateReservationModalComponent } from './components/create-reservation-modal/create-reservation-modal.component';
import { ReservationStatus } from '@app/shared/models/reservation.model';
import { ReservationDetailModalComponent } from './components/reservation-detail-modal/reservation-detail-modal.component';

/**
 * Componente principal que gestiona el listado de viajes
 * Implementa:
 * - Signals para reactividad
 * - Nueva sintaxis de Angular (@for, @if)
 * - Arquitectura limpia
 * - Patrón presentacional/contenedor
 */
@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, CreateReservationModalComponent, ReservationDetailModalComponent],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css',
})
export class ReservationListComponent implements OnInit {
  @ViewChild(CreateReservationModalComponent) createModal!: CreateReservationModalComponent;
  @ViewChild(ReservationDetailModalComponent) detailModal!: ReservationDetailModalComponent;
  readonly ReservationStatus = ReservationStatus;
  private destroyRef = inject(DestroyRef);

  selectedReservationId = signal<number | null>(null);
  isDetailOpen = signal(false);

  constructor(
    readonly reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Cargar viajes al inicializar
    this.reservationService.fetchTrips();

    // Recargar la lista cada 20 segundos
    interval(20000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.reservationService.fetchTrips();
      });
  }

  /**
   * Abre el modal de crear reserva
   */
  openCreateModal(): void {
    this.createModal.open();
  }

  /**
   * Recarga el listado de viajes
   */
  reload(): void {
    this.reservationService.fetchTrips();
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getStatusClass(status: ReservationStatus): string {
    const statusMap: Record<ReservationStatus, string> = {
      PENDING_RISK_CHECK: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
    };
    return statusMap[status] || 'status-pending';
  }

  /**
   * Obtiene la etiqueta legible del estado
   */
  getStatusLabel(status: ReservationStatus): string {
    const statusMap: Record<ReservationStatus, string> = {
      PENDING_RISK_CHECK: 'PENDING_RISK_CHECK',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    };
    return statusMap[status] || 'Desconocido';
  }

  /**
   * Obtiene el nivel de riesgo basado en el score
   */
  getRiskLevel(riskScore: number): string {
    if (riskScore < 40) return 'low';
    if (riskScore < 70) return 'medium';
    return 'high';
  }

  openDetail(id: number) {
     this.detailModal.open(id);
  }
}
