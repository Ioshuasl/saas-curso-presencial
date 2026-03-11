# Documentação do Saas

## 1. Visão Geral do Sistema

O sistema é uma plataforma **SaaS (Software as a Service)** focada na gestão completa de eventos físicos. Ele permite desde o cadastro inicial de cursos até o controle financeiro detalhado e coleta de feedbacks pós-evento.

## 2. Painel do Administrador (Gestor do Negócio)

O administrador possui **acesso total** a todos os dados e funcionalidades do sistema.

### A. Gestão de Cursos e Eventos

* **Criação de Conteúdo:** Cadastrar cursos definindo nome, ministrante, descrição e conteúdo programático .

* **Logística:** Definir local, datas e horários específicos (sessões) para cada evento .

* **Controle de Vagas:** Estipular o limite de participantes e o valor do investimento.

* **Status:** Ativar ou desativar cursos conforme a disponibilidade.

### B. Gestão de Alunos e Matrículas

* **Controle de Acesso:** Visualizar todos os alunos e editar seus perfis quando necessário.

* **Vínculo Manual:** Matricular alunos em cursos específicos e acompanhar seu histórico.

* **Validação de Pagamento:** Validar manualmente os comprovantes enviados via WhatsApp para liberar o acesso do aluno.

### C. Financeiro e Dashboards

* **Fluxo de Caixa:** Registrar contas a pagar (despesas por categoria) e gerenciar contas a receber (parcelas e status de pagamento) .

* **Painel de Controle:** Dashboard com calendário de cursos do dia, lembretes de vencimentos financeiros e resumo de lucro acumulado .

* **Relatórios de Performance:** Analisar por curso o total de inscritos, taxa de presença e o lucro líquido (Receita - Despesa) .

### D. Comunicação e Presença

* **Notificações:** Receber um resumo diário via WhatsApp com a agenda e obrigações financeiras do dia.

* **Chamada Digital:** Registrar manualmente a presença dos alunos durante o evento.

## 3. Painel do Aluno (Cliente)

O aluno possui acesso restrito apenas aos seus próprios dados e aos cursos adquiridos.

### A. Experiência de Compra e Inscrição

* **Catálogo:** Visualizar cursos disponíveis para inscrição.


* **Checkout via WhatsApp:** Selecionar o curso e ser direcionado automaticamente para o WhatsApp para finalizar o pagamento.


* **Status de Pagamento:** Acompanhar se sua inscrição já foi validada pelo administrador.



### B. Área do Aluno

* **Meus Cursos:** Acessar a lista de cursos onde a inscrição foi aprovada.


* **Perfil Personalizado:** Editar informações como cidade, profissão e biografia .


* **Interatividade:** Confirmar sua própria presença no evento e responder a questionários.



### C. Engajamento e Avaliação

* **Questionário Inicial:** Relatar suas maiores dores e expectativas assim que o curso é liberado .


* **Feedback Final:** Avaliar o curso com estrelas e descrever o impacto do aprendizado em sua vida após o término .

# Desenvolvimento

* Comando para rodar o conteiner docker para ambiente de desenvolvimento

```
docker run --name pg-saas -e POSTGRES_DB=saas-cabelereiro -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=123 -p 5432:5432 -d postgres
```
