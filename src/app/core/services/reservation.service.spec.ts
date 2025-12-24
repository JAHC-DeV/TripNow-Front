import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import { UuidService } from './uuid.service';
import { Reservation, ReservationStatus } from '@app/shared/models/reservation.model';
import { environment } from '@app/environments/environment';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;
  let uuidService: UuidService;

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
      updatedAt: new Date()
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
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservationService, UuidService]
    });
    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
    uuidService = TestBed.inject(UuidService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchTrips', () => {
    it('debería cargar las reservas correctamente', (done) => {
      service.fetchTrips();
      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/by-idempotency-key/${uuidService.getUuid()}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReservations);

      setTimeout(() => {
        expect(service.reservations()).toEqual(mockReservations);
        expect(service.totalReservations()).toBe(2);
        expect(service.error()).toBeNull();
        done();
      }, 0);
    });

    it('debería mostrar error cuando el arreglo está vacío', (done) => {
      service.fetchTrips();
      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/by-idempotency-key/${uuidService.getUuid()}`);
      req.flush([]);

      setTimeout(() => {
        expect(service.reservations()).toEqual([]);
        expect(service.totalReservations()).toBe(0);
        expect(service.error()).toBe('No existen reservas aún');
        done();
      }, 0);
    });

    it('debería mostrar error en caso de 404', (done) => {
      service.fetchTrips();
      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/by-idempotency-key/${uuidService.getUuid()}`);
      req.flush(null, { status: 404, statusText: 'Not Found' });

      setTimeout(() => {
        expect(service.error()).toBe('No existen reservas aún');
        expect(service.reservations()).toEqual([]);
        done();
      }, 0);
    });

    it('debería manejar otros errores HTTP', (done) => {
      service.fetchTrips();
      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/by-idempotency-key/${uuidService.getUuid()}`);
      req.flush(null, { status: 500, statusText: 'Server Error' });

      setTimeout(() => {
        expect(service.error()).toBe('Error al cargar las reservas');
        done();
      }, 0);
    });

    it('debería establecer loading en true durante la petición', (done) => {
      expect(service.loading()).toBeFalsy();
      service.fetchTrips();
      expect(service.loading()).toBeTruthy();

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/by-idempotency-key/${uuidService.getUuid()}`);
      req.flush(mockReservations);

      setTimeout(() => {
        expect(service.loading()).toBeFalsy();
        done();
      }, 0);
    });
  });

  describe('createReservation', () => {
    it('debería crear una nueva reserva y recargar el listado', (done) => {
      const newReservation = {
        customerEmail: 'new@example.com',
        tripCountry: 'IT',
        amount: 1,
        idempotencyKey: ''
      };

      service.createReservation(newReservation);

      const createReq = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
      expect(createReq.request.method).toBe('POST');
      expect(createReq.request.body.idempotencyKey).toBeTruthy();
      createReq.flush(mockReservations[0]);

      const fetchReq = httpMock.expectOne(req => req.url.includes('Reservations/by-idempotency-key'));
      fetchReq.flush(mockReservations);

      setTimeout(() => {
        expect(service.reservations()).toEqual(mockReservations);
        done();
      }, 0);
    });

    it('debería manejar errores en la creación', (done) => {
      const newReservation = {
        customerEmail: 'new@example.com',
        tripCountry: 'IT',
        amount: 1,
        idempotencyKey: ''
      };

      service.createReservation(newReservation);

      const createReq = httpMock.expectOne(`${environment.apiUrl}/Reservations/create`);
      createReq.flush(null, { status: 400, statusText: 'Bad Request' });

      setTimeout(() => {
        expect(service.error()).toBe('Error al crear la reserva');
        done();
      }, 0);
    });
  });

  describe('getById', () => {
    it('debería obtener una reserva por ID y devolverla en Observable', (done) => {
      service.getById(1).subscribe({
        next: (reservation) => {
          expect(reservation).toEqual(mockReservations[0]);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReservations[0]);
    });

    it('debería actualizar la reserva en la lista si existe', (done) => {
      service.reservations.set(mockReservations);

      const updatedReservation = { ...mockReservations[0], amount: 5 };
      service.getById(1).subscribe({
        next: () => {
          setTimeout(() => {
            expect(service.reservations()[0].amount).toBe(5);
            done();
          }, 0);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/1`);
      req.flush(updatedReservation);
    });

    it('debería manejar errores en getById', (done) => {
      service.getById(999).subscribe({
        error: (error) => {
          expect(service.error()).toBe('Error al obtener la reserva');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/Reservations/999`);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('clearState', () => {
    it('debería limpiar el estado del servicio', () => {
      service.reservations.set(mockReservations);
      service.totalReservations.set(2);
      service.error.set('Error de prueba');

      service.clearState();

      expect(service.reservations()).toEqual([]);
      expect(service.totalReservations()).toBe(0);
      expect(service.error()).toBeNull();
    });
  });
});
