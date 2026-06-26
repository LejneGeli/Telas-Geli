# Telas Mosqueteiras API

API REST para gerenciamento de solicitações de orçamento, visitas técnicas de medição e pedidos de um comércio de telas mosqueteiras.

## 1. Identificação do projeto

**Título:** Telas Mosqueteiras API

**Descrição:** sistema backend, sem frontend, para cadastrar clientes, endereços, tipos de telas/serviços, solicitações de orçamento, visitas técnicas de medição e itens do pedido.

**Caminho escolhido:** Opção A — Docker/Orquestração Local.

## 2. Arquitetura

O servidor Node.js fica privado e não possui porta publicada diretamente para o host. O acesso externo acontece somente pelo Nginx, que funciona como proxy reverso.

```txt
Host -> Nginx -> Node Web Server -> PostgreSQL
                              -> Redis
```

O fluxo esperado da aplicação é:

```txt
Usuário -> http://localhost:8080 -> Nginx -> app:3000 -> PostgreSQL
```

## 3. Containers utilizados

| Container | Função                       | Exposto ao host? |
| --------- | ---------------------------- | ---------------- |
| nginx     | Proxy reverso                | Sim, porta 8080  |
| app       | API Node.js/Express          | Não              |
| postgres  | Banco de dados PostgreSQL 17 | Não              |
| redis     | Cache Redis                  | Não              |
| node-cli  | Execução de comandos CLI     | Não, profile cli |

## 4. Tecnologias utilizadas

* Node.js 24
* Express
* PostgreSQL 17
* Sequelize
* Driver pg
* JWT
* bcrypt
* Swagger
* Docker
* Docker Compose
* Nginx
* Redis

## 5. Pré-requisitos

* Docker Desktop instalado.
* Docker Compose disponível pelo comando `docker compose`.
* Terminal aberto na raiz do projeto.

## 6. Como executar o projeto com Docker

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Esse comando cria e inicia os containers necessários para o funcionamento da aplicação.

A API ficará disponível pelo Nginx em:

```txt
http://localhost:8080
```

A documentação Swagger ficará disponível em:

```txt
http://localhost:8080/api-docs
```

O servidor Node.js não deve ser acessado diretamente pelo host. O acesso externo deve acontecer somente pela porta do Nginx.

## 7. Migrations e seed

O container `app` executa as migrations e o seed automaticamente ao iniciar.

Também é possível executar os comandos manualmente pelo container CLI.

### Executar migrations manualmente

```bash
docker compose run --rm node-cli migrate
```

### Executar seed manualmente

```bash
docker compose run --rm node-cli seed
```

### Resetar o banco, recriar as tabelas e popular novamente

```bash
docker compose run --rm node-cli reset
```

## 8. Login e uso do JWT

O seed cria um usuário administrador padrão:

```txt
Email: admin@mosquiteiras.local
Senha: 123456
```

Para fazer login, execute:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mosquiteiras.local","password":"123456"}'
```

A resposta retornará um token JWT.

Exemplo de resposta:

```json
{
  "token": "SEU_TOKEN_JWT"
}
```

Copie o valor do campo `token`.

Depois, use o token nas rotas protegidas:

```bash
curl http://localhost:8080/customers \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Todas as rotas da API são protegidas por JWT, exceto:

```txt
POST /login
GET /api-docs
```

## 9. Testar saúde da aplicação

A rota de saúde também é protegida por JWT.

Depois de realizar login e copiar o token, execute:

```bash
curl http://localhost:8080/health \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 10. Swagger

A documentação Swagger está disponível em:

```txt
http://localhost:8080/api-docs
```

O Swagger documenta as rotas principais da API, incluindo as operações de:

```txt
list
get
create
update
delete
```

Também estão documentadas as rotas relacionadas à tabela pivô `request_items`.

## 11. Rotas principais

### Autenticação

```txt
POST /login
```

### Usuários

```txt
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
```

### Clientes

```txt
GET    /customers
GET    /customers/:id
POST   /customers
PUT    /customers/:id
DELETE /customers/:id
```

### Endereços

```txt
GET    /addresses
GET    /addresses/:id
POST   /addresses
PUT    /addresses/:id
DELETE /addresses/:id
```

### Tipos de tela/serviço

```txt
GET    /screen-types
GET    /screen-types/:id
POST   /screen-types
PUT    /screen-types/:id
DELETE /screen-types/:id
```

### Solicitações de orçamento/serviço

```txt
GET    /service-requests
GET    /service-requests/:id
POST   /service-requests
PUT    /service-requests/:id
DELETE /service-requests/:id
```

### Itens do pedido — tabela pivô

```txt
GET    /request-items
GET    /request-items/:id
POST   /request-items
PUT    /request-items/:id
DELETE /request-items/:id
```

### Visitas técnicas de medição

```txt
GET    /measurement-visits
GET    /measurement-visits/:id
POST   /measurement-visits
PUT    /measurement-visits/:id
DELETE /measurement-visits/:id
```

## 12. Banco de dados

Banco escolhido: PostgreSQL 17.

Justificativa: o domínio do sistema é relacional. O projeto possui clientes, endereços, solicitações de orçamento, visitas técnicas e itens de pedido. A relação N:N entre solicitações e tipos de tela é resolvida pela tabela pivô `request_items`.

Tabelas principais:

```txt
users
customers
addresses
screen_types
service_requests
measurement_visits
request_items
migrations
```

Relações principais:

```txt
customers 1:N addresses
customers 1:N service_requests
addresses 1:N service_requests
service_requests 1:N measurement_visits
users 1:N measurement_visits
service_requests N:N screen_types por meio de request_items
```

A tabela `request_items` funciona como tabela pivô e também possui Model própria.

## 13. Evidências de funcionamento

### Ver containers em execução

```bash
docker compose ps
```

### Ver logs da aplicação

```bash
docker compose logs -f app
```

### Ver logs do Nginx

```bash
docker compose logs -f nginx
```

### Ver rede interna e DNS do Docker

```bash
docker network inspect telas-mosqueteiras-api_backend
```

Dentro da rede, os containers se comunicam por nome de serviço:

```txt
nginx -> app:3000
app -> postgres:5432
app -> redis:6379
```

Não há uso de IP fixo entre containers.

## 14. Provar que o Node.js não está exposto diretamente

O serviço `app` usa apenas `expose: 3000`, sem `ports`.

Por isso, o host acessa a API somente pelo Nginx:

```txt
http://localhost:8080
```

A arquitetura final fica:

```txt
Host -> Nginx -> Node Web Server -> PostgreSQL
```

## 15. Provar persistência do banco

1. Suba o projeto:

```bash
docker compose up --build
```

2. Faça login e copie o token JWT.

3. Liste clientes pela API:

```bash
curl http://localhost:8080/customers \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

4. Pare os containers sem apagar volumes:

```bash
docker compose down
```

5. Suba novamente:

```bash
docker compose up --build
```

6. Faça login novamente e liste os clientes outra vez.

Os dados permanecem porque o PostgreSQL usa o named volume `postgres_data`.

## 16. Arquivos importantes para avaliação

```txt
Dockerfile
.dockerignore
docker-compose.yml
nginx/default.conf
web.js
command.js
src/app.js
src/routes/index.js
src/controllers
src/models
src/middlewares
src/database/migrationRunner.js
src/seeders/seed.js
src/swagger/swagger.yaml
modelagem/dicionario_dados.md
modelagem/modelo_logico.md
modelagem/der.png
modelagem/modelo_logico.png
scripts/setup.sql
scripts/seed.sql
queries/crud.sql
queries/consultas_avancadas.sql
queries/agregacoes.sql
justificativa/arquitetura.md
```

## 17. Troubleshooting

### O comando `docker compose up --build` falhou

Tente parar os containers antigos do projeto:

```bash
docker compose down
```

Depois suba novamente:

```bash
docker compose up --build
```

### Porta 8080 ocupada

Altere a porta no `docker-compose.yml`.

De:

```yaml
ports:
  - "8080:80"
```

Para:

```yaml
ports:
  - "8081:80"
```

Depois acesse:

```txt
http://localhost:8081
```

### Apagar tudo, inclusive banco de dados

Atenção: este comando remove os dados persistidos.

```bash
docker compose down -v
```

Depois suba novamente:

```bash
docker compose up --build
```

## 18. Observação sobre segredos

O projeto usa variáveis de ambiente.

Nunca devem ser commitadas senhas reais, tokens reais ou chaves de produção.

O arquivo `.env.example` serve apenas como modelo para configuração do ambiente.

## 19. Resumo dos comandos principais

Subir o projeto completo:

```bash
docker compose up --build
```

Executar migrations manualmente:

```bash
docker compose run --rm node-cli migrate
```

Executar seed manualmente:

```bash
docker compose run --rm node-cli seed
```

Resetar banco:

```bash
docker compose run --rm node-cli reset
```

Ver containers:

```bash
docker compose ps
```

Fazer login:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mosquiteiras.local","password":"123456"}'
```

Testar rota protegida:

```bash
curl http://localhost:8080/customers \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Acessar Swagger:

```txt
http://localhost:8080/api-docs
```
