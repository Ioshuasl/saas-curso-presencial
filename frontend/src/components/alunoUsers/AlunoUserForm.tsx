import { Briefcase, Lock, Mail, MapPin, Save, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Aluno, CreateAlunoRequest, UpdateAlunoRequest } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaskedInput } from '../ui/MaskedInput'
import { Textarea } from '../ui/TextArea'

type AlunoUserFormProps = {
  isOpen: boolean
  selectedAluno: Aluno | null
  isSubmitting: boolean
  onSubmit: (payload: CreateAlunoRequest | UpdateAlunoRequest) => Promise<void>
  onClose: () => void
}

type FormState = {
  username: string
  email: string
  nome_completo: string
  telefone: string
  cidade: string
  profissao: string
  biografia: string
  senha: string
}

const initialState: FormState = {
  username: '',
  email: '',
  nome_completo: '',
  telefone: '',
  cidade: '',
  profissao: '',
  biografia: '',
  senha: '',
}

export function AlunoUserForm({
  isOpen,
  selectedAluno,
  isSubmitting,
  onSubmit,
  onClose,
}: AlunoUserFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!selectedAluno) {
      setForm(initialState)
      return
    }

    setForm({
      username: selectedAluno.username ?? '',
      email: selectedAluno.email ?? '',
      nome_completo:
        selectedAluno.perfil_aluno?.nome_completo ?? selectedAluno.nome_completo ?? '',
      telefone: selectedAluno.telefone ?? '',
      cidade: selectedAluno.cidade ?? '',
      profissao: selectedAluno.profissao ?? '',
      biografia: selectedAluno.biografia ?? '',
      senha: '',
    })
  }, [selectedAluno])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timeout = window.setTimeout(() => {
        setIsVisible(true)
      }, 40)
      return () => window.clearTimeout(timeout)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => {
      setShouldRender(false)
    }, 780)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  const isEditing = Boolean(selectedAluno)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isEditing) {
      const payload: UpdateAlunoRequest = {
        username: form.username,
        email: form.email,
        nome_completo: form.nome_completo,
        telefone: form.telefone || undefined,
        cidade: form.cidade || undefined,
        profissao: form.profissao || undefined,
        biografia: form.biografia || undefined,
      }

      if (form.senha) {
        payload.senha = form.senha
      }

      await onSubmit(payload)
      return
    }

    await onSubmit({
      username: form.username,
      email: form.email,
      senha: form.senha,
      nome_completo: form.nome_completo,
      telefone: form.telefone || undefined,
      cidade: form.cidade || undefined,
      profissao: form.profissao || undefined,
      biografia: form.biografia || undefined,
    })
  }

  if (!shouldRender) {
    return null
  }

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
              {isEditing ? 'Editar Cadastro' : 'Novo Aluno'}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Informacoes pessoais e profissionais do aluno
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
                label="Nome completo"
                value={form.nome_completo}
                onChange={(event) => setForm((prev) => ({ ...prev, nome_completo: event.target.value }))}
                startIcon={<UserIcon size={16} />}
                placeholder="Ex: Joao da Silva"
                required
              />

              <Input
                label="Username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                startIcon={<UserIcon size={16} />}
                placeholder="Ex: joao.silva"
                required
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                startIcon={<Mail size={16} />}
                placeholder="joao@email.com"
                required
              />

              <MaskedInput
                label="Telefone / WhatsApp"
                maskType="phone"
                value={form.telefone}
                onAccept={(value) => setForm((prev) => ({ ...prev, telefone: value }))}
              />

              <Input
                label={isEditing ? 'Nova senha (opcional)' : 'Senha de acesso'}
                type="password"
                value={form.senha}
                onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
                startIcon={<Lock size={16} />}
                placeholder={isEditing ? '••••••••' : 'Minimo 6 caracteres'}
                required={!isEditing}
                helperText={isEditing ? 'Deixe em branco para manter a senha atual.' : undefined}
              />
            </div>

            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Informacoes complementares
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Cidade"
                  value={form.cidade}
                  onChange={(event) => setForm((prev) => ({ ...prev, cidade: event.target.value }))}
                  startIcon={<MapPin size={16} />}
                  placeholder="Ex: Goiania"
                />

                <Input
                  label="Profissao"
                  value={form.profissao}
                  onChange={(event) => setForm((prev) => ({ ...prev, profissao: event.target.value }))}
                  startIcon={<Briefcase size={16} />}
                  placeholder="Ex: Barbeiro"
                />
              </div>

              <div>
                <Textarea
                  label='Bio / "Fale sobre voce"'
                  value={form.biografia}
                  onChange={(event) => setForm((prev) => ({ ...prev, biografia: event.target.value }))}
                  placeholder="Breve relato sobre as motivacoes do aluno..."
                  rows={5}
                  className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70"
                />
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
            {isEditing ? 'Salvar alteracoes' : 'Salvar aluno'}
          </Button>
        </div>
      </form>
    </div>
  )
}
