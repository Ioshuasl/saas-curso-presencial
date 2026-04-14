import type { UserRole } from '../types'

type HomePageProps = {
  role: UserRole
}

const adminCards = [
  {
    title: 'Cursos e eventos',
    description: 'Criar cursos, definir vagas e organizar agenda de turmas.',
  },
  {
    title: 'Financeiro',
    description: 'Controlar contas a pagar/receber e acompanhar lucro líquido.',
  },
  {
    title: 'Alunos',
    description: 'Gerenciar matrículas e validar pagamento via WhatsApp.',
  },
]

const studentCards = [
  {
    title: 'Catálogo',
    description: 'Visualizar cursos ativos e iniciar inscrição rapidamente.',
  },
  {
    title: 'Meus cursos',
    description: 'Acessar somente cursos aprovados para o seu perfil.',
  },
  {
    title: 'Feedback',
    description: 'Responder questionários e avaliar a experiência.',
  },
]

export function HomePage({ role }: HomePageProps) {
  const cards = role === 'admin' ? adminCards : studentCards

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
          {role === 'admin' ? 'Painel do Administrador' : 'Painel do Aluno'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
          Base dos layouts criada com foco em navegação responsiva para celular e
          desktop, com suporte aos temas claro e escuro.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
