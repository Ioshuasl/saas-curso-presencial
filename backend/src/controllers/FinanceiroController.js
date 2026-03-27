import ContaPagarService from '../services/ContaPagarService.js'
import ContaReceberService from '../services/ContaReceberService.js'
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js'

function parseDateYmd(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function minYmdString(values = []) {
  const normalized = values
    .filter((v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v))
    .map((v) => v.slice(0, 10))
  if (!normalized.length) return null
  normalized.sort()
  return normalized[0]
}

function inRange(date, start, end) {
  if (!date) return false
  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

function normalizeIncomeStatus(parcelas = []) {
  const total = parcelas.length
  const pagos = parcelas.filter((p) => Boolean(p.pago)).length

  if (total > 0 && pagos === total) return 'PAGO'
  if (pagos > 0) return 'PARCIAL'
  return 'PENDENTE'
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function normalizeString(value) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

class FinanceiroController {
  async transactions(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req)

      const page = parsePositiveInt(req.query.page, 1)
      const limit = Math.min(100, parsePositiveInt(req.query.limit, 50))
      const offset = (page - 1) * limit
      const perFetch = Math.max(200, limit * 5)

      const dataInicio = parseDateYmd(req.query.dataInicio)
      const dataFim = parseDateYmd(req.query.dataFim)
      const dataFimInclusive = dataFim
        ? new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59, 999)
        : null

      const statusQuery = normalizeString(req.query.status)?.toUpperCase()
      const typeQuery = normalizeString(req.query.type)?.toUpperCase()
      const categoriaQuery = normalizeString(req.query.categoria)?.toLowerCase()
      const searchQuery = normalizeString(req.query.search)?.toLowerCase()

      const allowedExpenseStatuses = new Set(['PENDENTE', 'PAGO', 'ATRASADO'])
      const statusFilterExpense = statusQuery && allowedExpenseStatuses.has(statusQuery) ? statusQuery : undefined

      const [pagarRes, receberRes] = await Promise.all([
        ContaPagarService.findAll(tenantId, {
          page: 1,
          limit: perFetch,
          status: statusFilterExpense,
          categoria: categoriaQuery,
          data_vencimento_inicio:
            dataInicio
              ? `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}-${String(dataInicio.getDate()).padStart(2, '0')}`
              : undefined,
          data_vencimento_fim:
            dataFim
              ? `${dataFim.getFullYear()}-${String(dataFim.getMonth() + 1).padStart(2, '0')}-${String(dataFim.getDate()).padStart(2, '0')}`
              : undefined,
        }),
        ContaReceberService.findAll(tenantId, {
          page: 1,
          limit: perFetch,
        }),
      ])

      // Defesa em profundidade:
      // mesmo com os services já tenant-scoped, filtramos novamente por tenant_id
      // para evitar qualquer vazamento por dado legado inconsistente.
      const pagarRows = (pagarRes?.data ?? []).filter(
        (c) => Number(c?.tenant_id) === Number(tenantId),
      )
      const receberRows = (receberRes?.data ?? []).filter(
        (c) => Number(c?.tenant_id) === Number(tenantId),
      )

      const transactions = [
        ...pagarRows.map((c) => ({
          id: c.id,
          descricao: c.descricao,
          categoria: c.categoria,
          valor: Number(c.valor ?? 0),
          dataVencimento: c.data_vencimento,
          dataLancamento: c.createdAt ?? null,
          status: c.status,
          observacoes: c.observacao ?? null,
          type: 'EXPENSE',
          hasLink: Boolean(c.curso_id),
        })),
        ...receberRows.map((c) => {
          const parcelas = (c.parcelas ?? []).filter(
            (p) => Number(p?.tenant_id) === Number(tenantId),
          )
          const parcelasTotal = parcelas.length
          const parcelasPagas = parcelas.filter((p) => Boolean(p.pago)).length
          const dataVenc = minYmdString(parcelas.map((p) => p.data_vencimento))

          return {
            id: c.id,
            descricao: c.observacao ? String(c.observacao) : `Recebimento - Curso ${c.Curso?.nome ?? ''}`.trim(),
            categoria: c.Curso?.nome ?? c.forma_pagamento,
            valor: Number(c.valor_total ?? 0),
            dataVencimento: dataVenc,
            dataLancamento: c.createdAt ?? null,
            status: normalizeIncomeStatus(parcelas),
            observacoes: c.observacao ?? null,
            type: 'INCOME',
            hasLink: Boolean(parcelas.length),
            parcelasPagas,
            parcelasTotal,
          }
        }),
      ]

      const filtered = transactions.filter((t) => {
        const typeMatch =
          !typeQuery ||
          typeQuery === 'ALL' ||
          (typeQuery === 'INCOME' && t.type === 'INCOME') ||
          (typeQuery === 'EXPENSE' && t.type === 'EXPENSE')

        if (!typeMatch) return false

        if (statusQuery && statusQuery !== 'ALL') {
          const normalized = String(t.status ?? '').toUpperCase()
          if (normalized !== statusQuery) return false
        }

        if (categoriaQuery) {
          const categoria = String(t.categoria ?? '').toLowerCase()
          if (!categoria.includes(categoriaQuery)) return false
        }

        if (searchQuery) {
          const descricao = String(t.descricao ?? '').toLowerCase()
          const categoria = String(t.categoria ?? '').toLowerCase()
          if (!descricao.includes(searchQuery) && !categoria.includes(searchQuery)) return false
        }

        if (!dataInicio && !dataFimInclusive) return true

        const due = t.dataVencimento ? parseDateYmd(t.dataVencimento) : null
        return inRange(due, dataInicio, dataFimInclusive)
      })

      filtered.sort((a, b) => {
        const ad = a.dataVencimento ? parseDateYmd(a.dataVencimento) : null
        const bd = b.dataVencimento ? parseDateYmd(b.dataVencimento) : null
        return (ad?.getTime() ?? 0) - (bd?.getTime() ?? 0)
      })

      const data = filtered.slice(offset, offset + limit)
      return res.json({
        data,
        paginacao: {
          total: filtered.length,
          total_paginas: Math.max(1, Math.ceil(filtered.length / limit)),
          pagina: page,
          por_pagina: limit,
        },
      })
    } catch (error) {
      return res.status(500).json({ error: error?.message || 'Erro ao buscar transacoes' })
    }
  }

  /**
   * Soma de `valor_total` em contas a receber (receita contratada no cadastro).
   * Query opcional: dataInicio, dataFim (YYYY-MM-DD) — filtra por data de lançamento (`created_at`).
   */
  async totalContasReceber(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req)
      const filtros = buildDateFiltros(req.query)
      const valor_total = await ContaReceberService.sumValorTotal(tenantId, filtros)
      return res.json({ valor_total })
    } catch (error) {
      return res.status(500).json({ error: error?.message || 'Erro ao totalizar contas a receber' })
    }
  }

  /**
   * Soma de `valor` em contas a pagar (despesas).
   * Query opcional: dataInicio, dataFim (YYYY-MM-DD) — filtra por `data_vencimento`.
   */
  async totalContasPagar(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req)
      const filtros = buildDateFiltros(req.query)
      const valor_total = await ContaPagarService.sumValor(tenantId, filtros)
      return res.json({ valor_total })
    } catch (error) {
      return res.status(500).json({ error: error?.message || 'Erro ao totalizar contas a pagar' })
    }
  }
}

function buildDateFiltros(query) {
  const out = {}
  const di = normalizeString(query?.dataInicio)
  const df = normalizeString(query?.dataFim)
  if (di && /^\d{4}-\d{2}-\d{2}$/.test(di)) out.data_inicio = di
  if (df && /^\d{4}-\d{2}-\d{2}$/.test(df)) out.data_fim = df
  return out
}

export default new FinanceiroController()

