// Simpele unieke-id-generator. Geen externe uuid-library nodig voor lokale, single-user opslag.
export function genereerId(): string {
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
