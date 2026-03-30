import { api } from './api'
import type { Config, UpdateConfigRequest } from '../types'

export const configService = {
  buscarConfigPorTenant(tenantId: number) {
    return api.get<Config>(`/tenants/${tenantId}/config`)
  },

  atualizarConfigDoTenant(tenantId: number, payload: UpdateConfigRequest) {
    return api.patch<Config>(`/tenants/${tenantId}/config`, payload)
  },
}

