import { api } from './api'
import type {
  Config,
  CreateTenantRequest,
  Tenant,
  TenantListQuery,
  TenantListResponse,
  UpdateConfigRequest,
  UpdateTenantRequest,
} from '../types'

export const tenantService = {
  criarTenant(payload: CreateTenantRequest) {
    return api.post<Tenant>('/tenants', payload)
  },

  listarTenants(params?: TenantListQuery) {
    return api.get<TenantListResponse>('/tenants', { params })
  },

  buscarTenantPorId(id: number) {
    return api.get<Tenant>(`/tenants/${id}`)
  },

  atualizarTenant(id: number, payload: UpdateTenantRequest) {
    return api.put<Tenant>(`/tenants/${id}`, payload)
  },

  deletarTenant(id: number) {
    return api.delete<void>(`/tenants/${id}`)
  },

  buscarConfigPorTenant(tenantId: number) {
    return api.get<Config>(`/tenants/${tenantId}/config`)
  },

  atualizarConfigDoTenant(tenantId: number, payload: UpdateConfigRequest) {
    return api.patch<Config>(`/tenants/${tenantId}/config`, payload)
  },
}

