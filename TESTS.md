# Tests - TripNow Frontend

## Descripción

Este proyecto incluye tests unitarios e integración para garantizar la calidad del código:

### Tests Unitarios
- **UuidService**: Generación y persistencia de UUID
- **ReservationService**: Operaciones CRUD de reservas
- **ThemeService**: Gestión de tema claro/oscuro
- **TripsListComponent**: Interacción y visualización

### Tests de Integración
- **Flujo principal**: Cargar → Crear → Recargar reservas
- **Manejo de errores**: 404, 500, validaciones
- **UUID consistente**: Mismo ID en todas las peticiones
- **Ciclo completo de sesión**: Operaciones en cadena

## Ejecución

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (watch mode)
```bash
npm test -- --watch
```

### Ejecutar tests de un archivo específico
```bash
npm test -- --include='**/reservation.service.spec.ts'
```

### Generar reporte de cobertura
```bash
npm test -- --code-coverage
```

El reporte de cobertura estará en: `coverage/`

### Ejecutar tests una sola vez (CI mode)
```bash
npm test -- --watch=false
```

## Estructura de Tests

```
src/
├── app/
│   ├── core/services/
│   │   ├── uuid.service.spec.ts          // Tests unitarios
│   │   ├── reservation.service.spec.ts   // Tests unitarios + mocks HTTP
│   │   └── theme.service.spec.ts         // Tests unitarios
│   └── features/trips/
│       ├── trips-list.component.spec.ts    // Tests unitarios componente
│       └── trips-list.integration.spec.ts  // Tests integración (flujo completo)
```

## Casos de Prueba

### UuidService (6 tests)
- ✅ Generación de UUID válido
- ✅ Persistencia en localStorage
- ✅ Reutilización de UUID existente
- ✅ Formato UUID v4 correcto

### ReservationService (10 tests)
- ✅ Cargar reservas exitosamente
- ✅ Manejo de arreglo vacío
- ✅ Error 404
- ✅ Crear nueva reserva
- ✅ Obtener reserva por ID
- ✅ Actualizar reserva en lista

### ThemeService (7 tests)
- ✅ Cargar tema del localStorage
- ✅ Alternar tema
- ✅ Persistencia en localStorage
- ✅ Aplicación de clases CSS

### TripsListComponent (12 tests)
- ✅ Cargar reservas al inicializar
- ✅ Recargar cada 20 segundos
- ✅ Abrir/cerrar modal
- ✅ Alternar tema
- ✅ Estados: carga, error, vacío
- ✅ Clasificación de riesgo

### Integración (7 flujos)
1. **Cargar reservas existentes**
   - Lista inicial
   - Mensaje "No existen aún"

2. **Crear nueva reserva**
   - POST → recargar lista
   - UUID incluido en petición

3. **Obtener y actualizar**
   - Obtener por ID
   - Actualizar en lista

4. **Tema**
   - Cambiar y persistir
   - Verificar localStorage

5. **Manejo de errores**
   - 404, 500, validaciones
   - Mensajes amigables

6. **UUID consistente**
   - Mismo UUID en todas las peticiones

7. **Ciclo completo**
   - Cargar → Crear → Recargar

## Cobertura de Tests

Se espera alcanzar:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Utilidades Usadas

- **Jasmine**: Framework de testing
- **Karma**: Test runner
- **HttpClientTestingModule**: Mock de HTTP
- **TestBed**: Inyección de dependencias en tests
- **fakeAsync/tick**: Control de tiempo en tests asíncronos

## Ejemplos de Uso

### Test básico unitario
```typescript
it('debería crear el servicio', () => {
  expect(service).toBeTruthy();
});
```

### Test con HTTP mock
```typescript
it('debería cargar reservas', (done) => {
  service.fetchTrips();
  const req = httpMock.expectOne('url');
  req.flush(mockData);
  
  setTimeout(() => {
    expect(service.reservations()).toEqual(mockData);
    done();
  }, 0);
});
```

### Test asincrónico con fakeAsync
```typescript
it('debería recargar cada 20s', fakeAsync(() => {
  spyOn(service, 'fetchTrips');
  component.ngOnInit();
  tick(20000);
  expect(service.fetchTrips).toHaveBeenCalledTimes(2);
}));
```

## Debugging de Tests

### Ver logs en consola
```bash
npm test -- --browsers=Chrome
```

### Pausar en breakpoints
- Abre Chrome DevTools (F12)
- Ve a la pestaña "Sources"
- Los breakpoints funcionarán automáticamente

### Ejecutar un test específico
```typescript
fit('debería hacer algo', () => {
  // Solo este test se ejecutará
});
```

### Saltar un test
```typescript
xit('debería hacer algo', () => {
  // Este test se ignorará
});
```

## Mejores Prácticas

1. **Tests unitarios** para lógica aislada
2. **Tests integración** para flujos completos
3. **Mocks y spies** para dependencias externas
4. **Nombres descriptivos** para los tests
5. **Arrange-Act-Assert** (AAA) en estructura
6. **Limpiar state** en beforeEach/afterEach
7. **No depender** del orden de tests

## Troubleshooting

### "Chrome is not installed"
```bash
npm test -- --browsers=ChromeHeadless
```

### "Timeout waiting for message"
Aumentar timeout en karma.conf.js:
```javascript
browserDisconnectTimeout: 10000,
browserNoActivityTimeout: 60000
```

### Tests fallan aleatoriamente
- Verificar variables globales
- Limpiar localStorage/sessionStorage
- Evitar esperas fijas (usar fakeAsync)

## CI/CD Integration

Para integrar con GitHub Actions:
```yaml
- name: Run Tests
  run: npm test -- --watch=false --code-coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

**Última actualización**: 23 de Diciembre de 2025
