-- 1. Pedidos pendentes ou aguardando medição com dados do cliente.
-- Importância: usado pelo atendente para priorizar contatos e visitas.
EXPLAIN ANALYZE
SELECT
  sr.id AS pedido_id,
  sr.status,
  sr.measurement_required,
  c.name AS cliente,
  c.phone,
  a.city,
  a.neighborhood,
  sr.created_at
FROM service_requests sr
JOIN customers c ON c.id = sr.customer_id
JOIN addresses a ON a.id = sr.address_id
WHERE sr.status IN ('pending', 'waiting_measurement')
ORDER BY sr.created_at DESC;

-- 2. Total estimado por pedido calculado pelos itens.
-- Importância: valida se o valor total do pedido está coerente com os itens cadastrados.
EXPLAIN ANALYZE
SELECT
  sr.id AS pedido_id,
  c.name AS cliente,
  SUM(ri.total_price) AS total_calculado
FROM service_requests sr
JOIN customers c ON c.id = sr.customer_id
JOIN request_items ri ON ri.service_request_id = sr.id
GROUP BY sr.id, c.name
ORDER BY total_calculado DESC;

-- 3. Tipos de tela mais solicitados.
-- Importância: relatório para estoque e planejamento comercial.
EXPLAIN ANALYZE
SELECT
  st.name,
  COUNT(ri.id) AS quantidade_de_itens,
  SUM(ri.quantity) AS unidades_solicitadas,
  SUM(ri.total_price) AS valor_total
FROM request_items ri
JOIN screen_types st ON st.id = ri.screen_type_id
GROUP BY st.id, st.name
ORDER BY unidades_solicitadas DESC;

-- 4. Visitas técnicas agendadas por profissional e período.
-- Importância: agenda operacional do profissional que mede as telas.
EXPLAIN ANALYZE
SELECT
  mv.id AS visita_id,
  u.name AS profissional,
  c.name AS cliente,
  mv.scheduled_date,
  mv.status,
  a.street,
  a.number,
  a.neighborhood
FROM measurement_visits mv
JOIN users u ON u.id = mv.professional_id
JOIN service_requests sr ON sr.id = mv.service_request_id
JOIN customers c ON c.id = sr.customer_id
JOIN addresses a ON a.id = sr.address_id
WHERE mv.scheduled_date BETWEEN '2026-07-01' AND '2026-07-31'
ORDER BY mv.scheduled_date ASC;

-- 5. Clientes com maior volume de pedidos.
-- Importância: relatório comercial para identificar clientes recorrentes.
EXPLAIN ANALYZE
SELECT
  c.id,
  c.name,
  c.phone,
  COUNT(sr.id) AS total_pedidos,
  SUM(sr.total_estimated_price) AS valor_estimado_total
FROM customers c
JOIN service_requests sr ON sr.customer_id = c.id
GROUP BY c.id, c.name, c.phone
ORDER BY total_pedidos DESC, valor_estimado_total DESC;

-- 6. Pedidos que ainda não possuem medidas completas.
-- Importância: identifica solicitações que dependem da visita técnica antes do orçamento final.
EXPLAIN ANALYZE
SELECT
  sr.id AS pedido_id,
  c.name AS cliente,
  ri.id AS item_id,
  st.name AS tipo_tela,
  ri.room,
  ri.width,
  ri.height
FROM request_items ri
JOIN service_requests sr ON sr.id = ri.service_request_id
JOIN customers c ON c.id = sr.customer_id
JOIN screen_types st ON st.id = ri.screen_type_id
WHERE ri.width IS NULL OR ri.height IS NULL
ORDER BY sr.id;
