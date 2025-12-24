import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UuidService } from '@app/core/services/uuid.service';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TripNow-Front');

  constructor(readonly uuidService: UuidService) {}
}
