# Modelo Lógico

- users(id PK, name, email UK, password_hash, role, created_at, updated_at)
- customers(id PK, name, email, phone, document UK, created_at, updated_at)
- addresses(id PK, customer_id FK -> customers.id, street, number, neighborhood, city, state, zip_code, complement, created_at, updated_at)
- screen_types(id PK, name UK, description, base_price, is_available, created_at, updated_at)
- service_requests(id PK, customer_id FK -> customers.id, address_id FK -> addresses.id, status, measurement_required, description, preferred_date, total_estimated_price, created_at, updated_at)
- measurement_visits(id PK, service_request_id FK -> service_requests.id, professional_id FK -> users.id, scheduled_date, status, notes, created_at, updated_at)
- request_items(id PK, service_request_id FK -> service_requests.id, screen_type_id FK -> screen_types.id, quantity, width, height, room, notes, unit_price, total_price, created_at, updated_at)

## Cardinalidades

- customers 1:N addresses
- customers 1:N service_requests
- addresses 1:N service_requests
- service_requests 1:N measurement_visits
- users 1:N measurement_visits
- service_requests N:N screen_types por meio de request_items
