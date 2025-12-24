import { TestBed } from '@angular/core/testing';
import { UuidService } from './uuid.service';

describe('UuidService', () => {
  let service: UuidService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UuidService]
    });
    service = TestBed.inject(UuidService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería generar un UUID al inicializar si no existe', () => {
    const uuid = service.getUuid();
    expect(uuid).toBeTruthy();
    expect(uuid.length).toBe(36); // formato UUID v4
  });

  it('debería guardar el UUID en localStorage', () => {
    const uuid = service.getUuid();
    const storedUuid = localStorage.getItem('app-uuid');
    expect(storedUuid).toBe(uuid);
  });

  it('debería reutilizar el UUID existente', () => {
    const firstUuid = service.getUuid();
    const service2 = new UuidService();
    const secondUuid = service2.getUuid();
    expect(firstUuid).toBe(secondUuid);
  });

  it('debería generar UUIDs únicos en diferentes instancias sin localStorage', () => {
    localStorage.clear();
    const service1 = new UuidService();
    localStorage.clear();
    const service2 = new UuidService();
    expect(service1.getUuid()).not.toBe(service2.getUuid());
  });

  it('el UUID generado debe tener formato válido', () => {
    const uuid = service.getUuid();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuid)).toBeTruthy();
  });
});
