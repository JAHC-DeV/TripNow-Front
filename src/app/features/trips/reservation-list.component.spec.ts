import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReservationService } from '@app/core/services/reservation.service';
import { ThemeService } from '@app/core/services/theme.service';
import { UuidService } from '@app/core/services/uuid.service';
import { signal } from '@angular/core';
import { Reservation, ReservationStatus } from '@app/shared/models/reservation.model';
import { ReservationListComponent } from './reservation-list.component';

describe('ReservationListComponent', () => {
  let component: ReservationListComponent;
  let fixture: ComponentFixture<ReservationListComponent>;
  let reservationService: ReservationService;
  let themeService: ThemeService;

  const mockReservations: Reservation[] = [
    {
      id: 1,
      customerEmail: 'test@example.com',
      tripCountry: 'ES',
      amount: 2,
      status: ReservationStatus.PENDING_RISK_CHECK,
      riskScore: 25.5,
      createdAt: new Date(),
      idempotencyKey: 'test-uuid',
      updatedAt: new Date(),
    },
    {
      id: 2,
      customerEmail: 'test2@example.com',
      tripCountry: 'FR',
      amount: 3,
      status: ReservationStatus.APPROVED,
      riskScore: 45.0,
      createdAt: new Date(),
      idempotencyKey: 'test-uuid',
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationListComponent, HttpClientTestingModule],
      providers: [ReservationService, ThemeService, UuidService],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationListComponent);
    component = fixture.componentInstance;
    reservationService = TestBed.inject(ReservationService);
    themeService = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar reservas al inicializar', () => {
    spyOn(reservationService, 'fetchTrips');
    component.ngOnInit();
    expect(reservationService.fetchTrips).toHaveBeenCalled();
  });

  it('debería recargar las reservas cada 20 segundos', fakeAsync(() => {
    spyOn(reservationService, 'fetchTrips');
    component.ngOnInit();
    expect(reservationService.fetchTrips).toHaveBeenCalledTimes(1);

    tick(20000);
    expect(reservationService.fetchTrips).toHaveBeenCalledTimes(2);

    tick(20000);
    expect(reservationService.fetchTrips).toHaveBeenCalledTimes(3);
  }));

  it('debería abrir el modal al hacer clic en openCreateModal', () => {
    spyOn(component.createModal, 'open');
    component.openCreateModal();
    expect(component.createModal.open).toHaveBeenCalled();
  });

  it('debería recargar reservas al llamar reload', () => {
    spyOn(reservationService, 'fetchTrips');
    component.reload();
    expect(reservationService.fetchTrips).toHaveBeenCalled();
  });

  it('debería alternar el tema al hacer clic en toggleTheme', () => {
    spyOn(themeService, 'toggleTheme');
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  describe('getStatusClass', () => {
    it('debería retornar la clase correcta para cada estado', () => {
      expect(component.getStatusClass(ReservationStatus.PENDING_RISK_CHECK)).toBe('status-pending');
      expect(component.getStatusClass(ReservationStatus.APPROVED)).toBe('status-approved');
      expect(component.getStatusClass(ReservationStatus.REJECTED)).toBe('status-rejected');
      expect(component.getStatusClass(ReservationStatus.PENDING_RISK_CHECK)).toBe('status-pending');
    });
  });

  describe('getStatusLabel', () => {
    it('debería retornar la etiqueta legible para cada estado', () => {
      expect(component.getStatusLabel(ReservationStatus.PENDING_RISK_CHECK)).toBe('Pendiente');
      expect(component.getStatusLabel(ReservationStatus.APPROVED)).toBe('Aprobada');
      expect(component.getStatusLabel(ReservationStatus.REJECTED)).toBe('Rechazada');
    });
  });

  describe('getRiskLevel', () => {
    it('debería retornar nivel bajo para scores < 40', () => {
      expect(component.getRiskLevel(20)).toBe('low');
      expect(component.getRiskLevel(39)).toBe('low');
    });

    it('debería retornar nivel medio para scores 40-69', () => {
      expect(component.getRiskLevel(40)).toBe('medium');
      expect(component.getRiskLevel(69)).toBe('medium');
    });

    it('debería retornar nivel alto para scores >= 70', () => {
      expect(component.getRiskLevel(70)).toBe('high');
      expect(component.getRiskLevel(99)).toBe('high');
    });
  });

  it('debería mostrar la lista de reservas cuando están disponibles', () => {
    reservationService.reservations.set(mockReservations);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('debería mostrar estado de carga', () => {
    reservationService.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
  });

  it('debería mostrar error cuando existe', () => {
    reservationService.error.set('Error al cargar las reservas');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.error-state')).toBeTruthy();
  });

  it('debería mostrar estado vacío cuando no hay reservas', () => {
    reservationService.reservations.set([]);
    reservationService.error.set(null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('debería mostrar el total de reservas', () => {
    reservationService.reservations.set(mockReservations);
    reservationService.totalReservations.set(2);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.table-footer')).toBeTruthy();
  });
});
