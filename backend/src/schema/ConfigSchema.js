import { z } from 'zod';

/** Valores arbitrários em JSON (JSONB) — chaves string, valores livres. */
const settingsValue = z.any();

/**
 * Atualização de configurações do tenant.
 * Aceita `{ settings: { ... } }` (recomendado) ou um objeto plano mesclado em `settings` (compatível com ConfigService).
 */
export const updateConfigSchema = z.union([
  z.object({
    settings: z.record(z.string(), settingsValue),
  }),
  z.record(z.string(), settingsValue),
]);
