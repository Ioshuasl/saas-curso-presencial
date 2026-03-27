import { Briefcase, CalendarDays, DollarSign, MapPin, Plus, Save, Trash2, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { CreateCursoRequest, CreateCursoSessaoRequest, Curso, UpdateCursoRequest } from '../../types'
import { Button } from '../ui/Button'
import { DatePicker } from '../ui/DatePicker'
import { ImagePicker } from '../ui/ImagePicker'
import { Input } from '../ui/Input'
import { Switch } from '../ui/Switch'
import { Textarea } from '../ui/TextArea'
import { TimePicker } from '../ui/TimePicker'

type CursoFormProps = {
  isOpen: boolean
  selectedCurso: Curso | null
  isSubmitting: boolean
  onSubmit: (payload: CreateCursoRequest | UpdateCursoRequest) => Promise<void>
  onClose: () => void
}

type FormState = {
  nome: string
  ministrante: string
  descricao: string
  conteudo: string
  valor: string
  vagas: string
  local: string
  status: boolean
  imagem: File | null
  sessoes: CreateCursoSessaoRequest[]
}

function getDefaultSession(): CreateCursoSessaoRequest {
  const today = new Date().toISOString().slice(0, 10)
  return {
    data: today,
    horario_inicio: '09:00',
    horario_fim: '18:00',
  }
}

function parseDateValue(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
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

const initialState: FormState = {
  nome: '',
  ministrante: '',
  descricao: '',
  conteudo: '',
  valor: '0',
  vagas: '0',
  local: '',
  status: true,
  imagem: null,
  sessoes: [getDefaultSession()],
}

export function CursoForm({
  isOpen,
  selectedCurso,
  isSubmitting,
  onSubmit,
  onClose,
}: CursoFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)

  useEffect(() => {
    if (!selectedCurso) {
      setForm(initialState)
      setImagePreviewUrl(null)
      setRemoveCurrentImage(false)
      return
    }

    setForm({
      nome: selectedCurso.nome ?? '',
      ministrante: selectedCurso.ministrante ?? '',
      descricao: selectedCurso.descricao ?? '',
      conteudo: selectedCurso.conteudo ?? '',
      valor: String(selectedCurso.valor ?? 0),
      vagas: String(selectedCurso.vagas ?? 0),
      local: selectedCurso.local ?? '',
      status: Boolean(selectedCurso.status),
      imagem: null,
      sessoes:
        selectedCurso.sessoes?.length && selectedCurso.sessoes.every((sessao) => sessao.data)
          ? selectedCurso.sessoes.map((sessao) => ({
              id: sessao.id,
              data: String(sessao.data ?? ''),
              horario_inicio: String(sessao.horario_inicio ?? '').slice(0, 5),
              horario_fim: String(sessao.horario_fim ?? '').slice(0, 5),
            }))
          : [getDefaultSession()],
    })
    setImagePreviewUrl(selectedCurso.url_imagem ?? null)
    setRemoveCurrentImage(false)
  }, [selectedCurso])

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

  const isEditing = Boolean(selectedCurso)
  const totalSessoes = form.sessoes.length

  function updateSessao(index: number, patch: Partial<CreateCursoSessaoRequest>) {
    setForm((prev) => ({
      ...prev,
      sessoes: prev.sessoes.map((sessao, currentIndex) =>
        currentIndex === index ? { ...sessao, ...patch } : sessao,
      ),
    }))
  }

  function addSessao() {
    setForm((prev) => ({
      ...prev,
      sessoes: [...prev.sessoes, getDefaultSession()],
    }))
  }

  function removeSessao(index: number) {
    setForm((prev) => {
      if (prev.sessoes.length <= 1) return prev
      return {
        ...prev,
        sessoes: prev.sessoes.filter((_, currentIndex) => currentIndex !== index),
      }
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sessoesValidas = form.sessoes.filter(
      (sessao) =>
        sessao.data.trim() && sessao.horario_inicio.trim() && sessao.horario_fim.trim(),
    )

    if (!sessoesValidas.length) {
      window.alert('Adicione ao menos uma sessao com data e horarios.')
      return
    }

    const commonPayload = {
      nome: form.nome.trim(),
      ministrante: form.ministrante.trim(),
      descricao: form.descricao.trim() || undefined,
      conteudo: form.conteudo.trim() || undefined,
      valor: Number(form.valor || 0),
      vagas: Number(form.vagas || 0),
      local: form.local.trim(),
      status: form.status,
      imagem: form.imagem,
      sessoes: sessoesValidas,
      ...(isEditing && removeCurrentImage && !form.imagem ? { url_imagem: null } : {}),
    }

    if (isEditing) {
      await onSubmit(commonPayload)
      return
    }

    await onSubmit(commonPayload)
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
        className={`flex h-[92dvh] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-slate-800 dark:bg-slate-900 sm:h-[min(88dvh,920px)] sm:max-w-5xl sm:rounded-3xl ${
          isVisible
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-16 opacity-0 sm:translate-y-4 sm:scale-[0.97]'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8 md:px-10 md:py-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-[30px]">
              {isEditing ? 'Editar Curso' : 'Novo Curso'}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 md:text-[13px]">
              Informacoes de cadastro e disponibilidade do curso
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 md:h-12 md:w-12"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-6 py-6 sm:px-8 sm:py-8 md:overflow-hidden md:px-10 md:py-10">
          <div className="grid grid-cols-1 gap-8 md:h-full md:grid-cols-2 md:gap-12">
            <div className="space-y-6 md:max-h-[64dvh] md:overflow-y-auto md:scrollbar-hide md:pr-1">
              <div>
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Dados do Curso
                </p>
              </div>
              <Input
                label="Nome do curso"
                value={form.nome}
                onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                startIcon={<Briefcase size={16} />}
                className="md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:pr-5 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60"
                required
              />
              <Input
                label="Ministrante"
                value={form.ministrante}
                onChange={(event) => setForm((prev) => ({ ...prev, ministrante: event.target.value }))}
                startIcon={<UserIcon size={16} />}
                className="md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:pr-5 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60"
                required
              />
              <Input
                label="Local"
                value={form.local}
                onChange={(event) => setForm((prev) => ({ ...prev, local: event.target.value }))}
                startIcon={<MapPin size={16} />}
                className="md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:pr-5 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60"
                required
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
                  startIcon={<DollarSign size={16} />}
                  className="md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:pr-5 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60"
                  required
                />
                <Input
                  label="Vagas"
                  type="number"
                  value={form.vagas}
                  onChange={(event) => setForm((prev) => ({ ...prev, vagas: event.target.value }))}
                  className="md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:px-5 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60"
                  required
                />
              </div>

              <ImagePicker
                label={isEditing ? 'Alterar imagem do curso' : 'Imagem do curso'}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setForm((prev) => ({ ...prev, imagem: file }))
                  if (file) {
                    setRemoveCurrentImage(false)
                  }
                }}
                onRemove={() => {
                  setForm((prev) => ({ ...prev, imagem: null }))
                  if (isEditing && imagePreviewUrl) {
                    setRemoveCurrentImage(true)
                    setImagePreviewUrl(null)
                  }
                }}
                previewUrl={imagePreviewUrl}
                helperText="JPG, PNG ou WEBP com no maximo 10MB."
              />
              <Textarea
                label="Descricao"
                value={form.descricao}
                onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
                rows={5}
                className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70 md:[&_textarea]:border-slate-100 md:[&_textarea]:px-5 md:[&_textarea]:py-4 md:[&_textarea]:font-semibold dark:md:[&_textarea]:border-slate-700 dark:md:[&_textarea]:bg-slate-800/60"
              />
              <Textarea
                label="Conteudo"
                value={form.conteudo}
                onChange={(event) => setForm((prev) => ({ ...prev, conteudo: event.target.value }))}
                rows={5}
                className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70 md:[&_textarea]:border-slate-100 md:[&_textarea]:px-5 md:[&_textarea]:py-4 md:[&_textarea]:font-semibold dark:md:[&_textarea]:border-slate-700 dark:md:[&_textarea]:bg-slate-800/60"
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/40 md:rounded-3xl md:border-slate-100 md:bg-slate-50/90 md:px-5 md:py-4 dark:md:border-slate-700 dark:md:bg-slate-800/50">
                <Switch
                  label={form.status ? 'Curso ativo' : 'Curso inativo'}
                  description={form.status ? 'Visivel para inscricoes.' : 'Oculto para novas inscricoes.'}
                  checked={form.status}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4 md:max-h-[64dvh] md:overflow-y-auto md:space-y-6 md:scrollbar-hide md:pr-1">
              <div>
                <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Sessoes do Curso
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60 md:sticky md:top-0 md:rounded-3xl md:border-slate-100 md:bg-slate-50/60 md:p-5 dark:md:border-slate-700 dark:md:bg-slate-800/40">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-indigo-500" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Sessoes
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {totalSessoes} {totalSessoes === 1 ? 'sessao cadastrada' : 'sessoes cadastradas'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addSessao}
                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-300"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {form.sessoes.map((sessao, index) => (
                    <div
                      key={`${sessao.data}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Sessao {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSessao(index)}
                          disabled={form.sessoes.length <= 1}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/40"
                          aria-label="Remover sessao"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <DatePicker
                          label="Data"
                          value={parseDateValue(sessao.data)}
                          onChange={(date) => updateSessao(index, { data: toDateInputValue(date) })}
                          required
                          size="md"
                          className="[&_input]:bg-slate-50 dark:[&_input]:bg-slate-800"
                        />
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <TimePicker
                            label="Inicio"
                            value={sessao.horario_inicio}
                            onChange={(time) => updateSessao(index, { horario_inicio: time ?? '' })}
                            required
                            size="md"
                            className="[&_input]:bg-slate-50 dark:[&_input]:bg-slate-800"
                          />
                          <TimePicker
                            label="Fim"
                            value={sessao.horario_fim}
                            onChange={(time) => updateSessao(index, { horario_fim: time ?? '' })}
                            required
                            size="md"
                            className="[&_input]:bg-slate-50 dark:[&_input]:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-8 md:px-10 md:py-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-2xl border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto md:px-8 md:py-3.5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            startIcon={<Save size={18} />}
            className="w-full rounded-2xl px-7 py-3 text-sm font-bold uppercase tracking-wider shadow-xl shadow-indigo-200/40 sm:w-auto md:px-10 md:py-3.5 dark:shadow-indigo-950/40"
          >
            {isEditing ? 'Salvar alteracoes' : 'Salvar curso'}
          </Button>
        </div>
      </form>
    </div>
  )
}
