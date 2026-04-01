export type ConfigTab = 'geral' | 'seguranca'

export type PessoaTipo = 'PF' | 'PJ'

export type GeralForm = {
  tipoPessoa: PessoaTipo
  logoUrl: string
  logoKey: string
  pfNome: string
  pfCpf: string
  pjRazaoSocial: string
  pjNomeFantasia: string
  pjCnpj: string
  pjRepresentanteNome: string
  pjRepresentanteCpf: string
  email: string
  telefone: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
}

export type SegurancaForm = {
  certificadoA1Url: string
  certificadoA1Key: string
  certificadoSenha: string
}

export const initialGeral: GeralForm = {
  tipoPessoa: 'PF',
  logoUrl: '',
  logoKey: '',
  pfNome: '',
  pfCpf: '',
  pjRazaoSocial: '',
  pjNomeFantasia: '',
  pjCnpj: '',
  pjRepresentanteNome: '',
  pjRepresentanteCpf: '',
  email: '',
  telefone: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
}

export const initialSeguranca: SegurancaForm = {
  certificadoA1Url: '',
  certificadoA1Key: '',
  certificadoSenha: '',
}
