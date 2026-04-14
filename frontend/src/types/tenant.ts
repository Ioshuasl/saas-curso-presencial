import type { Config } from './config'

export type Tenant = {
  id: number
  nome: string
  slug?: string | null
  ativo: boolean
  total_admins?: number
  has_admin?: boolean
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
  admin: {
    username: string
    email: string
    cpf?: string
    senha: string
    nome_completo: string
    status?: boolean
  }
}

export type UpdateTenantRequest = Partial<Omit<CreateTenantRequest, 'admin'>>

export type CreateFirstTenantAdminRequest = {
  username: string
  email: string
  cpf?: string
  senha: string
  nome_completo: string
  status?: boolean
}

export type TenantListResponse = {
  data: Tenant[]
  paginacao: {
    total: number
    total_paginas: number
    pagina: number
    por_pagina: number
  }
}
