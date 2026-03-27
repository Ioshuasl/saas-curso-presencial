export type Tenant = {
  id: number
  nome: string
  slug?: string | null
  ativo: boolean
  created_at?: string
  updated_at?: string
  config?: Config | null
}

export type TenantScopedQuery = {
  tenant_id?: number
  tenant_slug?: string
}

export type TenantListQuery = {
  page?: number
  limit?: number
  nome?: string
  ativo?: boolean | string
  sort?: 'id' | 'nome' | 'slug' | 'ativo' | 'created_at'
  order?: 'ASC' | 'DESC'
}

export type CreateTenantRequest = {
  nome: string
  slug?: string
  ativo?: boolean
}

export type UpdateTenantRequest = Partial<CreateTenantRequest>

export type TenantListResponse = {
  data: Tenant[]
  paginacao: {
    total: number
    total_paginas: number
    pagina: number
    por_pagina: number
  }
}

export type Config = {
  id: number
  tenant_id: number
  settings: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type UpdateConfigRequest = {
  settings?: Record<string, unknown>
} & Record<string, unknown>

