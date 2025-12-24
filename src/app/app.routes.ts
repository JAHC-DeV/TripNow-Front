import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/trips/reservation-list.component').then((c) => c.ReservationListComponent),
  },
];
