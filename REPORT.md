# Reporte Darwin-Commerce · Ciclo 2: modelo de afiliación (2026-11-04)

El historial de los ciclos 0 y 1 (antifaz Bluetooth) está en `archivo/ciclo-0-antifaz/`.

## Resumen

- **Qué cambió:** sin proveedor, sin contacto con el producto y sin publicidad propia, el dropshipping deja de ser posible. Pasé a **afiliación con contenido indexable**: guías de compra que llevan a Mercado Libre.
- **Shopify no puede abastecer este caso:** Collective **no opera en el país ni la moneda de esta tienda** (lo dice la herramienta). El producto antifaz quedó **ARCHIVED** y la tienda no se usa para vender.
- **Mecanismo elegido:** Programa de Afiliados de Mercado Libre (según la prensa: gratis, comisión de hasta 15% según la categoría). **No pude verificar sus términos oficiales:** el sitio está bloqueado en este entorno.
- **Nicho elegido:** mate y termo. La evidencia de demanda es débil (menciones de prensa, sin cifras); es una decisión con criterio, no con datos.
- **Hecho:** sitio estático de 4 páginas en `sites/guias-mate-termo/` (hub y 3 guías en español rioplatense), un verificador con 16 pruebas y 92 comprobaciones en Chromium.
- **Ganancia esperada por venta:** hasta 15% del valor de la compra `[no verificado]`; por ejemplo, $9.000 sobre una compra de $60.000 como máximo. **Esperá ingresos cero durante las primeras semanas** mientras el sitio se indexa.
- **Lo que no puedo hacer:** crear cuentas, generar los enlaces de afiliado, conectar Netlify, publicar en redes ni comprar anuncios. Todo eso está en el Paquete de arranque.

## 1. Decisiones que tomé sin pedir permiso

| Decisión | Motivo |
|----------|--------|
| Abandonar el dropshipping del antifaz | Requería un proveedor y una muestra que no existen, y el precio mínimo quedaba por encima del mercado local |
| Mecanismo: Mercado Libre Afiliados | Es local (pesos, envío y devoluciones los maneja la plataforma) y no exige proveedor ni atención de clientes |
| Nicho: mate y termo, con accesorios de mascotas como reserva | Se consume todo el año, categoría segura y guías que se pueden escribir sin datos técnicos de cada producto |
| Marca "Cebá" | Corta y local. **No se contrastó con negocios existentes** |
| Español rioplatense (voseo) | Tu mercado es Argentina |
| Sin WhatsApp, formularios, Sheets ni analítica | Nadie atenderá consultas y así no se guardan datos personales ni hace falta aviso de privacidad |
| Los botones llevan a la búsqueda normal de Mercado Libre hasta que pegues enlaces reales | El sitio es correcto desde el primer día. El aviso de comisión solo aparece cuando hay enlace de afiliado |
| Netlify conectado al repositorio | Una sola vez; después cada push se publica solo, sin pasos humanos recurrentes |
| Archivar con `git mv`, no borrar | Se conserva el historial |
| No volver a llamar a Collective | La herramienta indica que la respuesta no cambia para esta tienda |

## 2. Qué se hizo

| Ruta | Contenido |
|------|-----------|
| `sites/guias-mate-termo/` | Sitio estático: `index.html` y tres guías, `styles.css`, `app.js`, `enlaces.js` (el único archivo que se edita), `robots.txt`, `sitemap.xml`, `netlify.toml` |
| `scripts/verificar-sitio.mjs` y `.test.mjs` | Verificador (SEO, enlaces, aviso de comisión, honestidad, diseño) y sus 16 pruebas |
| `research/modelo-afiliados-argentina.md` | Auditoría de herramientas, mecanismos y nichos con fuentes |
| `PIVOT_RULES.md` | Reglas de pivote con ciclos de 14 días (las de 48 horas no aplican a búsqueda orgánica) |
| `content/materiales-redes.md` | Cinco piezas opcionales para redes: nadie las publica solo |
| `metrics/metrics.csv` | Plantilla con los 7 números que hay que pasar cada 14 días |
| `shopify/catalogo.json` | Estado releído de Shopify (antifaz ARCHIVED) |
| `archivo/ciclo-0-antifaz/` | Todo lo del modelo anterior y `LEEME.md` con el motivo |

Reglas de honestidad aplicadas a todo el sitio: no se afirma haber probado, usado ni recibido nada; no hay precios, reseñas ni escasez; cada dato de marca se atribuye a "la ficha de la marca"; y si hay enlace de afiliado, se avisa junto al botón.

## 3. Paquete de arranque (lo único que necesita a una persona)

Son 8 pasos, el orden importa. Total aproximado: una hora, una sola vez.

1. **Permitir sitios en la red del entorno (5 min, recomendado).** Menú del entorno en la barra superior de la sesión → *Edit* → *Network access* → agregá `www.mercadolibre.com.ar`, `listado.mercadolibre.com.ar`, `articulo.mercadolibre.com.ar` y `www.shopify.com` en *Allowed domains* (o elegí un nivel de acceso más amplio). Pasos oficiales: <https://code.claude.com/docs/en/cloud-environments#network-access>. Con eso puedo leer los términos oficiales y las fichas reales; puede hacer falta una sesión nueva.
2. **Registrarte en Mercado Libre Afiliados (10 min).** Página oficial (según la prensa): `www.mercadolibre.com.ar/l/afiliados` `[no verificado]`. Leé los términos y confirmá tres cosas: que **permiten enlaces en sitios web**, cómo piden **avisar la comisión** y la **tabla de comisiones por categoría**. Si algo no se permite, avisame y cambio de plan.
3. **Generar 4 enlaces de afiliado (10 min) y pasármelos por chat**, uno por línea con su nombre. Yo los cargo en `enlaces.js`:

   | Nombre | URL a convertir |
   |--------|-----------------|
   | termos | `https://listado.mercadolibre.com.ar/termo-para-mate` |
   | mates | `https://listado.mercadolibre.com.ar/mate` |
   | equipos | `https://listado.mercadolibre.com.ar/equipo-de-mate` |
   | bombillas | `https://listado.mercadolibre.com.ar/bombilla-para-mate` |

   Si la herramienta de enlaces solo acepta una publicación concreta, elegí una de cada categoría. Estas URLs siguen el patrón de búsqueda de Mercado Libre pero **no las pude abrir** `[no verificado]`.
4. **Conectar Netlify al repositorio (10 min).** Cuenta gratis en Netlify → *Add new site* → *Import an existing project* → GitHub → repositorio `Valenpc1/Ecommerce`, rama `claude/darwin-commerce-agent-tk4q8o`. *Base directory*: `sites/guias-mate-termo`. *Build command*: vacío. *Publish directory*: `.`. Desde ahí cada push se publica solo.
5. **Pasarme el dominio `*.netlify.app` (1 min).** Reemplazo `[DOMINIO]` en `sitemap.xml` y `robots.txt` y corro `node scripts/verificar-sitio.mjs --estricto`.
6. **Google Search Console (10 min).** <https://search.google.com/search-console> → agregá la URL del sitio y enviá `sitemap.xml`. Si pide verificar con una etiqueta HTML, pasámela y la agrego.
7. **Opcional: revisión semanal automática.** Decime sí o no y programo una tarea que repita este ciclo. No programo nada sin tu sí.
8. **Cada 14 días (5 min): pasarme 7 números.** De Search Console: impresiones, clics y páginas indexadas. Del panel de afiliados: clics en enlaces, pedidos y comisión en pesos.

## 4. Qué mediré y cuándo

| Métrica | Fuente | Cuándo se mira |
|---------|--------|----------------|
| Páginas indexadas, impresiones, clics de búsqueda | Search Console (los pasás vos) | Cada 14 días desde la semana 5; antes solo errores técnicos |
| Clics en enlaces de afiliado, pedidos y comisión | Panel de afiliados (los pasás vos) | Cada 14 días |
| Estado del sitio | `verificar-sitio.mjs --estricto` | Antes de cada publicación |

Con eso aplico `PIVOT_RULES.md` con un solo cambio por ciclo. Si en 12 semanas no hay ni 50 impresiones por semana, archivo el nicho.

## 5. Qué se verificó y qué no

**Verificado con evidencia:**

- **Shopify:** lectura de la tienda (plan Basic, Argentina, ARS), archivado del producto propio y relectura del estado final (ARCHIVED, etiqueta intacta, 1 producto en total).
- **Verificador:** 16 pruebas que modifican el sitio a propósito (primera persona, precios, escasez, enlaces rotos, aviso visible, scripts externos, CSS prohibido, etc.) y fallan cuando deben. Sobre el sitio real: 0 fallos y 6 avisos esperados por los marcadores pendientes. Encontró un defecto propio: no detectaba "Probé" por usar `\b` con letras acentuadas; ya está corregido.
- **Chromium a 375, 820 y 1440 px (92 comprobaciones):** consola limpia, solo se piden recursos del propio sitio y de Google Fonts, titulares en dos líneas o menos, Plus Jakarta Sans descargada, sin `display:grid`, y el comportamiento de los enlaces en cuatro escenarios (sin afiliado, todos con afiliado, solo uno y valores inválidos que se ignoran).
- **Un defecto real encontrado y corregido:** la tabla de la guía de mates desbordaba la pantalla en móvil (424px frente a 375px). Mi prueba era ciega a eso; la rehice y comprobé que ahora detecta el defecto original.
- **Contraste:** todos los pares de texto de la paleta superan 4.5:1.

**No verificado:**

- Los **términos oficiales** de Mercado Libre Afiliados y de Shopify (sitios bloqueados): si permiten enlaces en sitios web, el aviso de comisión que exigen y la tabla por categoría.
- Que las URLs de búsqueda por defecto de Mercado Libre existan tal cual escritas.
- Netlify, Search Console y la indexación.
- Las guías contienen **criterios generales de compra**, sin fuente por cada línea y sin datos técnicos de productos. Conviene que una persona las lea una vez; cuando se permita el acceso a Mercado Libre puedo contrastarlas con fichas reales.
- La demanda de mate y termo: solo hay menciones de prensa.

## 6. Riesgos abiertos

- **SEO lento y competido.** Contenido genérico y sin experiencia propia contra sitios grandes: puede no posicionar. No prometo resultados.
- **Dependencia de un programa que no pude leer.** Si los términos no permiten el modelo, hay que cambiarlo.
- **Sin medición propia.** No puedo leer ni ventas ni tráfico: dependo de los 7 números cada 14 días.
- **Nombre "Cebá"** sin contrastar.
- **Lo que el dueño no va a hacer.** Los 8 pasos del paquete son indispensables: sin ellos el sitio no se publica ni cobra comisión.

## 7. Cambios en Shopify

Tienda conectada: plan Basic, Argentina, ARS. Solo se tocó lo creado por este proyecto.

| Acción | Producto | Id | Estado final |
|--------|----------|----|--------------|
| Archivar (no se borra) | Antifaz Bluetooth Pausa (`antifaz-bluetooth-pausa`) | `gid://shopify/Product/15530891018476` | ARCHIVED |

Otras llamadas fueron solo lectura (`get-shop-info`, búsquedas de productos y una consulta GraphQL de verificación). La búsqueda en Collective devolvió que no opera para esta tienda y no se repitió. Shopify sugirió cuatro apps de abastecimiento del App Store (Dropshipper-ai, Syncee AI Dropship, DropCommerce y Printful); están descartadas porque exigen proveedor, tarjeta y atención de clientes.
