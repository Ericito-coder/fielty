-- El registro con Google no pide DNI: el email verificado que viene en el
-- token es la identidad y la clave de deduplicación. El DNI sigue siendo
-- obligatorio en el registro con contraseña (ahí es el usuario del login)
-- y en el alta desde el mostrador.
alter table clientes alter column dni drop not null;
