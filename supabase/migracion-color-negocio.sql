-- El color de marca tiene que ser #rrggbb, siempre.
--
-- El alta dejaba guardar el campo de texto a medio escribir ("#", "#EBCF").
-- Con un color asi la tarjeta web sale sin color y Google Wallet rechaza la
-- clase entera del negocio ("Unrecognized hex background color format"): a
-- ningun cliente de ese negocio le anda "Agregar a Google Wallet".
--
-- El formulario ya valida, pero el negocio se graba directo desde el
-- navegador contra Supabase, asi que la unica garantia real es esta regla.
--
-- Al 02/10/2026 habia 4 negocios con el color roto en produccion. Pasan al
-- rojo de Fielty; el duenio lo cambia despues desde su panel. Valores
-- anteriores, por si hiciera falta:
--   jordan                        '#'
--   lumiere-beauty-spa            '#EBCF'
--   reca                          '#F48EB'
--   imprimidon-by-finn-impresos   '#000c5'
--
-- Un color en null no se toca: el codigo ya cae al rojo cuando falta.

update negocios
set color = '#e0001b'
where color !~ '^#[0-9a-fA-F]{6}$';

alter table negocios drop constraint if exists negocios_color_hex_check;

alter table negocios
  add constraint negocios_color_hex_check
  check (color is null or color ~ '^#[0-9a-fA-F]{6}$');
