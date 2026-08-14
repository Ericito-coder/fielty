// Dominio público de Fielty.
//
// Los QR de los carteles se armaban con `window.location.origin`, que es el
// dominio desde el que el dueño abrió la página. Eso funciona en producción
// y falla en todo lo demás: un cartel generado desde un deploy de preview
// lleva un QR que apunta al dominio del preview — protegido por login y que
// desaparece cuando se borra la rama. Un cartel impreso es papel: el error
// no se descubre hasta que un cliente escanea y no pasa nada.
//
// Por eso el QR se arma siempre contra el dominio real, incluso en
// desarrollo. El costo es que un cartel abierto en localhost genera un QR
// que apunta a producción, pero nadie imprime un cartel desde localhost, y
// es preferible a que un QR impreso apunte a un dominio que no existe más.
//
// app/layout.js tiene su propia copia de esta URL en metadataBase y en el
// JSON-LD; no se unificó para no tocar el schema.org.
export const SITIO = 'https://www.fielty.app'
