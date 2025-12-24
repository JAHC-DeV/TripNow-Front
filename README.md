# 🌍 TripNow - Frontend

**TripNow** es una aplicación web moderna para la gestión de reservas de viajes, construida con **Angular 20** y diseñada con patrones de arquitectura limpia, reactividad con Signals y una UI moderna y responsive.

**[Documentación de Tests →](./TESTS.md)**

---

## 📋 Tabla de Contenidos

- [Quick Start](#quick-start)
- [Levantar el Sistema](#levantar-el-sistema)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Ejecutar Tests](#ejecutar-tests)
- [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🚀 Quick Start

### Requisitos Previos
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Angular CLI** >= 20.3.8 (global: `npm install -g @angular/cli`)

### Setup Inicial

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd TripNow-Front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Editar: src/app/environments/environment.ts
# Verificar: apiUrl apunta al backend correcto

# 4. Levantar servidor de desarrollo
npm start

# Abrir: http://localhost:4200
```

---

## 🐳 Levantar el Sistema

### Opción 1: Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Acceder a la aplicación
# http://localhost:4200
```

**docker-compose.yml:**
```yaml
services:
  tripnow-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4200:4200"
    environment:
      - API_URL=http://tripnow-backend:5000/api
    volumes:
      - ./src:/app/src
```

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4200
CMD ["npm", "start"]
```

### Opción 2: Desarrollo Local

```bash
# Terminal 1: Iniciar servidor de desarrollo
npm start

# Terminal 2: Ejecutar tests en watch mode
npm test -- --watch
```

### Opción 3: Build Producción

```bash
# Build optimizado
npm run build

# Servir con http-server
npx http-server dist/tripnow-front/browser -p 4200
```

---

## 🔌 Endpoints Disponibles

### Base URL
- **Development**: `http://localhost:5213/api`

### Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/Reservations/by-idempotency-key/{uuid}` | Obtener reservas del usuario |
| `GET` | `/Reservations/{id}` | Obtener reserva por ID |
| `POST` | `/Reservations/create` | Crear nueva reserva |

### Estructura de Request/Response

**POST /Reservations/create**
```json
{
  "customerEmail": "user@example.com",
  "tripCountry": "ES",
  "amount": 2,
  "idempotencyKey": "uuid-string"
}
```

**Response (Success 200)**
```json
{
  "id": 1,
  "customerEmail": "user@example.com",
  "tripCountry": "ES",
  "amount": 2,
  "status": 0,
  "riskScore": 25.5,
  "createdAt": "2025-12-23T01:13:14Z",
  "idempotencyKey": "uuid-string"
}
```

**GET /Reservations/by-idempotency-key/{uuid}**
```json
[
  {
    "id": 1,
    "customerEmail": "user@example.com",
    "tripCountry": "ES",
    "amount": 2,
    "status": 0,
    "riskScore": 25.5,
    "createdAt": "2025-12-23T01:13:14Z",
    "idempotencyKey": "uuid-string"
  }
]
```

### Códigos de Respuesta
- `200 OK`: Operación exitosa
- `400 Bad Request`: Datos inválidos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error en servidor

---

## 🎨 Decisiones de Diseño

### 1. **Signals en lugar de Subjects/BehaviorSubject**

**Decisión:** Usar Angular Signals (v20) para reactividad.

**Razones:**
- ✅ Mejor performance (change detection granular)
- ✅ API más simple y legible
- ✅ Integración nativa con Angular 20
- ✅ Mejor DevX (debugging)

### 2. **Patrón Repository en Servicios**

**Decisión:** Un único servicio (ReservationService) como fuente de verdad.

**Beneficios:**
- ✅ Single Responsibility
- ✅ Fácil de mockear en tests
- ✅ Centralización de lógica HTTP

```typescript
// ✅ Inyección única
constructor(private reservationService: ReservationService) {}

// ❌ Evitar
constructor(private http: HttpClient) {} // Directo en componentes
```

### 3. **UUID Persistente en localStorage**

**Decisión:** Generar UUID v4 al primer acceso y persistir en localStorage.

**Razones:**
- ✅ Idempotencia en operaciones
- ✅ Trazabilidad de usuario
- ✅ Evita creación duplicada de reservas

**UUID usado en:**
- `GET /Reservations/by-idempotency-key/{uuid}` ← Obtener reservas del usuario
- `POST /Reservations/create` con `idempotencyKey` ← Evitar duplicados

### 4. **Componentes Standalone**

**Decisión:** Todos los componentes son standalone (sin módulos).

**Ventajas:**
- ✅ Mejor tree-shaking
- ✅ Menor bundle size
- ✅ Configuración más simple

```typescript
@Component({
  selector: 'app-reservation-list',
  standalone: true,  // ✅ Sin NgModule
  imports: [CommonModule, CreateReservationModalComponent]
})
```

### 5. **Auto-refresh cada 20 segundos**

**Decisión:** Polling automático con `interval()` y `takeUntilDestroyed()`.

**Razones:**
- ✅ Mantiene datos frescos
- ✅ Detección automática de cambios
- ✅ Limpieza automática (no memory leaks)

**Trade-off:**
- ❌ Más tráfico de red
- ✅ Alternativa: WebSockets (implementable después)

### 6. **UI Modern y Responsive**

**Decisión:** Glassmorphism + Gradients + Animaciones suaves.

**Breakpoints:**
- `> 1024px`: Escritorio (tabla normal)
- `768px - 1024px`: Tablet
- `< 768px`: Mobile (cards layout)

**Componentes:**
- FAB (Floating Action Button) siempre visible
- Header con gradiente animado
- Transiciones suave (cubic-bezier)

### 7. **Manejo de Errores Amigable**

**Decisión:** Mensajes específicos según tipo de error.

```typescript
if (err.status === 404) {
  this.errorSignal.set('No existen reservas aún');
} else if (err.status === 500) {
  this.errorSignal.set('Error al cargar las reservas');
}
```

### 8. **Testing Strategy**

**Decisión:**
- Tests unitarios para cada servicio/componente
- Tests integración para flujos completos
- Mocks HTTP con HttpClientTestingModule

**Cobertura objetivo:** > 80%

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── http-error.interceptor.ts
│   │   └── services/
│   │       ├── reservation.service.ts          ⭐ Lógica principal
│   │       ├── reservation.service.spec.ts│   │      
│   │       ├── uuid.service.ts                 (Idempotencia)
│   │       └── *.spec.ts                       (Tests)
│   ├── features/
│   │   └── trips/
│   │       ├── reservation-list.component.ts         ⭐ Componente principal
│   │       ├── reservation-list.component.html
│   │       ├── reservation-list.component.css
│   │       ├── reservation-list.component.spec.ts
│   │       ├── reservation-list.integration.spec.ts  (Tests integración)
│   │       └── components/
│   │           ├── create-trip-modal/
│   │           └── reservation-detail-modal/
│   ├── shared/
│   │   ├── models/
│   │   │   ├── reservation.model.ts
│   │   ├── mocks/
│   │   │   └── reservation.mock.ts
│   │   └── utils/
│   │       └── format.utils.ts
│   ├── environments/
│   │   ├── environment.ts                      (Development)
│   │   └── environment.prod.ts                 (Production)
│   ├── app.config.ts                           ⭐ Configuración raíz
│   ├── app.routes.ts
│   └── app.ts
├── index.html
├── main.ts
├── styles.css
│
├── package.json
├── angular.json
├── tsconfig.json
├── tsconfig.spec.json
├── README.md                                   (Este archivo)
└── TESTS.md                                    (Documentación tests)
```

**Archivos Importantes:**
- `⭐` = Punto de entrada o componentes clave

---

## 🧪 Ejecutar Tests

### Todas las opciones

```bash
# Tests unitarios + integración
npm test

# Watch mode (detecta cambios)
npm test -- --watch

# ChromeHeadless (sin UI)
npm test -- --browsers=ChromeHeadless

# Reporte de cobertura
npm test -- --code-coverage

# Archivo específico
npm test -- --include='**/reservation.service.spec.ts'

# CI mode (una sola ejecución)
npm test -- --watch=false
```

### Archivos de Test

| Archivo | Tests | Tipo |
|---------|-------|------|
| `uuid.service.spec.ts` | 6 | Unitarios |
| `reservation.service.spec.ts` | 10 | Unitarios |
| `theme.service.spec.ts` | 7 | Unitarios |
| `reservation-list.component.spec.ts` | 12 | Unitarios |
| `reservation-list.integration.spec.ts` | 7 flujos | Integración |

**Total:** 42 tests

→ Ver detalles en [TESTS.md](./TESTS.md)

---

## 💻 Guía de Desarrollo

### Crear nuevo componente

```bash
ng generate component features/trips/components/my-component
```

### Crear nuevo servicio

```bash
ng generate service core/services/my-service
```

### Agregar modelo

```bash
# En shared/models/my-model.ts
export interface MyModel {
  id: number;
  name: string;
}
```

### Usar Signals

```typescript
import { signal } from '@angular/core';

export class MyService {
  // Privado (writable)
  private mySignal = signal<string>('initial');

  // Público (readonly)
  readonly myValue = this.mySignal.asReadonly();

  // Actualizar
  updateValue(newValue: string) {
    this.mySignal.set(newValue);
  }

  // Componente
  @Component({...})
  export class MyComponent {
    constructor(private service: MyService) {}
    value = this.service.myValue;  // Automático change detection
  }
}
```

### Agregar test

```bash
# Crear archivo con .spec.ts
ng generate service core/services/my-service --with-tests
```

### Build para producción

```bash
# Optimizado y minificado
npm run build

# Output: dist/tripnow-front/
```

---

## 🌐 Variables de Entorno

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7218/api',
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tripnow.com/api',
};
```

**Usar en componentes:**
```typescript
import { environment } from '@app/environments/environment';

export class MyService {
  constructor(private http: HttpClient) {
    const apiUrl = environment.apiUrl;  // Dinámico según build
  }
}
```

---

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^20.3.0",
  "@angular/common": "^20.3.0",
  "@angular/forms": "^20.3.0",
  "@angular/platform-browser": "^20.3.0",
  "@angular/router": "^20.3.0",
  "rxjs": "~7.8.0"
}
```

### DevDependencies
```json
{
  "@angular/cli": "^20.3.8",
  "@angular/compiler-cli": "^20.3.0",
  "jasmine-core": "~5.9.0",
  "karma": "~6.4.0",
  "typescript": "~5.9.2"
}
```

---

## 🐛 Troubleshooting

### "Cannot find Chrome"
```bash
# Usar ChromeHeadless en lugar de Chrome
npm test -- --browsers=ChromeHeadless
```

### "Module not found"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### "CORS error en backend"
```typescript
// Verificar environment.apiUrl
// Backend debe permitir CORS desde http://localhost:4200
```

### "Port 4200 already in use"
```bash
# Usar puerto diferente
ng serve --port 4300
```

---

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# 1. Conectar repo en vercel.com
# 2. Deploy automático en push a main
```

### Docker
```bash
docker build -t tripnow-frontend .
docker run -p 4200:4200 tripnow-frontend
```

### Netlify
```bash
npm run build
# Drag & drop dist/ folder
```

---

## 📞 Contacto & Soporte

- **Documentación Tests**: [TESTS.md](./TESTS.md)
- **Angular Docs**: https://angular.io
- **Signals Guide**: https://angular.io/guide/signals

---

## 📄 Licencia

MIT License - © 2025 TripNow

---

**Última actualización:** 23 de Diciembre de 2025 | **Angular:** v20.3.0 | **Node:** ≥ 20.0.0

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
