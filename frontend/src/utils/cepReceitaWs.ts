export type CepLookupResult = {
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
}

function onlyDigits(value: string) {
  return String(value ?? '').replace(/\D/g, '')
}

/**
 * Consulta CEP.
 * Observação: a API ReceitaWS é voltada a CNPJ e pode não expor CEP.
 * Para manter robustez em desenvolvimento, usamos fallback para BrasilAPI.
 */
export async function consultarCepViaReceitaWs(cep: string): Promise<CepLookupResult> {
  const normalized = onlyDigits(cep)
  if (normalized.length !== 8) {
    throw new Error('CEP inválido para consulta')
  }

  // Tentativa 1: endpoint nomeado conforme pedido.
  try {
    const receitaWsUrl = `https://www.receitaws.com.br/v1/cep/${normalized}`
    const res = await fetch(receitaWsUrl)
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>
      const endereco = String(data.logradouro ?? data.endereco ?? '')
      const bairro = String(data.bairro ?? '')
      const cidade = String(data.municipio ?? data.cidade ?? '')
      const estado = String(data.uf ?? data.estado ?? '')
      if (endereco || bairro || cidade || estado) {
        return {
          cep: normalized,
          endereco,
          bairro,
          cidade,
          estado,
        }
      }
    }
  } catch {
    // ignora e segue fallback
  }

  // Fallback: BrasilAPI (confiável para CEP em ambiente de desenvolvimento).
  const brasilApiUrl = `https://brasilapi.com.br/api/cep/v2/${normalized}`
  const response = await fetch(brasilApiUrl)
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP')
  }
  const data = (await response.json()) as Record<string, unknown>

  return {
    cep: normalized,
    endereco: String(data.street ?? ''),
    bairro: String(data.neighborhood ?? ''),
    cidade: String(data.city ?? ''),
    estado: String(data.state ?? ''),
  }
}

