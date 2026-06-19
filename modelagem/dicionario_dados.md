# Dicionário de Dados — Telas Mosqueteiras API

## Visão geral

O sistema gerencia solicitações de orçamento para instalação e manutenção de telas mosqueteiras. O cliente pode informar medidas aproximadas ou solicitar que um profissional realize uma visita técnica de medição antes do orçamento.

## Tabela `users`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador do usuário do sistema. |
| name | varchar(120) | Sim |  | Nome do usuário. |
| email | varchar(180) | Sim | UK | Email usado no login. |
| password_hash | varchar(255) | Sim |  | Senha criptografada com bcrypt. |
| role | enum | Sim |  | Perfil: admin, professional ou attendant. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `customers`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador do cliente/solicitante. |
| name | varchar(140) | Sim |  | Nome do cliente. |
| email | varchar(180) | Não |  | Email de contato. |
| phone | varchar(30) | Sim | IDX | Telefone/WhatsApp. |
| document | varchar(20) | Não | UK | CPF/CNPJ fictício. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `addresses`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador do endereço. |
| customer_id | integer | Sim | FK | Cliente dono do endereço. |
| street | varchar(160) | Sim |  | Rua. |
| number | varchar(20) | Sim |  | Número. |
| neighborhood | varchar(100) | Sim |  | Bairro. |
| city | varchar(100) | Sim | IDX | Cidade. |
| state | char(2) | Sim | IDX | Estado. |
| zip_code | varchar(12) | Sim |  | CEP. |
| complement | varchar(160) | Não |  | Complemento. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `screen_types`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador do tipo de tela/serviço. |
| name | varchar(120) | Sim | UK | Nome do tipo de tela. |
| description | text | Não |  | Descrição do serviço. |
| base_price | numeric(10,2) | Sim |  | Preço base usado no orçamento. |
| is_available | boolean | Sim | IDX | Define se o serviço está disponível. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `service_requests`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador da solicitação. |
| customer_id | integer | Sim | FK/IDX | Cliente solicitante. |
| address_id | integer | Sim | FK/IDX | Endereço da instalação. |
| status | enum | Sim | IDX | pending, waiting_measurement, measured, budget_sent, approved, rejected, scheduled, completed ou cancelled. |
| measurement_required | boolean | Sim |  | Indica se o cliente precisa de visita técnica para tirar medidas. |
| description | text | Não |  | Observações do cliente. |
| preferred_date | date | Não |  | Data preferida para visita/contato. |
| total_estimated_price | numeric(10,2) | Sim |  | Valor total estimado. |
| created_at | timestamp | Sim | IDX | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `measurement_visits`

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador da visita técnica. |
| service_request_id | integer | Sim | FK/IDX | Solicitação relacionada. |
| professional_id | integer | Sim | FK/IDX | Usuário profissional responsável. |
| scheduled_date | timestamp | Sim | IDX | Data e horário da visita. |
| status | enum | Sim | IDX | pending, scheduled, completed ou cancelled. |
| notes | text | Não |  | Observações da visita. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Tabela `request_items`

Tabela pivô que resolve a relação N:N entre `service_requests` e `screen_types`.

| Campo | Tipo | Obrigatório | Chave | Descrição |
|---|---:|---:|---|---|
| id | integer | Sim | PK | Identificador do item. |
| service_request_id | integer | Sim | FK/IDX | Solicitação relacionada. |
| screen_type_id | integer | Sim | FK/IDX | Tipo de tela/serviço solicitado. |
| quantity | integer | Sim |  | Quantidade de itens. |
| width | numeric(8,2) | Não |  | Largura. Pode ser nula antes da visita técnica. |
| height | numeric(8,2) | Não |  | Altura. Pode ser nula antes da visita técnica. |
| room | varchar(80) | Não | IDX | Ambiente: quarto, sala, sacada etc. |
| notes | text | Não |  | Observações do item. |
| unit_price | numeric(10,2) | Sim |  | Preço unitário. |
| total_price | numeric(10,2) | Sim |  | Preço total do item. |
| created_at | timestamp | Sim |  | Data de criação. |
| updated_at | timestamp | Sim |  | Data de atualização. |

## Normalização

### 1FN
Todos os campos são atômicos. Telefones, endereços, medidas e valores foram separados em colunas próprias. Itens de uma solicitação não ficam em uma lista dentro do pedido; são armazenados em `request_items`.

### 2FN
As tabelas possuem chave primária simples. Os atributos dependem diretamente do identificador da própria tabela. Exemplo: dados de endereço ficam em `addresses`, e não em `service_requests`.

### 3FN
Não há dependência transitiva relevante. Dados do cliente ficam em `customers`, dados do tipo de tela ficam em `screen_types`, dados da visita ficam em `measurement_visits` e os pedidos referenciam essas tabelas por chaves estrangeiras.

## Estratégia de indexação

| Campo | Tipo de índice | Motivo |
|---|---|---|
| users.email | B-Tree único | Login e garantia de email único. |
| customers.phone | B-Tree | Busca rápida por telefone/WhatsApp. |
| customers.email | B-Tree | Busca por email. |
| customers.document | B-Tree único | Evita CPF/CNPJ duplicado. |
| addresses.customer_id | B-Tree | JOIN entre cliente e endereços. |
| addresses.city, addresses.state | B-Tree composto | Relatórios por localização. |
| service_requests.status | B-Tree | Filtro por etapa do pedido. |
| service_requests.created_at | B-Tree | Filtros por período. |
| measurement_visits.scheduled_date | B-Tree | Agenda de visitas técnicas. |
| request_items.service_request_id | B-Tree | JOIN entre pedido e itens. |
| request_items.screen_type_id | B-Tree | Relatórios por tipo de tela. |
