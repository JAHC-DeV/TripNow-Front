/**
 * Utilidades de formato
 * Funciones reutilizables para formatear datos
 */

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: '2-digit', month: '2-digit', day: '2-digit' };

  return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
}

/**
 * Obtiene el código de país en nombre legible
 */
export const COUNTRY_CODES: Record<string, string> = {
  'ES': 'España',
  'US': 'Estados Unidos',
  'FR': 'Francia',
  'DE': 'Alemania',
  'IT': 'Italia',
  'PT': 'Portugal',
  'MX': 'México',
  'AR': 'Argentina',
  'BR': 'Brasil',
  'CO': 'Colombia'
};

export function getCountryName(code: string): string {
  return COUNTRY_CODES[code.toUpperCase()] || code;
}
