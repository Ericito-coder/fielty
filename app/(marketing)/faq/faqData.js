export const FAQS = [
  {
    categoria: 'Sobre Fielty',
    preguntas: [
      {
        q: '¿Qué es Fielty?',
        a: 'Fielty es un sistema de fidelización de clientes para negocios. Tus clientes acumulan puntos en cada compra y los canjean por premios que vos definís. Sin app, sin complicaciones — todo funciona desde el celular con un link o QR.',
      },
      {
        q: '¿Mis clientes necesitan descargar una app?',
        a: 'No. Todo funciona desde el navegador. Tus clientes escanean el QR o entran al link y listo — ven su tarjeta, sus puntos y sus premios sin instalar nada.',
      },
      {
        q: '¿Funciona para cualquier tipo de negocio?',
        a: 'Sí. Fielty funciona para peluquerías, barberías, cafeterías, pastelerías, veterinarias, restaurantes, tiendas de ropa, farmacias y cualquier negocio que quiera fidelizar clientes.',
      },
      {
        q: '¿En qué se diferencia de la tarjeta de sellos de papel?',
        a: 'La lógica es la misma, pero la tarjeta vive en el celular del cliente: no se pierde ni se olvida en casa. Además el cliente ve en todo momento cuántos puntos tiene y cuánto le falta para el premio, y vos ves desde el panel quiénes son tus clientes más fieles, cuántos volvieron y quiénes hace tiempo que no aparecen. Con la tarjeta de papel esa información no queda registrada en ningún lado.',
      },
      {
        q: '¿Sirve si tengo más de un local?',
        a: 'Sí. Cada sucursal tiene su propia pantalla de caja con su PIN, pero el cliente acumula y canjea puntos en cualquiera de tus locales con la misma tarjeta. El plan Gratis incluye 1 sucursal, el plan Pro hasta 3 y el plan Business sucursales ilimitadas.',
      },
    ],
  },
  {
    categoria: 'Registro y clientes',
    preguntas: [
      {
        q: '¿Cómo se registran mis clientes?',
        a: 'Mostrales el QR o compartiles el link de registro de tu negocio. Ellos completan su nombre, DNI y email en menos de un minuto y ya tienen su tarjeta digital. Los clientes que se registran de forma orgánica reciben los puntos de bienvenida que vos configurás. Los que llegan por referido de otro cliente reciben los puntos de referido en su lugar.',
      },
      {
        q: '¿Qué datos se piden al registrarse?',
        a: 'Nombre, DNI, email y contraseña son obligatorios. WhatsApp y fecha de nacimiento son opcionales. La fecha de nacimiento sirve para que tus clientes reciban puntos extra en su cumpleaños.',
      },
      {
        q: '¿Un cliente puede registrarse en varios negocios?',
        a: 'Sí. Cada negocio tiene su propio programa independiente. Un cliente puede tener tarjeta en todos los negocios que quiera.',
      },
      {
        q: '¿Qué pasa si mi cliente pierde el celular o se compra uno nuevo?',
        a: 'No pierde nada. Los puntos están guardados en su cuenta, no en el teléfono. Desde el celular nuevo entra a fielty.app/mi-tarjeta con su DNI y contraseña y vuelve a ver su tarjeta como siempre. Si no se acuerda la contraseña, puede recuperarla por email.',
      },
    ],
  },
  {
    categoria: 'Puntos y recompensas',
    preguntas: [
      {
        q: '¿Cómo acredito puntos a un cliente?',
        a: 'Desde la URL de caja de tu negocio (fielty.app/c/tu-negocio). Buscás al cliente por nombre o DNI, ingresás el monto de la compra y confirmás. Los puntos se acreditan al instante.',
      },
      {
        q: '¿Puedo personalizar cuántos puntos da cada compra?',
        a: 'Sí. Desde la configuración del panel podés definir la regla de puntos. Por ejemplo: 1 punto por cada $100 de compra.',
      },
      {
        q: '¿Cómo canjean premios mis clientes?',
        a: 'Desde la tarjeta digital del cliente. Ellos ven las recompensas disponibles, aprietan "Canjear" y se genera un código que vos validás desde la caja antes de entregar el premio.',
      },
      {
        q: '¿Puedo cambiar las recompensas cuando quiero?',
        a: 'Sí, podés agregar, editar o desactivar recompensas en cualquier momento desde la sección Recompensas de tu panel.',
      },
      {
        q: '¿Los puntos vencen?',
        a: 'No. Los puntos que acumula un cliente no tienen fecha de vencimiento y quedan disponibles hasta que los canjee. Lo único que tiene tiempo límite es el código de canje: cuando el cliente canjea un premio se genera un código válido por 24 horas, y si no lo usa en ese plazo los puntos vuelven automáticamente a su cuenta.',
      },
    ],
  },
  {
    categoria: 'Planes y pagos',
    preguntas: [
      {
        q: '¿Cuánto cuesta Fielty?',
        a: 'Hay un plan Gratis que permite hasta 50 clientes sin costo. El plan Pro cuesta $10.000/mes para los primeros 100 negocios (precio regular $20.000/mes) e incluye clientes ilimitados, hasta 3 sucursales y soporte prioritario. El plan Business cuesta $35.000/mes y agrega exportación CSV, logo personalizado y sucursales ilimitadas.',
      },
      {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Sí. No hay contratos ni permanencia mínima. Podés cancelar tu suscripción cuando quieras desde Mercado Pago.',
      },
      {
        q: '¿Cómo se cobra la suscripción?',
        a: 'El pago es mensual y se procesa automáticamente a través de Mercado Pago. Podés pagar con tarjeta de crédito, débito o dinero en cuenta de MP.',
      },
      {
        q: '¿Qué pasa cuando llego al límite de 50 clientes en el plan Gratis?',
        a: 'Te avisamos por email cuando llegás a 45 clientes para que tengas tiempo de decidir. Al llegar a 50, los nuevos clientes no pueden registrarse hasta que mejorés el plan.',
      },
    ],
  },
  {
    categoria: 'Técnico y seguridad',
    preguntas: [
      {
        q: '¿Es seguro guardar los datos de mis clientes en Fielty?',
        a: 'Sí. Los datos se almacenan en Supabase con encriptación y acceso protegido. Cumplimos con la Ley 25.326 de Protección de Datos Personales de Argentina.',
      },
      {
        q: '¿Qué pasa si Fielty tiene un problema técnico?',
        a: 'Ante cualquier inconveniente podés escribirnos a hola@fielty.app y te respondemos a la brevedad.',
      },
      {
        q: '¿Puedo usar Fielty desde el celular?',
        a: 'Sí. El panel del dueño y la caja están optimizados para mobile. Podés gestionar todo desde tu celular sin necesidad de una computadora.',
      },
      {
        q: '¿Necesito comprar algún aparato, lector o terminal?',
        a: 'No. Fielty funciona desde el navegador del celular, la tablet o la computadora que ya tenés. Para leer el código QR de la tarjeta de un cliente se usa la cámara del mismo celular, así que no hace falta ningún lector especial. Lo único que conviene imprimir es el cartel con el QR de tu negocio para el mostrador, y te lo generamos listo desde el panel.',
      },
    ],
  },
]
