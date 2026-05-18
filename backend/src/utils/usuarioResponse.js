/**
 * Normaliza instância Sequelize de Usuario para resposta da API (/me, login, etc.).
 * Expõe campos de perfil no nível raiz e mantém objetos aninhados perfil_*.
 */
export function formatUsuarioResponse(usuario) {
  if (!usuario) return null;

  const plain =
    typeof usuario.toJSON === 'function' ? usuario.toJSON() : { ...usuario };

  delete plain.senha_hash;

  const perfilAdmin = plain.perfil_admin ?? null;
  const perfilAluno = plain.perfil_aluno ?? null;
  const tenant = plain.Tenant ?? plain.tenant ?? null;

  if (plain.Tenant) delete plain.Tenant;

  const role = plain.role;
  const tipo =
    role === 'ALUNO' ? 'ALUNO' : role === 'SAAS_ADMIN' ? 'SAAS_ADMIN' : 'ADMIN';

  const formatted = {
    ...plain,
    tipo,
    tenant,
    nome_completo:
      perfilAluno?.nome_completo ??
      perfilAdmin?.nome_completo ??
      plain.nome_completo ??
      null,
  };

  if (perfilAluno) {
    formatted.telefone = perfilAluno.telefone ?? null;
    formatted.cidade = perfilAluno.cidade ?? null;
    formatted.profissao = perfilAluno.profissao ?? null;
    formatted.biografia = perfilAluno.biografia ?? null;
  }

  return formatted;
}
