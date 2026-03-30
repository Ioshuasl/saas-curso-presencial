export type CnpjLookupResult = {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  representanteNome: string
}

function onlyDigits(value: string) {
  return String(value ?? '').replace(/\D/g, '')
}

export async function consultarCnpjViaBrasilApi(cnpj: string): Promise<CnpjLookupResult> {
  const normalized = onlyDigits(cnpj)
  if (normalized.length !== 14) {
    throw new Error('CNPJ inválido para consulta')
  }

  const url = `https://brasilapi.com.br/api/cnpj/v1/${normalized}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CNPJ')
  }

  const data = (await response.json()) as Record<string, unknown>
  const qsa = Array.isArray(data.qsa) ? (data.qsa as Array<Record<string, unknown>>) : []
  const primeiroSocio = qsa[0]

  return {
    cnpj: normalized,
    razaoSocial: String(data.razao_social ?? ''),
    nomeFantasia: String(data.nome_fantasia ?? ''),
    cep: String(data.cep ?? ''),
    endereco: String(data.logradouro ?? ''),
    bairro: String(data.bairro ?? ''),
    cidade: String(data.municipio ?? ''),
    estado: String(data.uf ?? ''),
    representanteNome: String(primeiroSocio?.nome_socio ?? ''),
  }
}

