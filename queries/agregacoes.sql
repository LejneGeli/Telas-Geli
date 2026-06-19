-- Relatório de faturamento estimado por status.
SELECT
  status,
  COUNT(*) AS quantidade_pedidos,
  SUM(total_estimated_price) AS valor_total_estimado,
  AVG(total_estimated_price) AS ticket_medio
FROM service_requests
GROUP BY status
ORDER BY valor_total_estimado DESC;

-- Relatório de pedidos por bairro.
SELECT
  a.neighborhood,
  COUNT(sr.id) AS total_pedidos
FROM service_requests sr
JOIN addresses a ON a.id = sr.address_id
GROUP BY a.neighborhood
ORDER BY total_pedidos DESC;

-- Relatório de visitas por profissional.
SELECT
  u.name AS profissional,
  mv.status,
  COUNT(mv.id) AS total_visitas
FROM measurement_visits mv
JOIN users u ON u.id = mv.professional_id
GROUP BY u.name, mv.status
ORDER BY u.name, mv.status;
