import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservationService } from '@app/core/services/reservation.service';
import { ThemeService } from '@app/core/services/theme.service';
import { UuidService } from '@app/core/services/uuid.service';
import { Reservation, CreateReservationRequest, ReservationStatus } from '@app/shared/models/reservation.model';
import { environment } from '@app/environments/environment';

/**
 * Tests de integración del flujo principal de la aplicación
 * Prueba el ciclo completo: cargar, crear, actualizar reservas
 */
describe('Flujo Principal de Reservas - Integración', () => {
  let reservationService: ReservationService;
  let themeService: ThemeService;
  let uuidService: UuidService;
  let httpMock: HttpTestingController;

  const mockReservations: Reservation[] = [
    {
      id: 1,
      customerEmail: 'user1@example.com',
      tripCountry: 'ES',
      amount: 2,
      status: ReservationStatus.PENDING_RISK_CHECK,
      riskScore: 30.5,
      createdAt: new Date(),
      idempotencyKey: 'test-uuid',
      updatedAt: new Date()
    }
  ];

  const newReservationRequest: CreateReservationRequest = {
    customerEmail: 'newuser@example.com',
    tripCountry: 'FR',
    amount: 3,
    idempotencyKey: ''
  };

  const newReservationResponse: Reservation = {
    id: 2,
    customerEmail: 'newuser@example.com',
    tripCountry: 'FR',
    amount: 3,
    status: ReservationStatus.PENDING_RISK_CHECK,
    riskScore: 50.0,
    createdAt: new Date(),
    idempotencyKey: 'test-uuid',
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservationService, ThemeService, UuidService]
    });

    reservationService = TestBed.inject(ReservationService);
    themeService = TestBed.inject(ThemeService);
    uuidService = TestBed.inject(UuidService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Flujo 1: Cargar reservas existentes', () => {
    it('debería cargar correctamente la lista inicial de reservas', (done) => {
      // Acción
      reservationService.fetchTrips();

      // Verificar que se hizo la petición
      const req = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      req.flush(mockReservations);

      // Verificar resultado
      setTimeout(() => {
        expect(reservationService.reservations()).toEqual(mockReservations);
        expect(reservationService.totalReservations()).toBe(1);
        expect(reservationService.error()).toBeNull();
        expect(reservationService.loading()).toBeFalsy();
        done();
      }, 0);
    });

    it('debería mostrar mensaje cuando no existen reservas', (done) => {
      reservationService.fetchTrips();

      const req = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      req.flush([]);

      setTimeout(() => {
        expect(reservationService.reservations()).toEqual([]);
        expect(reservationService.error()).toBe('No existen reservas aún');
        done();
      }, 0);
    });
  });

  describe('Flujo 2: Crear nueva reserva y ver en lista', () => {
    it('debería crear reserva y recargar la lista automáticamente', (done) => {
      // Paso 1: Crear reserva
      reservationService.createReservation(newReservationRequest);

      // Paso 2: Verificar petición POST
      const createReq = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
      expect(createReq.request.method).toBe('POST');
      expect(createReq.request.body.idempotencyKey).toBeTruthy();
      createReq.flush(newReservationResponse);

      // Paso 3: Esperar que se recargue la lista
      const fetchReq = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      expect(fetchReq.request.method).toBe('GET');

      const allReservations = [...mockReservations, newReservationResponse];
      fetchReq.flush(allReservations);

      // Paso 4: Verificar estado final
      setTimeout(() => {
        expect(reservationService.reservations().length).toBe(2);
        expect(reservationService.totalReservations()).toBe(2);
        expect(reservationService.reservations()[1]).toEqual(newReservationResponse);
        done();
      }, 0);
    });

    it('debería incluir UUID en la petición de creación', (done) => {
      const uuid = uuidService.getUuid();
      reservationService.createReservation(newReservationRequest);

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
      expect(req.request.body.idempotencyKey).toBe(uuid);
      req.flush(newReservationResponse);

      httpMock.expectOne(req => req.url.includes('by-idempotency-key')).flush([]);
      done();
    });
  });

  describe('Flujo 3: Obtener y actualizar reserva', () => {
    it('debería obtener una reserva y actualizar la lista', (done) => {
      // Inicializar lista
      reservationService.reservations.set(mockReservations);

      // Actualizar estado de la reserva
      const updatedReservation = { ...mockReservations[0], status: ReservationStatus.APPROVED };

      reservationService.getById(1).subscribe({
        next: (reservation) => {
          expect(reservation).toEqual(updatedReservation);
          setTimeout(() => {
            expect(reservationService.reservations()[0].status).toBe(ReservationStatus.APPROVED);
            done();
          }, 0);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/1`);
      req.flush(updatedReservation);
    });
  });

  describe('Flujo 4: Alternar tema', () => {
    it('debería cambiar el tema y persistir', () => {
      const initialMode = themeService.isDarkMode();

      // Cambiar tema
      themeService.toggleTheme();
      expect(themeService.isDarkMode()).toBe(!initialMode);

      // Verificar persistencia
      const storedTheme = localStorage.getItem('theme');
      expect(storedTheme).toBe(themeService.isDarkMode() ? 'dark' : 'light');

      // Cambiar nuevamente
      themeService.toggleTheme();
      expect(themeService.isDarkMode()).toBe(initialMode);
    });
  });

  describe('Flujo 5: Manejo de errores completo', () => {
    it('debería manejar error 404 y mostrar mensaje amigable', (done) => {
      reservationService.fetchTrips();

      const req = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      req.flush(null, { status: 404, statusText: 'Not Found' });

      setTimeout(() => {
        expect(reservationService.error()).toBe('No existen reservas aún');
        expect(reservationService.loading()).toBeFalsy();
        done();
      }, 0);
    });

    it('debería manejar error de servidor correctamente', (done) => {
      reservationService.fetchTrips();

      const req = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      req.flush(null, { status: 500, statusText: 'Server Error' });

      setTimeout(() => {
        expect(reservationService.error()).toBe('Error al cargar las reservas');
        expect(reservationService.reservations()).toEqual([]);
        done();
      }, 0);
    });

    it('debería manejar error en creación y mostrar mensaje', (done) => {
      reservationService.createReservation(newReservationRequest);

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
      req.flush(null, { status: 400, statusText: 'Bad Request' });

      setTimeout(() => {
        expect(reservationService.error()).toBe('Error al crear la reserva');
        expect(reservationService.loading()).toBeFalsy();
        done();
      }, 0);
    });
  });

  describe('Flujo 6: UUID consistente', () => {
    it('debería usar el mismo UUID en todas las peticiones', (done) => {
      const uuid = uuidService.getUuid();

      // Primera petición
      reservationService.fetchTrips();
      const fetchReq1 = httpMock.expectOne(req =>
        req.url.includes(`/Reservations/by-idempotency-key/${uuid}`)
      );
      fetchReq1.flush(mockReservations);

      // Segunda petición
      setTimeout(() => {
        reservationService.fetchTrips();
        const fetchReq2 = httpMock.expectOne(req =>
          req.url.includes(`/Reservations/by-idempotency-key/${uuid}`)
        );
        fetchReq2.flush(mockReservations);

        // Crear reserva
        reservationService.createReservation(newReservationRequest);
        const createReq = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
        expect(createReq.request.body.idempotencyKey).toBe(uuid);
        createReq.flush(newReservationResponse);

        done();
      }, 0);
    });
  });

  describe('Flujo 7: Ciclo completo de sesión', () => {
    it('debería ejecutar un ciclo completo: cargar -> crear -> recargar', (done) => {
      // 1. Cargar reservas iniciales
      reservationService.fetchTrips();
      let fetchReq = httpMock.expectOne(req =>
        req.url.includes('/Reservations/by-idempotency-key/')
      );
      fetchReq.flush(mockReservations);

      setTimeout(() => {
        expect(reservationService.totalReservations()).toBe(1);

        // 2. Crear nueva reserva
        reservationService.createReservation(newReservationRequest);
        const createReq = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
        createReq.flush(newReservationResponse);

        // 3. Recargar lista
        fetchReq = httpMock.expectOne(req =>
          req.url.includes('/Reservations/by-idempotency-key/')
        );
        const allReservations = [...mockReservations, newReservationResponse];
        fetchReq.flush(allReservations);

        setTimeout(() => {
          expect(reservationService.totalReservations()).toBe(2);
          expect(reservationService.error()).toBeNull();
          done();
        }, 0);
      }, 0);
    });
  });
});
