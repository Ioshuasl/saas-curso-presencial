import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middlewares/auth.js'
import FinanceiroController from '../controllers/FinanceiroController.js'

const routes = new Router()

function preventTenantOverride(req, res, next) {
  const requestedTenantId = req.query?.tenant_id
  const requestedTenantSlug = req.query?.tenant_slug

  if (
    (requestedTenantId != null && String(requestedTenantId).trim() !== '') ||
    (requestedTenantSlug != null && String(requestedTenantSlug).trim() !== '')
  ) {
    return res.status(403).json({
      error:
        'Nao e permitido informar tenant_id/tenant_slug nesta rota. O tenant vem do token autenticado.',
    })
  }

  return next()
}

// Todas as rotas de financeiro são restritas a administradores
routes.use(authMiddleware, adminOnly)
routes.use(preventTenantOverride)

/**
 * Retorna transacoes unificadas (despesas + receitas) em um formato normalizado.
 */
routes.get('/transactions', FinanceiroController.transactions)

/**
 * Totais para indicadores (receita x despesa x lucro = receita - despesa no cliente).
 * Query opcional: dataInicio, dataFim (YYYY-MM-DD) — ver doc em cada handler.
 */
routes.get('/totais/receber', FinanceiroController.totalContasReceber)
routes.get('/totais/pagar', FinanceiroController.totalContasPagar)

export default routes

