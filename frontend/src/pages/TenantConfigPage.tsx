import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  asRecord,
  initialGeral,
  initialSeguranca,
  TenantConfigLoading,
  TenantConfigSidebar,
  TenantGeralTab,
  TenantSegurancaTab,
  type ConfigTab,
  type GeralForm,
  type SegurancaForm,
} from '../components/tenantConfig'
import { authService, configService, tenantService, uploadService } from '../services'
import type { ConfigSettingsObject } from '../types'
import { consultarCepViaReceitaWs, consultarCnpjViaBrasilApi } from '../utils'

export function TenantConfigPage() {
  const [tab, setTab] = useState<ConfigTab>('geral')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingGeral, setIsSavingGeral] = useState(false)
  const [isSavingSeguranca, setIsSavingSeguranca] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingCert, setIsUploadingCert] = useState(false)
  const [isCepLookupLoading, setIsCepLookupLoading] = useState(false)
  const [isCnpjLookupLoading, setIsCnpjLookupLoading] = useState(false)
  const [tenantId, setTenantId] = useState<number | null>(null)
  const [settings, setSettings] = useState<ConfigSettingsObject>({})
  const [geral, setGeral] = useState<GeralForm>(initialGeral)
  const [seguranca, setSeguranca] = useState<SegurancaForm>(initialSeguranca)
  const lastCepLookupRef = useRef('')
  const lastCnpjLookupRef = useRef('')

  const resolvedTenantNome = useMemo(() => {
    if (geral.tipoPessoa === 'PJ') {
      return geral.pjNomeFantasia.trim() || geral.pjRazaoSocial.trim()
    }
    return geral.pfNome.trim()
  }, [geral])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const sessionTenantId = authService.getSession()?.tenantId
        if (!sessionTenantId) throw new Error('Tenant da sessão não encontrado.')

        const [tenantRes, configRes] = await Promise.all([
          tenantService.buscarTenantPorId(sessionTenantId),
          configService.buscarConfigPorTenant(sessionTenantId),
        ])

        if (cancelled) return

        const tenant = tenantRes.data
        const cfgSettings = asRecord(configRes.data?.settings)
        const tenantProfile = asRecord(cfgSettings.tenantProfile)
        const branding = asRecord(cfgSettings.branding)
        const logo = asRecord(branding.logo)
        const address = asRecord(tenantProfile.endereco)
        const signing = asRecord(cfgSettings.documentSigning)
        const a1 = asRecord(signing.a1Certificate)

        setTenantId(sessionTenantId)
        setSettings(cfgSettings as ConfigSettingsObject)
        setGeral({
          tipoPessoa: tenantProfile.tipoPessoa === 'PJ' ? 'PJ' : 'PF',
          logoUrl: String(logo.url ?? ''),
          logoKey: String(logo.key ?? ''),
          pfNome: String(tenantProfile.pfNome ?? tenant.nome ?? ''),
          pfCpf: String(tenantProfile.pfCpf ?? ''),
          pjRazaoSocial: String(tenantProfile.pjRazaoSocial ?? ''),
          pjNomeFantasia: String(tenantProfile.pjNomeFantasia ?? tenant.nome ?? ''),
          pjCnpj: String(tenantProfile.pjCnpj ?? ''),
          pjRepresentanteNome: String(tenantProfile.pjRepresentanteNome ?? ''),
          pjRepresentanteCpf: String(tenantProfile.pjRepresentanteCpf ?? ''),
          email: String(tenantProfile.email ?? ''),
          telefone: String(tenantProfile.telefone ?? ''),
          cep: String(address.cep ?? ''),
          endereco: String(address.endereco ?? ''),
          bairro: String(address.bairro ?? ''),
          cidade: String(address.cidade ?? ''),
          estado: String(address.estado ?? ''),
        })
        setSeguranca({
          certificadoA1Url: String(a1.url ?? ''),
          certificadoA1Key: String(a1.key ?? ''),
          certificadoSenha: String(a1.password ?? ''),
        })
      } catch {
        if (import.meta.env.DEV) toast.error('Não foi possível carregar as configurações.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogoUpload(file: File) {
    if (!tenantId) return
    setIsUploadingLogo(true)
    try {
      const res = await uploadService.enviarArquivo(file)
      const url = res.data?.url ?? ''
      const key = res.data?.key ?? ''
      setGeral((prev) => ({ ...prev, logoUrl: url, logoKey: key }))
      if (import.meta.env.DEV) toast.success('Logo enviada com sucesso.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível enviar a logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleCertUpload(file: File) {
    if (!tenantId) return
    setIsUploadingCert(true)
    try {
      const res = await uploadService.enviarArquivo(file)
      const url = res.data?.url ?? ''
      const key = res.data?.key ?? ''
      setSeguranca((prev) => ({ ...prev, certificadoA1Url: url, certificadoA1Key: key }))
      if (import.meta.env.DEV) toast.success('Certificado A1 enviado com sucesso.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível enviar o certificado.')
    } finally {
      setIsUploadingCert(false)
    }
  }

  async function salvarDadosGerais() {
    if (!tenantId) return
    setIsSavingGeral(true)
    try {
      const tenantProfile = {
        tipoPessoa: geral.tipoPessoa,
        pfNome: geral.pfNome,
        pfCpf: geral.pfCpf,
        pjRazaoSocial: geral.pjRazaoSocial,
        pjNomeFantasia: geral.pjNomeFantasia,
        pjCnpj: geral.pjCnpj,
        pjRepresentanteNome: geral.pjRepresentanteNome,
        pjRepresentanteCpf: geral.pjRepresentanteCpf,
        email: geral.email.trim(),
        telefone: geral.telefone.trim(),
        endereco: {
          cep: geral.cep,
          endereco: geral.endereco,
          bairro: geral.bairro,
          cidade: geral.cidade,
          estado: geral.estado,
        },
      }
      const branding = {
        logo: {
          url: geral.logoUrl,
          key: geral.logoKey,
        },
      }

      const nextSettings: ConfigSettingsObject = {
        ...settings,
        tenantProfile,
        branding,
      }

      if (resolvedTenantNome) {
        await tenantService.atualizarTenant(tenantId, { nome: resolvedTenantNome })
      }
      const res = await configService.atualizarConfigDoTenant(tenantId, { settings: nextSettings })
      const persisted = asRecord(res.data?.settings) as ConfigSettingsObject
      setSettings(persisted)
      if (import.meta.env.DEV) toast.success('Dados gerais salvos com sucesso.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível salvar os dados gerais.')
    } finally {
      setIsSavingGeral(false)
    }
  }

  async function salvarSeguranca() {
    if (!tenantId) return
    setIsSavingSeguranca(true)
    try {
      const documentSigning = {
        a1Certificate: {
          url: seguranca.certificadoA1Url,
          key: seguranca.certificadoA1Key,
          password: seguranca.certificadoSenha,
        },
      }

      const nextSettings: ConfigSettingsObject = {
        ...settings,
        documentSigning,
      }

      const res = await configService.atualizarConfigDoTenant(tenantId, { settings: nextSettings })
      const persisted = asRecord(res.data?.settings) as ConfigSettingsObject
      setSettings(persisted)
      if (import.meta.env.DEV) toast.success('Configurações de segurança salvas.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível salvar configurações de segurança.')
    } finally {
      setIsSavingSeguranca(false)
    }
  }

  async function handleCepLookup(unmaskedCep: string) {
    if (unmaskedCep.length !== 8) return
    if (unmaskedCep === lastCepLookupRef.current) return

    lastCepLookupRef.current = unmaskedCep
    setIsCepLookupLoading(true)
    try {
      const cepData = await consultarCepViaReceitaWs(unmaskedCep)
      setGeral((prev) => ({
        ...prev,
        cep: prev.cep || unmaskedCep,
        endereco: cepData.endereco || prev.endereco,
        bairro: cepData.bairro || prev.bairro,
        cidade: cepData.cidade || prev.cidade,
        estado: cepData.estado || prev.estado,
      }))
      if (import.meta.env.DEV) toast.success('Endereço carregado pelo CEP.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível consultar o CEP.')
    } finally {
      setIsCepLookupLoading(false)
    }
  }

  async function handleCnpjLookup(unmaskedCnpj: string) {
    if (unmaskedCnpj.length !== 14) return
    if (unmaskedCnpj === lastCnpjLookupRef.current) return

    lastCnpjLookupRef.current = unmaskedCnpj
    setIsCnpjLookupLoading(true)
    try {
      const cnpjData = await consultarCnpjViaBrasilApi(unmaskedCnpj)
      setGeral((prev) => ({
        ...prev,
        pjRazaoSocial: cnpjData.razaoSocial || prev.pjRazaoSocial,
        pjNomeFantasia: cnpjData.nomeFantasia || prev.pjNomeFantasia,
        pjRepresentanteNome: cnpjData.representanteNome || prev.pjRepresentanteNome,
        cep: cnpjData.cep || prev.cep,
        endereco: cnpjData.endereco || prev.endereco,
        bairro: cnpjData.bairro || prev.bairro,
        cidade: cnpjData.cidade || prev.cidade,
        estado: cnpjData.estado || prev.estado,
      }))
      if (import.meta.env.DEV) toast.success('Dados da empresa carregados pelo CNPJ.')
    } catch {
      if (import.meta.env.DEV) toast.error('Não foi possível consultar o CNPJ.')
    } finally {
      setIsCnpjLookupLoading(false)
    }
  }

  if (isLoading) {
    return <TenantConfigLoading />
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <TenantConfigSidebar activeTab={tab} onTabChange={setTab} />

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
          {tab === 'geral' ? (
            <TenantGeralTab
              geral={geral}
              setGeral={setGeral}
              isUploadingLogo={isUploadingLogo}
              onLogoFileSelect={handleLogoUpload}
              onLogoRemove={() => setGeral((prev) => ({ ...prev, logoUrl: '', logoKey: '' }))}
              isCepLookupLoading={isCepLookupLoading}
              isCnpjLookupLoading={isCnpjLookupLoading}
              onCepAccept={(_masked, unmasked) => {
                void handleCepLookup(unmasked)
              }}
              onCnpjAccept={(_masked, unmasked) => {
                void handleCnpjLookup(unmasked)
              }}
              onSave={() => void salvarDadosGerais()}
              isSaving={isSavingGeral}
            />
          ) : (
            <TenantSegurancaTab
              seguranca={seguranca}
              setSeguranca={setSeguranca}
              isUploadingCert={isUploadingCert}
              onCertFileSelect={handleCertUpload}
              onSave={() => void salvarSeguranca()}
              isSaving={isSavingSeguranca}
            />
          )}
        </div>
      </div>
    </section>
  )
}
