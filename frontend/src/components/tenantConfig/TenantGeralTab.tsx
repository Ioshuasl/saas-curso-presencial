import { Building2, UserRound } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { ImagePicker } from '../ui/ImagePicker'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaskedInput } from '../ui/MaskedInput'
import { cn } from '../../utils'
import type { GeralForm } from './types'

type TenantGeralTabProps = {
  geral: GeralForm
  setGeral: Dispatch<SetStateAction<GeralForm>>
  isUploadingLogo: boolean
  onLogoFileSelect: (file: File) => void
  onLogoRemove: () => void
  isCepLookupLoading: boolean
  isCnpjLookupLoading: boolean
  onCepAccept: (maskedValue: string, unmaskedValue: string) => void
  onCnpjAccept: (maskedValue: string, unmaskedValue: string) => void
  onSave: () => void
  isSaving: boolean
}

export function TenantGeralTab({
  geral,
  setGeral,
  isUploadingLogo,
  onLogoFileSelect,
  onLogoRemove,
  isCepLookupLoading,
  isCnpjLookupLoading,
  onCepAccept,
  onCnpjAccept,
  onSave,
  isSaving,
}: TenantGeralTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Dados gerais</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure identificação, documento e endereço do tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <ImagePicker
            label="Logo do tenant"
            helperText={isUploadingLogo ? 'Enviando logo...' : 'PNG/JPG recomendado'}
            previewUrl={geral.logoUrl || null}
            disabled={isUploadingLogo}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onLogoFileSelect(file)
            }}
            onRemove={onLogoRemove}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              value={geral.email}
              onChange={(event) => setGeral((prev) => ({ ...prev, email: event.target.value }))}
            />
            <MaskedInput
              label="Telefone"
              maskType="phone"
              value={geral.telefone}
              helperText="Com DDD"
              onAccept={(maskedValue) => setGeral((prev) => ({ ...prev, telefone: maskedValue }))}
            />
          </div>
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
                  void onCnpjAccept(maskedValue, unmaskedValue)
                }}
              />
              <Input
                label="Nome do representante"
                value={geral.pjRepresentanteNome}
                onChange={(event) => setGeral((prev) => ({ ...prev, pjRepresentanteNome: event.target.value }))}
              />
              <MaskedInput
                label="CPF do representante"
                maskType="cpf"
                value={geral.pjRepresentanteCpf}
                onAccept={(maskedValue) => setGeral((prev) => ({ ...prev, pjRepresentanteCpf: maskedValue }))}
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
                void onCepAccept(maskedValue, unmaskedValue)
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
        <Button type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar dados gerais'}
        </Button>
      </div>
    </div>
  )
}
