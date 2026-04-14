import { CheckCircle2, Trash2, UserRound } from 'lucide-react'

import type { CursoComInscritos } from '../../types'
import { Button } from '../ui/Button'

type AdminInscricaoListProps = {
  curso: CursoComInscritos | null
  isLoading: boolean
  onConfirmarPresenca: (alunoId: number) => void
  onRemoverInscricao: (alunoId: number, alunoNome: string) => void
}

function resolveAlunoNome(
  aluno: NonNullable<CursoComInscritos['alunos_inscritos']>[number],
) {
  return aluno.perfil_aluno?.nome_completo || aluno.nome_completo || aluno.username || 'Aluno'
}

export function AdminInscricaoList({
  curso,
  isLoading,
  onConfirmarPresenca,
  onRemoverInscricao,
}: AdminInscricaoListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando inscrições...
      </div>
    )
  }

  const inscritos = curso?.alunos_inscritos ?? []

  if (!inscritos.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-black text-slate-500 dark:text-slate-300">
          Nenhum aluno inscrito neste curso
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          Use o botão "Nova inscrição" para adicionar alunos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {inscritos.map((aluno) => {
        const nome = resolveAlunoNome(aluno)
        const inscricao = aluno.Inscricao ?? aluno.inscricao
        const dataInscricao = inscricao?.data_inscricao
          ? new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')
          : '-'
        const presencaConfirmada = Boolean(inscricao?.presenca_confirmada)

        return (
          <article
            key={aluno.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{nome}</p>
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {aluno.email || 'Sem e-mail'}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>ID: {aluno.id}</span>
                  <span>CPF: {aluno.cpf || '-'}</span>
                  <span>Inscrição: {dataInscricao}</span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                    presencaConfirmada
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}
                >
                  <UserRound size={12} />
                  {presencaConfirmada ? 'Presença confirmada' : 'Presença pendente'}
                </span>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    startIcon={<CheckCircle2 size={14} />}
                    disabled={presencaConfirmada}
                    onClick={() => onConfirmarPresenca(aluno.id)}
                  >
                    Confirmar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onRemoverInscricao(aluno.id, nome)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
