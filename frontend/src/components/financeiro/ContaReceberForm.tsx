import { CircleDollarSign, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type {
  Aluno,
  ContaReceber,
  Curso,
  CreateContaReceberRequest,
  UpdateContaReceberRequest,
} from '../../types'
import { cursoService, usuarioService } from '../../services'
import { Button } from '../ui/Button'
import { CurrencyInput } from '../ui/CurrencyInput'
import { Checkbox } from '../ui/Checkbox'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/TextArea'

type ContaReceberFormProps = {
  isOpen: boolean
  selectedContaReceber: ContaReceber | null
  isSubmitting: boolean
  onSubmit: (payload: CreateContaReceberRequest | UpdateContaReceberRequest) => Promise<void>
  onClose: () => void
}

type ParcelaState = {
  id?: number
  numeroParcela: string
  valor: number | null
  dataVencimento: Date | null
  pago?: boolean
  dataPagamento?: string | null
}

type FormState = {
  alunoId: string
  cursoId: string
  formaPagamento: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'
  descricao: string
  observacao: string
  valorTotal: number | null
  parcelas: ParcelaState[]
}

function parseDateValue(value?: string | null): Date | null {
  if (!value) return null
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function toDateInputValue(date: Date | null): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayYmd(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialState: FormState = {
  alunoId: '',
  cursoId: '',
  formaPagamento: 'PIX',
  descricao: '',
  observacao: '',
  valorTotal: null,
  parcelas: [
    { numeroParcela: '1', valor: null, dataVencimento: null, pago: false, dataPagamento: null },
  ],
}

export function ContaReceberForm({
  isOpen,
  selectedContaReceber,
  isSubmitting,
  onSubmit,
  onClose,
}: ContaReceberFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const [alunoOptions, setAlunoOptions] = useState<Array<{ label: string; value: number; description?: string }>>([])
  const [cursoOptions, setCursoOptions] = useState<Array<{ label: string; value: number }>>([])
  const [isLoadingReferences, setIsLoadingReferences] = useState(false)

  const formaPagamentoOptions = useMemo(
    () => [
      { label: 'PIX', value: 'PIX' },
      { label: 'Cartao de credito', value: 'CARTAO_CREDITO' },
      { label: 'Cartao de debito', value: 'CARTAO_DEBITO' },
    ],
    [],
  )

  useEffect(() => {
    if (!selectedContaReceber) {
      setForm(initialState)
      return
    }

    setForm({
      alunoId: selectedContaReceber.aluno_id != null ? String(selectedContaReceber.aluno_id) : '',
      cursoId: selectedContaReceber.curso_id != null ? String(selectedContaReceber.curso_id) : '',
      formaPagamento:
        selectedContaReceber.forma_pagamento && ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO'].includes(selectedContaReceber.forma_pagamento)
          ? (selectedContaReceber.forma_pagamento as FormState['formaPagamento'])
          : 'PIX',
      descricao: selectedContaReceber.descricao ?? '',
      observacao: selectedContaReceber.observacao ?? '',
      valorTotal: Number(selectedContaReceber.valor_total ?? 0),
      parcelas:
        selectedContaReceber.parcelas?.length
          ? selectedContaReceber.parcelas.map((p, idx) => ({
              id: p.id,
              numeroParcela:
                p.numero_parcela != null ? String(p.numero_parcela) : p.numero != null ? String(p.numero) : String(idx + 1),
              valor: p.valor != null ? Number(p.valor) : null,
              dataVencimento: parseDateValue(p.data_vencimento),
              pago: Boolean(p.pago),
              dataPagamento: p.data_pagamento ?? null,
            }))
          : [{ numeroParcela: '1', valor: null, dataVencimento: null, pago: false, dataPagamento: null }],
    })
  }, [selectedContaReceber])

  useEffect(() => {
    if (!isOpen) return

    let mounted = true
    setIsLoadingReferences(true)

    void Promise.all([
      usuarioService.listarAlunos({ page: 1, limit: 200 }),
      cursoService.listarCursos({ page: 1, limit: 200 }),
    ])
      .then(([alunosRes, cursosRes]) => {
        if (!mounted) return

        const alunos = (alunosRes.data.data ?? []).map((aluno: Aluno) => ({
          value: aluno.id,
          label:
            aluno.perfil_aluno?.nome_completo ??
            aluno.nome_completo ??
            aluno.username,
          description: aluno.email,
        }))
        const cursos = (cursosRes.data.data ?? []).map((curso: Curso) => ({
          value: curso.id,
          label: curso.nome,
        }))

        setAlunoOptions(alunos)
        setCursoOptions(cursos)
      })
      .catch(() => {
        if (!mounted) return
        setAlunoOptions([])
        setCursoOptions([])
      })
      .finally(() => {
        if (mounted) setIsLoadingReferences(false)
      })

    return () => {
      mounted = false
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timeout = window.setTimeout(() => setIsVisible(true), 40)
      return () => window.clearTimeout(timeout)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => setShouldRender(false), 780)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  const isEditing = Boolean(selectedContaReceber)

  function updateParcela(index: number, patch: Partial<ParcelaState>) {
    setForm((prev) => ({
      ...prev,
      parcelas: prev.parcelas.map((parcela, i) => (i === index ? { ...parcela, ...patch } : parcela)),
    }))
  }

  function addParcela() {
    setForm((prev) => ({
      ...prev,
      parcelas: [
        ...prev.parcelas,
        {
          numeroParcela: String(prev.parcelas.length + 1),
          valor: null,
          dataVencimento: null,
          pago: false,
          dataPagamento: null,
        },
      ],
    }))
  }

  function removeParcela(index: number) {
    setForm((prev) => {
      if (prev.parcelas.length <= 1) return prev
      const next = prev.parcelas.filter((_, i) => i !== index)
      return {
        ...prev,
        parcelas: next.map((p, i) => ({
          ...p,
          numeroParcela: p.numeroParcela ? p.numeroParcela : String(i + 1),
        })),
      }
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const alunoId = Number(form.alunoId)
    const cursoId = Number(form.cursoId)

    if (!Number.isFinite(alunoId) || alunoId <= 0) {
      window.alert('Informe um `aluno_id` valido.')
      return
    }
    if (!Number.isFinite(cursoId) || cursoId <= 0) {
      window.alert('Informe um `curso_id` valido.')
      return
    }
    if (form.valorTotal === null) {
      window.alert('Informe o valor total.')
      return
    }
    const valorTotal = form.valorTotal
    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      window.alert('Valor total deve ser maior que zero.')
      return
    }

    const parcelasValidas: UpdateContaReceberRequest['parcelas'] = []
    for (let i = 0; i < form.parcelas.length; i++) {
      const p = form.parcelas[i]
      const numeroParcela = Number(p.numeroParcela)
      if (!p.dataVencimento) {
        window.alert(`Selecione a data de vencimento da parcela ${i + 1}.`)
        return
      }
      if (!Number.isFinite(numeroParcela) || numeroParcela <= 0) {
        window.alert(`Numero da parcela ${i + 1} deve ser maior que zero.`)
        return
      }
      if (p.valor === null) {
        window.alert(`Informe o valor da parcela ${i + 1}.`)
        return
      }
      const valor = p.valor
      if (!Number.isFinite(valor) || valor <= 0) {
        window.alert(`Valor da parcela ${i + 1} deve ser maior que zero.`)
        return
      }

      parcelasValidas.push({
        ...(p.id ? { id: p.id } : {}),
        numero_parcela: numeroParcela,
        valor,
        data_vencimento: toDateInputValue(p.dataVencimento),
        pago: Boolean(p.pago),
        data_pagamento: p.dataPagamento ?? undefined,
      })
    }

    if (!parcelasValidas.length) {
      window.alert('Informe ao menos uma parcela.')
      return
    }

    const payload: CreateContaReceberRequest = {
      aluno_id: alunoId,
      curso_id: cursoId,
      forma_pagamento: form.formaPagamento,
      descricao: form.descricao.trim() || undefined,
      valor_total: valorTotal,
      observacao: form.observacao.trim() || undefined,
      parcelas: parcelasValidas,
    }

    await onSubmit(isEditing ? (payload as UpdateContaReceberRequest) : payload)
  }

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex h-[100dvh] w-screen items-end justify-center overflow-hidden p-0 backdrop-blur-sm transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:items-center sm:p-4 ${
        isVisible ? 'bg-slate-900/55 opacity-100' : 'bg-slate-900/0 opacity-0'
      }`}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className={`flex h-[92dvh] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-slate-800 dark:bg-slate-900 sm:h-[min(88dvh,920px)] sm:max-w-4xl sm:rounded-3xl ${
          isVisible
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-16 opacity-0 sm:translate-y-4 sm:scale-[0.97]'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isEditing ? 'Editar Receita' : 'Nova Receita'}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Cadastro de receita com parcelas
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Fechar modal"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Dados obrigatorios
              </h4>

              <Input
                label="Descrição"
                value={form.descricao}
                onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
                placeholder="Ex: Mensalidade do curso"
                startIcon={<CircleDollarSign size={16} />}
                required
              />

              <Select
                label="Aluno"
                value={form.alunoId ? Number(form.alunoId) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    alunoId: value != null ? String(value) : '',
                  }))
                }
                options={alunoOptions}
                placeholder={isLoadingReferences ? 'Carregando alunos...' : 'Selecione um aluno'}
                disabled={isLoadingReferences}
              />

              <Select
                label="Curso"
                value={form.cursoId ? Number(form.cursoId) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    cursoId: value != null ? String(value) : '',
                  }))
                }
                options={cursoOptions}
                placeholder={isLoadingReferences ? 'Carregando cursos...' : 'Selecione um curso'}
                disabled={isLoadingReferences}
              />

              <Select
                label="Forma de pagamento"
                value={form.formaPagamento}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    formaPagamento: String(value) as FormState['formaPagamento'],
                  }))
                }
                options={formaPagamentoOptions}
              />

              <CurrencyInput
                label="Valor total"
                value={form.valorTotal}
                onChange={(next) => setForm((prev) => ({ ...prev, valorTotal: next }))}
              />

              <Textarea
                label="Observacoes (opcional)"
                value={form.observacao}
                onChange={(event) => setForm((prev) => ({ ...prev, observacao: event.target.value }))}
                placeholder="Anotacoes sobre a receita..."
                rows={5}
                className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70"
              />
            </div>

            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Parcelas
              </h4>

              <div className="space-y-3">
                {form.parcelas.map((parcela, index) => (
                  <div
                    key={`${index}-${parcela.numeroParcela}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Parcela {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeParcela(index)}
                        disabled={form.parcelas.length <= 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/40"
                        aria-label="Remover parcela"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Numero"
                        type="number"
                        value={parcela.numeroParcela}
                        onChange={(event) =>
                          updateParcela(index, { numeroParcela: event.target.value })
                        }
                        required
                      />
                      <CurrencyInput
                        label="Valor"
                        value={parcela.valor}
                        onChange={(next) => updateParcela(index, { valor: next })}
                      />
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                      <Checkbox
                        label="Parcela paga"
                        description={
                          parcela.pago
                            ? `Pagamento registrado em ${
                                parcela.dataPagamento
                                  ? new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')
                                  : 'data nao informada'
                              }`
                            : 'Marque quando a parcela for paga.'
                        }
                        checked={Boolean(parcela.pago)}
                        onCheckedChange={(checked) =>
                          updateParcela(index, {
                            pago: checked,
                            dataPagamento: checked
                              ? parcela.dataPagamento ?? getTodayYmd()
                              : null,
                          })
                        }
                      />
                    </div>

                    <div className="mt-3">
                      <DatePicker
                        label="Vencimento"
                        value={parcela.dataVencimento}
                        onChange={(date) => updateParcela(index, { dataVencimento: date })}
                        required
                        size="md"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addParcela}
                  startIcon={<Plus size={18} />}
                  className="w-full rounded-2xl border-slate-200 bg-white"
                >
                  Adicionar parcela
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-2xl border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            startIcon={<Save size={18} />}
            className="w-full rounded-2xl px-7 py-3 text-sm font-bold uppercase tracking-wider shadow-xl shadow-indigo-200/40 sm:w-auto dark:shadow-indigo-950/40"
          >
            {isEditing ? 'Salvar alteracoes' : 'Salvar receita'}
          </Button>
        </div>
      </form>
    </div>
  )
}

