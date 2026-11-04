# Ciclo 2 · Modelo sin proveedor ni contacto con el producto

Fecha: 2026-11-04. Mercado: Argentina (tienda de Shopify en pesos).

## Límites de la evidencia (leer primero)

- `www.mercadolibre.com.ar` y `www.shopify.com` **no resuelven desde este entorno** (host fuera de los dominios permitidos). No pude leer los términos oficiales de ningún programa de afiliados.
- Todo lo que sigue viene de resúmenes de WebSearch: prensa y blogs, con fechas y precisión variables. Lo que no tiene fuente va marcado `[no verificado]`.
- No hay datos cuantitativos de demanda por nicho, ni tráfico ni conversión propios.

## Auditoría de herramientas

| Herramienta | Estado | Uso en este modelo |
|-------------|--------|--------------------|
| Shopify (leer y modificar lo propio) | Funciona tras reconectar | Leer la tienda, archivar mi producto. No sirve para abastecer (ver abajo) |
| WebSearch | Funciona | Investigación |
| WebFetch | Bloqueado en mercadolibre.com.ar, shopify.com, copyfy.io, doba.com e hypersku.com | Sin lectura de páginas oficiales de esos sitios |
| Node, Chromium (Playwright) y git | Funcionan | Construir, verificar y publicar en la rama |
| Google Sheets, Drive y Gmail | Conectados, sin uso | No hacen falta; enviar mensajes en nombre del dueño está prohibido |
| Redes sociales, anuncios, cuentas, correo saliente, Netlify | **Sin herramienta** | No se simulan. Exigen pasos humanos (ver `REPORT.md`) |

## Mecanismos evaluados

| Mecanismo | Resultado | Fuente | Veredicto |
|-----------|-----------|--------|-----------|
| Shopify Collective (marcas que envían ellas mismas) | La herramienta responde que **no opera en el país ni la moneda de esta tienda**. Un blog indica que proveedor y comercio deben estar en el mismo país y moneda | Respuesta de la herramienta; [changelog de Shopify](https://changelog.shopify.com/posts/shopify-collective-available-in-36-additional-countries) | Imposible |
| Apps de abastecimiento del App Store que sugiere la herramienta (Dropshipper-ai, Syncee AI Dropship, DropCommerce, Printful) | Proveedores de EE. UU., UE, Reino Unido y Canadá; hay que instalarlas, cobrar a un proveedor y atender entregas y reclamos desde la Argentina | Respuesta de la herramienta | Descartadas: exigen proveedor, tarjeta y atención, justo lo que no hay |
| Shopify Collabs | Creadores limitados a EE. UU., Canadá y Reino Unido; algunas fuentes dicen que las altas están pausadas | [GemPages](https://gempages.net/de/blogs/shopify/shopify-collabs), [Omnisend](https://www.omnisend.com/blog/shopify-collabs/), [Archive](https://archive.com/blog/shopify-collabs) | No disponible |
| Programa de afiliados de Shopify (comerciantes nuevos) | Bounty de hasta US$150 por referido que compre un plan completo; pagos y países con datos contradictorios | [Jotform](https://www.jotform.com/blog/best-shopify-affiliate-program/), [Funnelish](https://funnelish.com/blog/shopify-affiliate-program) `[no verificado]` | Descartado: términos y países sin verificar, competencia fuerte y no es un producto de consumo |
| **Mercado Libre Afiliados** | Abierto a mayores de 18 con cuenta activa; sin costo; comisión **de hasta 15% según la categoría** (prensa argentina); el afiliado genera el enlace desde su cuenta; cobro por Mercado Pago; sin tope | [Mercado](https://mercado.com.ar/marketing/mercado-libre-lanzo-en-el-pais-su-programa-de-afiliados-y-creadores-con-comisiones-de-hasta-15), [Forbes Argentina](https://www.forbesargentina.com/negocios/mercado-libre-sale-caza-creator-economy-lanza-su-programa-afiliados-monetizar-recomendaciones-n87534), [iProfesional](https://www.iprofesional.com/economia/450376-programa-afiliados-mercado-libre-permite-ganar-15-por-ciento-sin-invertir-vender) | **Elegido** |

Por qué Mercado Libre: precios y envíos locales en pesos, sin aduana ni tipo de cambio, y la plataforma se ocupa del cobro, el envío, las devoluciones y la atención. Pendiente de verificar en los términos oficiales: que permitan enlaces en sitios web, cómo exigen avisar la comisión y la tabla de comisiones (la prensa dice que solo se ve dentro de la cuenta).

## Nichos evaluados

| Nicho | Evidencia | Veredicto |
|-------|-----------|-----------|
| **Mate y termo** | Los termos de una marca figuran entre los más elegidos por los argentinos, sin cifras ([Cronista](https://www.cronista.com/infotechnology/gadgets/como-conseguir-todo-de-stanley-original-y-sin-clavarse-con-modelos-truchos)); Mercado Libre publica una nota de equipos de mate más vendidos de 2024 ([blog](https://www.mercadolibre.com.ar/blog/mas-vendidos/equipos-mate)) | **Elegido**: se consume todo el año, categoría segura, guías de criterios generales que no necesitan datos técnicos de cada producto |
| Accesorios de mascotas | La industria pesa medio punto del PIB según un titular ([La Voz de San Justo](https://www.lavozdesanjusto.com.ar/la-industria-de-las-mascotas-ya-representa-medio-punto-del-pib-en-argentina)); abandono de carrito de ~69% ([Tiendanube](https://www.tiendanube.com/blog/productos-para-mascotas/)); ticket de alimento de ~$36.000 sin fecha ([Nubimetrics](https://academia.nubimetrics.com/el-abanico-online-para-los-perros)) | Reserva para el primer pivote |
| Electrodomésticos y televisores | Lideraron las unidades del Hot Sale 2026 ([Perfil](https://www.perfil.com/noticias/economia/las-figuritas-del-mundial-son-furor-en-el-hot-sale-2026-a40.phtml)). Ticket alto, pero comisión probablemente baja `[no verificado]` y competencia fuerte en búsqueda | Descartado por ahora |
| Regalos de temporada | Faltan unas 7 semanas para Navidad y el tráfico de búsqueda tarda semanas en llegar | Descartado: la ventana se pierde antes de rendir |
| Antifaz Bluetooth | Ver `archivo/ciclo-0-antifaz/` | Descartado: sin proveedor y por encima del precio local |

**La evidencia de demanda es débil** (menciones de prensa sin cifras de ventas). Es una decisión con criterio, no con datos.

## Ganancia esperada por venta

`comisión = valor de la compra × porcentaje de la categoría`

- La prensa argentina habla de comisiones **de hasta 15%**. La tabla por categoría no está verificada.
- Ejemplo ilustrativo (no una estimación): una compra de $60.000 con 15% serían $9.000 como máximo; con 5%, $3.000 `[no verificado]`.
- No hay datos de visitas ni de conversión. Con contenido nuevo y sin publicidad, lo razonable es esperar **ingresos cero durante las primeras semanas** mientras el sitio se indexa `[no verificado]`.

## Riesgos principales

- El tráfico de búsqueda tarda semanas o meses y el contenido sin experiencia propia compite con sitios grandes: puede no posicionar.
- Si los términos oficiales no permiten enlaces en sitios web, este modelo cae y hay que cambiar de canal.
- No se puede medir ventas desde aquí: las lee el dueño en el panel de afiliados.
- El nombre "Cebá" no se contrastó con negocios existentes.
