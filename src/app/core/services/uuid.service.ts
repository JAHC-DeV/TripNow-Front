import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UuidService {
  private readonly UUID_KEY = 'app-uuid';

  constructor() {
    this.initializeUuid();
  }

  /**
   * Inicializa el UUID en localStorage si no existe
   */
  private initializeUuid(): void {
    const existingUuid = localStorage.getItem(this.UUID_KEY);

    if (!existingUuid) {
      const newUuid = this.generateUuid();
      localStorage.setItem(this.UUID_KEY, newUuid);
    }
  }

  /**
   * Obtiene el UUID actual del localStorage
   */
  getUuid(): string {
    const uuid = localStorage.getItem(this.UUID_KEY);
    return uuid || '';
  }

  /**
   * Genera un nuevo UUID v4
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
