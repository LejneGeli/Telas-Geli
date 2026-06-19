# Justificativa de Arquitetura

## Tema do sistema

O projeto é uma API REST para um comércio de telas mosqueteiras. O sistema registra clientes interessados, endereços de instalação, tipos de telas/serviços disponíveis, solicitações de orçamento, visitas técnicas de medição e itens do pedido.

## Escolha tecnológica

- Backend: Node.js 24 com Express.
- ORM: Sequelize.
- Banco principal: PostgreSQL 17.
- Cache: Redis.
- Proxy reverso: Nginx.
- Infraestrutura: Docker Compose.

A escolha por PostgreSQL foi feita porque o domínio possui dados relacionais bem definidos: cliente, endereço, pedido, visita e itens do pedido. A relação N:N entre pedidos e tipos de tela é resolvida pela tabela pivô `request_items`.

## Requisitos do sistema

- Objetivo: gerenciar solicitações de orçamento e visitas técnicas para telas mosqueteiras.
- Entidades principais: usuários, clientes, endereços, tipos de tela, solicitações, visitas e itens.
- Volume estimado inicial: centenas de clientes e pedidos por semestre.
- Usuários estimados: atendentes, administradores e profissionais de medição.
- Consultas principais: pedidos por status, agenda de visitas, itens por pedido, tipos de tela mais solicitados e clientes com maior número de pedidos.

## Fluxo de negócio

1. O cliente entra em contato solicitando telas mosqueteiras.
2. O atendente registra o cliente e o endereço.
3. O pedido é criado com `measurement_required = true` se o cliente não souber medir.
4. O profissional agenda uma visita técnica.
5. Após a visita, os itens são preenchidos com largura, altura, quantidade e ambiente.
6. O orçamento é finalizado com base nos itens medidos.

## Infraestrutura Docker

A opção escolhida foi Docker local/orquestração com Compose.

Serviços:

- `nginx`: único serviço exposto ao host, atua como proxy reverso.
- `app`: servidor Node.js privado, acessível apenas pela rede interna Docker.
- `postgres`: banco de dados relacional com named volume.
- `redis`: cache com named volume.
- `node-cli`: serviço auxiliar para executar comandos como migrations e seed.

Fluxo:

```txt
Host -> Nginx -> Node.js API -> PostgreSQL
                         -> Redis
```

## Segurança

- O servidor Node.js não publica portas para o host.
- O acesso externo acontece somente via Nginx.
- Todas as rotas de negócio são protegidas por JWT, exceto `/login`, `/health` e `/api-docs`.
- Senhas são armazenadas com bcrypt.
- Variáveis sensíveis ficam em variáveis de ambiente e `.env.example`, sem senhas reais de produção.

## Persistência

O PostgreSQL usa o named volume `postgres_data`, garantindo que os dados sobrevivam à recriação dos containers. O Redis usa `redis_data`.

## Otimização da imagem

O Dockerfile usa multi-stage build. A etapa `deps` instala dependências em camada separada, e a etapa `runtime` copia apenas o necessário para executar a aplicação. O `.dockerignore` reduz o contexto de build removendo `node_modules`, logs, arquivos locais e pastas de IDE.
