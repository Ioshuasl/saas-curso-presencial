import { Building2, FileKey2, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ImagePicker } from '../components/ui/ImagePicker'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { MaskedInput } from '../components/ui/MaskedInput'
import { authService, configService, tenantService, uploadService } from '../services'
import type { ConfigSettingsObject } from '../types'
import { cn, consultarCepViaReceitaWs, consultarCnpjViaBrasilApi } from '../utils'

type ConfigTab = 'geral' | 'seguranca'
type PessoaTipo = 'PF' | 'PJ'

type GeralForm = {
  tipoPessoa: PessoaTipo
  logoUrl: string
  logoKey: string
  pfNome: string
  pfCpf: string
  pjRazaoSocial: string
  pjNomeFantasia: string
  pjCnpj: string
  pjRepresentanteNome: string
  pjRepresentanteCpf: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
}

type SegurancaForm = {
  certificadoA1Url: string
  certificadoA1Key: string
  certificadoSenha: string
}

const initialGeral: GeralForm = {
  tipoPessoa: 'PF',
  logoUrl: '',
  logoKey: '',
  pfNome: '',
  pfCpf: '',
  pjRazaoSocial: '',
  pjNomeFantasia: '',
  pjCnpj: '',
  pjRepresentanteNome: '',
  pjRepresentanteCpf: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
}

const initialSeguranca: SegurancaForm = {
  certificadoA1Url: '',
  certificadoA1Key: '',
  certificadoSenha: '',
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

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
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Carregando configurações...</p>
      </section>
    )
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:h-fit">
          <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Configurações
          </p>
          <div className="grid gap-1">
            <button
              type="button"
              onClick={() => setTab('geral')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
                tab === 'geral'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <Building2 size={16} />
              Dados gerais do tenant
            </button>
            <button
              type="button"
              onClick={() => setTab('seguranca')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
                tab === 'seguranca'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <ShieldCheck size={16} />
              Segurança
            </button>
          </div>
        </aside>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:p-6">
          {tab === 'geral' ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Dados gerais</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Configure identificação, documento e endereço do tenant.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                <div className="space-y-2">
                  <ImagePicker
                    label="Logo do tenant"
                    helperText={isUploadingLogo ? 'Enviando logo...' : 'PNG/JPG recomendado'}
                    previewUrl={geral.logoUrl || null}
                    disabled={isUploadingLogo}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleLogoUpload(file)
                    }}
                    onRemove={() => setGeral((prev) => ({ ...prev, logoUrl: '', logoKey: '' }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setGeral((prev) => ({ ...prev, tipoPessoa: 'PF' }))}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        geral.tipoPessoa === 'PF'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                      )}
                    >
                      <UserRound size={14} className="mr-1 inline-block" />
                      Pessoa física
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeral((prev) => ({ ...prev, tipoPessoa: 'PJ' }))}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        geral.tipoPessoa === 'PJ'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                      )}
                    >
                      <Building2 size={14} className="mr-1 inline-block" />
                      Pessoa jurídica
                    </button>
                  </div>

                  {geral.tipoPessoa === 'PF' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Nome"
                        value={geral.pfNome}
                        onChange={(event) => setGeral((prev) => ({ ...prev, pfNome: event.target.value }))}
                      />
                      <MaskedInput
                        label="CPF"
                        maskType="cpf"
                        value={geral.pfCpf}
                        onAccept={(maskedValue) => setGeral((prev) => ({ ...prev, pfCpf: maskedValue }))}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Razão social"
                        value={geral.pjRazaoSocial}
                        onChange={(event) => setGeral((prev) => ({ ...prev, pjRazaoSocial: event.target.value }))}
                      />
                      <Input
                        label="Nome fantasia"
                        value={geral.pjNomeFantasia}
                        onChange={(event) => setGeral((prev) => ({ ...prev, pjNomeFantasia: event.target.value }))}
                      />
                      <MaskedInput
                        label="CNPJ"
                        maskType="cnpj"
                        value={geral.pjCnpj}
                        helperText={isCnpjLookupLoading ? 'Consultando CNPJ...' : 'Digite o CNPJ para autopreencher'}
                        onAccept={(maskedValue, unmaskedValue) => {
                          setGeral((prev) => ({ ...prev, pjCnpj: maskedValue }))
                          void handleCnpjLookup(unmaskedValue)
                        }}
                      />
                      <Input
                        label="Nome do representante"
                        value={geral.pjRepresentanteNome}
                        onChange={(event) =>
                          setGeral((prev) => ({ ...prev, pjRepresentanteNome: event.target.value }))
                        }
                      />
                      <MaskedInput
                        label="CPF do representante"
                        maskType="cpf"
                        value={geral.pjRepresentanteCpf}
                        onAccept={(maskedValue) =>
                          setGeral((prev) => ({ ...prev, pjRepresentanteCpf: maskedValue }))
                        }
                      />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MaskedInput
                      label="CEP"
                      maskType="cep"
                      value={geral.cep}
                      helperText={isCepLookupLoading ? 'Consultando CEP...' : 'Digite o CEP para autopreencher'}
                      onAccept={(maskedValue, unmaskedValue) => {
                        setGeral((prev) => ({ ...prev, cep: maskedValue }))
                        void handleCepLookup(unmaskedValue)
                      }}
                    />
                    <Input
                      label="Endereço"
                      value={geral.endereco}
                      onChange={(event) => setGeral((prev) => ({ ...prev, endereco: event.target.value }))}
                    />
                    <Input
                      label="Bairro"
                      value={geral.bairro}
                      onChange={(event) => setGeral((prev) => ({ ...prev, bairro: event.target.value }))}
                    />
                    <Input
                      label="Cidade"
                      value={geral.cidade}
                      onChange={(event) => setGeral((prev) => ({ ...prev, cidade: event.target.value }))}
                    />
                    <Input
                      label="Estado"
                      value={geral.estado}
                      onChange={(event) => setGeral((prev) => ({ ...prev, estado: event.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => void salvarDadosGerais()} disabled={isSavingGeral}>
                  {isSavingGeral ? 'Salvando...' : 'Salvar dados gerais'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Segurança</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Faça upload do certificado A1 e informe a senha para assinatura digital.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
                <label className="block rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <FileKey2 size={16} />
                    Certificado A1 (.pfx/.p12)
                  </span>
                  <input
                    type="file"
                    accept=".pfx,.p12,application/x-pkcs12"
                    disabled={isUploadingCert}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handleCertUpload(file)
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500 dark:text-slate-300"
                  />
                  {seguranca.certificadoA1Key ? (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Arquivo atual: {seguranca.certificadoA1Key}
                    </p>
                  ) : null}
                </label>

                <Input
                  type="password"
                  label="Senha do certificado digital"
                  value={seguranca.certificadoSenha}
                  onChange={(event) =>
                    setSeguranca((prev) => ({ ...prev, certificadoSenha: event.target.value }))
                  }
                  helperText="A senha será salva em desenvolvimento para facilitar testes."
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => void salvarSeguranca()}
                  disabled={isSavingSeguranca || isUploadingCert}
                >
                  {isSavingSeguranca ? 'Salvando...' : 'Salvar segurança'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

