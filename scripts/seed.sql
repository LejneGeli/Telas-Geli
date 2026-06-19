-- Script de carga inicial de referência para Banco de Dados.
-- A aplicação possui seed em JavaScript, mas este arquivo mostra uma carga SQL com mais de 100 registros.

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Administrador Mosquiteiras', 'admin@mosquiteiras.local', '$2b$10$senha_hash_exemplo', 'admin'),
  ('Profissional de Medição', 'profissional@mosquiteiras.local', '$2b$10$senha_hash_exemplo', 'professional'),
  ('Atendente Comercial', 'atendente@mosquiteiras.local', '$2b$10$senha_hash_exemplo', 'attendant')
ON CONFLICT (email) DO NOTHING;

INSERT INTO screen_types (name, description, base_price, is_available)
VALUES
  ('Tela mosquiteira fixa', 'Modelo fixo para janelas pequenas e médias.', 140.00, TRUE),
  ('Tela mosquiteira de correr', 'Modelo de correr para portas e janelas com trilho.', 220.00, TRUE),
  ('Tela mosquiteira magnética', 'Modelo removível com fechamento magnético.', 190.00, TRUE),
  ('Tela mosquiteira enrolável', 'Modelo retrátil para portas e janelas.', 280.00, TRUE),
  ('Tela para porta de sacada', 'Instalação indicada para portas maiores.', 320.00, TRUE),
  ('Manutenção de tela', 'Reparo ou ajuste em tela já instalada.', 90.00, TRUE),
  ('Troca de tela danificada', 'Substituição de malha danificada.', 120.00, TRUE),
  ('Visita técnica de medição', 'Serviço para medir os vãos antes do orçamento.', 0.00, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO customers (name, email, phone, document)
SELECT
  'Cliente Teste ' || n,
  'cliente' || n || '@email.com',
  '1198' || LPAD(n::TEXT, 7, '0'),
  LPAD(n::TEXT, 11, '0')
FROM generate_series(1, 40) AS n
ON CONFLICT (document) DO NOTHING;

INSERT INTO addresses (customer_id, street, number, neighborhood, city, state, zip_code, complement)
SELECT
  c.id,
  'Rua Exemplo ' || c.id,
  (100 + c.id)::TEXT,
  CASE WHEN c.id % 2 = 0 THEN 'Centro' ELSE 'Jardim América' END,
  'Atibaia',
  'SP',
  '12940' || LPAD(c.id::TEXT, 3, '0'),
  CASE WHEN c.id % 3 = 0 THEN 'Apto ' || c.id ELSE NULL END
FROM customers c
WHERE c.email LIKE 'cliente%@email.com';

INSERT INTO service_requests (customer_id, address_id, status, measurement_required, description, preferred_date, total_estimated_price)
SELECT
  c.id,
  a.id,
  CASE WHEN n % 3 = 0 THEN 'budget_sent' ELSE 'waiting_measurement' END,
  CASE WHEN n % 3 = 0 THEN FALSE ELSE TRUE END,
  'Solicitação de orçamento para telas mosqueteiras.',
  DATE '2026-07-01' + (n % 25),
  0
FROM generate_series(1, 120) AS n
JOIN customers c ON c.id = ((n - 1) % 40) + 1
JOIN addresses a ON a.customer_id = c.id;

INSERT INTO request_items (service_request_id, screen_type_id, quantity, width, height, room, notes, unit_price, total_price)
SELECT
  sr.id,
  ((sr.id - 1) % 7) + 1,
  (sr.id % 3) + 1,
  CASE WHEN sr.measurement_required = TRUE THEN NULL ELSE 1.20 END,
  CASE WHEN sr.measurement_required = TRUE THEN NULL ELSE 1.00 END,
  CASE WHEN sr.id % 2 = 0 THEN 'Quarto' ELSE 'Sacada' END,
  'Item de teste para avaliação de consultas e performance.',
  st.base_price,
  st.base_price * ((sr.id % 3) + 1)
FROM service_requests sr
JOIN screen_types st ON st.id = ((sr.id - 1) % 7) + 1;
