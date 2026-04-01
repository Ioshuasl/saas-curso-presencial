import { FileKey2 } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { SegurancaForm } from './types'

type TenantSegurancaTabProps = {
  seguranca: SegurancaForm
  setSeguranca: Dispatch<SetStateAction<SegurancaForm>>
  isUploadingCert: boolean
  onCertFileSelect: (file: File) => void
  onSave: () => void
  isSaving: boolean
}

export function TenantSegurancaTab({
  seguranca,
  setSeguranca,
  isUploadingCert,
  onCertFileSelect,
  onSave,
  isSaving,
}: TenantSegurancaTabProps) {
  return (
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
              if (file) onCertFileSelect(file)
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
          onChange={(event) => setSeguranca((prev) => ({ ...prev, certificadoSenha: event.target.value }))}
          helperText="A senha será salva em desenvolvimento para facilitar testes."
        />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={isSaving || isUploadingCert}>
          {isSaving ? 'Salvando...' : 'Salvar segurança'}
        </Button>
      </div>
    </div>
  )
}
