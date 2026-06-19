-- Exemplos de CRUD para a API de telas mosqueteiras.

-- CREATE cliente
INSERT INTO customers (name, email, phone, document)
VALUES ('Cliente Exemplo', 'cliente.exemplo@email.com', '11999990000', '12345678901');

-- READ clientes
SELECT id, name, email, phone, document, created_at
FROM customers
ORDER BY id;

-- READ cliente por ID
SELECT *
FROM customers
WHERE id = 1;

-- UPDATE cliente
UPDATE customers
SET phone = '11988887777', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- DELETE cliente
DELETE FROM customers
WHERE id = 1;

-- CREATE solicitação que precisa de visita técnica
INSERT INTO service_requests (customer_id, address_id, status, measurement_required, description, preferred_date)
VALUES (1, 1, 'waiting_measurement', TRUE, 'Cliente precisa que o profissional tire as medidas.', '2026-07-15');

-- CREATE item medido posteriormente
INSERT INTO request_items (service_request_id, screen_type_id, quantity, width, height, room, unit_price, total_price)
VALUES (1, 1, 2, 1.20, 1.00, 'Quarto', 140.00, 280.00);
