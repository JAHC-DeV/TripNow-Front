import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '@app/core/services/reservation.service';
import { CreateReservationRequest } from '@app/shared/models/reservation.model';

/**
 * Componente modal para crear nuevas reservas
 * Principio: Single Responsibility - solo maneja la creación de reservas
 * Sigue patrones de formularios reactivos
 */
@Component({
  selector: 'app-create-reservation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-reservation-modal.component.html',
  styleUrl: './create-reservation-modal.component.css'
})
export class CreateReservationModalComponent {
  isOpen = signal(false);
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    readonly reservationService: ReservationService
  ) {
    this.form = this.fb.group({
      customerEmail: ['', [Validators.required, Validators.email]],
      tripCountry: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  /**
   * Obtiene el control de formulario
   */
  getControl(controlName: string) {
    return this.form.get(controlName);
  }

  /**
   * Abre el modal
   */
  open(): void {
    this.isOpen.set(true);
    this.form.reset();
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.isOpen.set(false);
    this.form.reset();
  }

  /**
   * Maneja el clic en el fondo del modal
   */
  onBackdropClick(): void {
    this.close();
  }

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    if (this.form.valid) {
      const request: CreateReservationRequest = this.form.value;
      this.reservationService.createReservation(request);
      this.close();
    }
  }
}
