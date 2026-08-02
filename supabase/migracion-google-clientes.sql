-- Registro/login de clientes con Google: marca cómo se creó la cuenta.
-- Un cliente via_google no tiene password_hash — entra siempre con Google.
alter table clientes add column if not exists via_google boolean not null default false;
