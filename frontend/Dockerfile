# --- Estágio 1: Build da Aplicação ---
# Utiliza uma imagem Node.js na versão LTS (Long Term Support) para construir o projeto.
# A tag 'alpine' indica uma versão leve do sistema operacional.
FROM node:22-alpine AS build

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de manifesto de pacotes.
COPY package.json package-lock.json* ./

# Instala todas as dependências, incluindo as de desenvolvimento,
# que são necessárias para o processo de build do Vite e TypeScript.
RUN npm ci

# Copia o restante do código-fonte da aplicação.
COPY . .

# Variáveis do Vite precisam existir no build (não no runtime do Nginx).
ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=production
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_ENV=${VITE_APP_ENV}

# Executa o comando de build definido no package.json.
# Isso irá compilar o TypeScript e gerar os arquivos estáticos na pasta /dist.
RUN npm run build

# --- Estágio 2: Servidor de Produção ---
# Utiliza uma imagem oficial e super leve do Nginx para servir os arquivos estáticos.
FROM nginx:stable-alpine

# Remove a configuração padrão do Nginx.
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração personalizada do Nginx para o contêiner.
# Este arquivo (nginx.conf) será criado no próximo passo.
COPY nginx.conf /etc/nginx/conf.d

# Copia os arquivos estáticos gerados no estágio de 'build' para a pasta
# que o Nginx usa para servir conteúdo web.
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx.
# O Easypanel irá gerenciar o mapeamento desta porta para o mundo externo.
EXPOSE 80

# Comando para iniciar o servidor Nginx em modo 'daemon off',
# o que mantém o contêiner rodando.
CMD ["nginx", "-g", "daemon off;"]