import { CalendarDays, CircleDollarSign, Save, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type {
  ContaPagar,
  Curso,
  CreateContaPagarRequest,
  UpdateContaPagarRequest,
} from '../../types'
import { cursoService } from '../../services'
import { Button } from '../ui/Button'
import { CurrencyInput } from '../ui/CurrencyInput'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { RadioGroup } from '../ui/RadioGroup'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/TextArea'

type ContaPagarFormProps = {
  isOpen: boolean
  selectedContaPagar: ContaPagar | null
  isSubmitting: boolean
  onSubmit: (payload: CreateContaPagarRequest | UpdateContaPagarRequest) => Promise<void>
  onClose: () => void
}

type FormState = {
  cursoId: string
  descricao: string
  valor: number | null
  categoria: string
  dataVencimento: Date | null
  dataPagamento: Date | null
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO'
  observacao: string
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

function coerceStatus(status: unknown): FormState['status'] {
  const s = String(status ?? '').toUpperCase()
  if (s === 'PAGO') return 'PAGO'
  if (s === 'ATRASADO') return 'ATRASADO'
  return 'PENDENTE'
}

const initialState: FormState = {
  cursoId: '',
  descricao: '',
  valor: null,
  categoria: '',
  dataVencimento: null,
  dataPagamento: null,
  status: 'PENDENTE',
  observacao: '',
}

export function ContaPagarForm({
  isOpen,
  selectedContaPagar,
  isSubmitting,
  onSubmit,
  onClose,
}: ContaPagarFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const [cursoOptions, setCursoOptions] = useState<Array<{ label: string; value: number }>>([])
  const [isLoadingCursos, setIsLoadingCursos] = useState(false)

  const statusOptions = useMemo(
    () => [
      { label: 'Pendente', value: 'PENDENTE' },
      { label: 'Pago', value: 'PAGO' },
      { label: 'Atrasado', value: 'ATRASADO' },
    ],
    [],
  )

  useEffect(() => {
    if (!selectedContaPagar) {
      setForm(initialState)
      return
    }

    setForm({
      cursoId: selectedContaPagar.curso_id != null ? String(selectedContaPagar.curso_id) : '',
      descricao: selectedContaPagar.descricao ?? '',
      valor: Number(selectedContaPagar.valor ?? 0),
      categoria: selectedContaPagar.categoria ?? '',
      dataVencimento: parseDateValue(selectedContaPagar.data_vencimento),
      dataPagamento: parseDateValue(selectedContaPagar.data_pagamento),
      status: coerceStatus(selectedContaPagar.status),
      observacao: selectedContaPagar.observacao ?? '',
    })
  }, [selectedContaPagar])

  useEffect(() => {
    if (!isOpen) return

    let mounted = true
    setIsLoadingCursos(true)
    void cursoService
      .listarCursos({ page: 1, limit: 200 })
      .then((response) => {
        if (!mounted) return
        const options = (response.data.data ?? []).map((curso: Curso) => ({
          label: curso.nome,
          value: curso.id,
        }))
        setCursoOptions(options)
      })
      .catch(() => {
        if (mounted) setCursoOptions([])
      })
      .finally(() => {
        if (mounted) setIsLoadingCursos(false)
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

  const isEditing = Boolean(selectedContaPagar)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.dataVencimento) {
      window.alert('Selecione a data de vencimento.')
      return
    }

    const descricao = form.descricao.trim()
    const categoria = form.categoria.trim()

    if (descricao.length < 3) {
      window.alert('Descrição deve ter pelo menos 3 caracteres.')
      return
    }
    if (categoria.length < 3) {
      window.alert('Categoria deve ter pelo menos 3 caracteres.')
      return
    }

    if (form.valor === null) {
      window.alert('Informe o valor.')
      return
    }
    const valor = form.valor
    if (!Number.isFinite(valor) || valor <= 0) {
      window.alert('Valor deve ser maior que zero.')
      return
    }

    const payload: CreateContaPagarRequest = {
      curso_id: form.cursoId ? Number(form.cursoId) : undefined,
      descricao,
      valor,
      categoria,
      data_vencimento: toDateInputValue(form.dataVencimento),
      data_pagamento: form.dataPagamento ? toDateInputValue(form.dataPagamento) : undefined,
      status: form.status,
      observacao: form.observacao.trim() || undefined,
    }

    await onSubmit(isEditing ? (payload as UpdateContaPagarRequest) : payload)
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
              {isEditing ? 'Editar Conta' : 'Nova Conta'}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Cadastro de despesa e controle de status
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
                placeholder="Ex: Materiais e insumos"
                startIcon={<CircleDollarSign size={16} />}
                required
              />

              <Select
                label="Curso vinculado (opcional)"
                value={form.cursoId ? Number(form.cursoId) : null}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    cursoId: value != null ? String(value) : '',
                  }))
                }
                options={cursoOptions}
                placeholder={isLoadingCursos ? 'Carregando cursos...' : 'Selecione um curso'}
                disabled={isLoadingCursos}
              />

              <CurrencyInput
                label="Valor"
                value={form.valor}
                onChange={(next) => setForm((prev) => ({ ...prev, valor: next }))}
              />

              <Input
                label="Categoria"
                value={form.categoria}
                onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
                placeholder="Ex: Despesa fixa"
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatePicker
                  label="Vencimento"
                  value={form.dataVencimento}
                  onChange={(date) => setForm((prev) => ({ ...prev, dataVencimento: date }))}
                  required
                  size="md"
                />
                <DatePicker
                  label="Pagamento (opcional)"
                  value={form.dataPagamento}
                  onChange={(date) => setForm((prev) => ({ ...prev, dataPagamento: date }))}
                  size="md"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Status e observacoes
              </h4>

              <RadioGroup
                name="status-conta-pagar"
                label="Status"
                value={form.status}
                onChange={(value) => setForm((prev) => ({ ...prev, status: value as FormState['status'] }))}
                options={statusOptions.map((o) => ({ label: o.label, value: o.value }))}
                variant="segmented"
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CalendarDays size={16} />
                  <span className="text-sm font-semibold">
                    {form.status === 'PAGO'
                      ? 'Informe a data de pagamento.'
                      : form.status === 'ATRASADO'
                        ? 'O pagamento esta em atraso.'
                        : 'A despesa ainda nao foi paga.'}
                  </span>
                </div>
              </div>

              <Textarea
                label="Observacoes (opcional)"
                value={form.observacao}
                onChange={(event) => setForm((prev) => ({ ...prev, observacao: event.target.value }))}
                placeholder="Anotacoes sobre esta despesa..."
                rows={5}
                autoResize={false}
                className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70"
              />
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
            {isEditing ? 'Salvar alteracoes' : 'Salvar conta'}
          </Button>
        </div>
      </form>
    </div>
  )
}

