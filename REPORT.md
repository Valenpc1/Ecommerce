# Reporte Darwin-Commerce · Ciclos 0 y 1 (2026-11-04)

## Resumen

- **Producto elegido:** Antifaz Bluetooth para dormir, tienda *Pausa*. Segmento de regalo y viaje, pico estacional de diciembre.
- **Precio:** $57.900 por unidad (margen estimado 48.3%, unos $27.986 por pedido) y pack de 2 por $106.900 (44.0%), en pesos porque la tienda de Shopify cobra en ARS. Base de costos: tipo de cambio de planificación de $1.920 por dólar `[no verificado]`. Envío incluido.
- **Estado:** sitio estático listo para arrastrar a Netlify, backend de Google Sheets listo para pegar en Apps Script, 5 guiones de video y reglas numéricas de pivote.
- **Lo que no puedo hacer yo:** pedir la muestra al proveedor (si su pasarela exige tarjeta física), crear la hoja y el Apps Script en tu cuenta de Google, subir la carpeta a Netlify y publicar los videos. Pasos exactos en la sección 5.
- **Publicación:** la rama `claude/darwin-commerce-agent-tk4q8o` está subida a `Valenpc1/Ecommerce` (7 commits al cierre del ciclo 0). El primer intento falló con 403 por falta de permiso de escritura; el reintento posterior funcionó.
- **Shopify (ciclo 1):** producto creado como **DRAFT** (etiqueta `darwin-commerce`, dos variantes, costo por artículo y SEO) y releído. `shopify/catalogo.json` es esa copia y el verificador da código 0 contra la landing. **No se activa:** faltan las condiciones de la sección 9. **Alerta de mercado:** el piso de precio de la unidad ($46.021) queda 1,15 veces por encima del precio local más alto que encontré ($40.000); ver sección 7.

## 1. Decisiones que tomé sin pedir permiso

| Decisión | Motivo | Dónde se cambia |
|----------|--------|-----------------|
| Producto: antifaz Bluetooth | Mejor margen absoluto y menor riesgo de los 5 candidatos (ver `research/analisis-producto.md`) | Fase 1 de nuevo (`PIVOT_RULES.md` 4.D) |
| Marca de tienda "Pausa" | Palabra común y corta; no se comprobó que no exista otro negocio con ese nombre | `index.html`, `app.js` |
| Moneda ARS (la de la tienda de Shopify) | Regla del proyecto: manda la moneda de la tienda, que está en Argentina y cobra en pesos | `CONFIG` en `app.js` y variantes de Shopify |
| Envío incluido en el precio | Simplifica la decisión de compra y ya está cubierto en el cálculo de costos | `index.html` y precio |
| Pago y entrega se coordinan por WhatsApp | No hay pasarela de pago propia; evita tarjetas y comisiones | `index.html`, preguntas frecuentes |
| Si llega con defecto: cambio o devolución del dinero | Es lo mínimo que se espera al vender online. **Tú debes poder cumplirlo**; confírmalo con tu proveedor | Pregunta "¿Y si llega con un defecto?" |
| Pack de 2 con ahorro de $8.900 | Sube el ticket y apoya el ángulo de regalo | `PACKS` en `app.js` y Shopify |
| Casilla de consentimiento y aviso de uso de datos | Se guardan nombre, WhatsApp y dirección. Revisa si tu país exige un aviso de privacidad más completo | `index.html` |
| Sin reseñas, contadores ni escasez | No existen datos reales; inventarlos es engañar al cliente | Regla fija del proyecto |
| Shopify solo para productos | Lo autorizaste en el ciclo 1. Alcance: solo productos propios con la etiqueta `darwin-commerce`, en DRAFT hasta cumplir 4 condiciones; nada de temas, envíos, pagos, descuentos ni apps | Sección 9 |
| No usé Sheets, Drive ni Gmail | No eran estrictamente necesarios y crean cosas en tus cuentas | Todo es código local |

## 2. Cálculo del precio

Fórmula: `precio ≥ (costo producto + envío + comisiones) ÷ (1 − 0.35)`

El modelo del ciclo 0 se hizo en dólares (primera tabla). La tienda cobra en pesos argentinos, así que el precio vigente es el de la tabla en pesos al final de esta sección.

| Concepto | Unidad | Pack de 2 | Fuente |
|----------|--------|-----------|--------|
| Costo del producto | $9.58 | $19.16 | Peor caso listado en SaleHoo (listados de $8.09 a $9.58) `[no verificado]` |
| Envío al cliente | $3.50 | $7.00 | Estimación mía `[no verificado]` |
| Comisiones, entregas fallidas y devoluciones | $2.50 | $5.00 | Estimación mía `[no verificado]` |
| **Costo total** | **$15.58** | **$31.16** | Suma |
| **Precio mínimo con margen del 35%** | **$23.97** | **$47.94** | `costo ÷ 0.65` |
| **Precio elegido** | **$29.90** | **$54.90** | Colchón sobre el piso, dentro de la banda de $22–$38 citada por SaleHoo |
| Ganancia por pedido | $14.32 | $23.74 | Precio − costo total |
| Margen sobre el precio | 47.9% | 43.2% | |

El colchón entre el piso ($23.97) y el precio ($29.90) existe porque las tres cifras de costo son estimaciones y porque los pedidos contra entrega fallan con frecuencia. Con la cotización real del proveedor hay que recalcular.

Sin publicidad pagada, el único costo de arrancar es la unidad de muestra, de unos $15.58 según la estimación.

### Precio vigente, en pesos (moneda de la tienda)

Tipo de cambio de planificación: **$1.920 por dólar** (dólar tarjeta, captura del 2 de diciembre de 2025: la última cotización con fecha que encontré; hoy puede ser otra) `[no verificado]`.

| Concepto | Unidad | Pack de 2 |
|----------|--------|-----------|
| Costo total (USD × 1.920) | $29.914 | $59.827 |
| Precio mínimo con margen del 35% | $46.021 | $92.042 |
| **Precio elegido** | **$57.900** | **$106.900** |
| Ganancia por pedido | $27.986 | $47.073 |
| Margen sobre el precio | 48.3% | 44.0% |
| Costo por artículo cargado en Shopify (solo producto) | $18.393,60 | $36.787,20 |

Con el dólar a $2.400 el margen de la unidad baja al 35.4%: ese es el límite de depreciación que absorbe el colchón. Cualquier cambio de precio se hace en Shopify y en `CONFIG.PACKS` en el mismo commit.

## 3. Archivos entregados

| Ruta | Contenido |
|------|-----------|
| `research/analisis-producto.md` | Fase 1: candidatos, fuentes, riesgos y límites de la evidencia |
| `sites/antifaz-bluetooth-pausa/` | `index.html`, `styles.css`, `app.js`, `netlify.toml`. Es la carpeta que se arrastra a Netlify |
| `apps-script/Code.gs`, `apps-script/README.md` | Backend de Google Sheets y guía de 5 pasos |
| `content/guiones-tiktok-reels.md` | Fase 3: 5 guiones con plano, texto, audio, caption y hashtags |
| `metrics/metrics.csv`, `PIVOT_RULES.md` | Fase 4: plantilla de métricas y reglas de pivote |
| `shopify/catalogo.json`, `shopify/verificar-catalogo.mjs` | Copia releída de Shopify (producto en DRAFT) y verificador contra `CONFIG.PACKS`; da código 0 |
| `REPORT.md` | Este documento |

Diseño: tema oscuro, Bento en Flexbox puro (ningún `display:grid`), Plus Jakarta Sans desde Google Fonts, superficies separadas por tono (sin sombras, degradados ni líneas), una sola familia tipográfica, cinco tamaños de texto, animaciones de entrada con alternativa para movimiento reducido.

## 4. Qué se verificó y qué no

**Verificado con evidencia (comandos ejecutados en esta sesión):**

- **Backend:** 15 pruebas con servicios de Google simulados en Node: lead y pedido válidos, duplicados por id, límite por WhatsApp, honeypot, inyección de fórmulas neutralizada, total calculado en servidor, eventos, JSON inválido, bloqueo ocupado.
- **Sitio:** 84 comprobaciones automáticas con Chromium (Playwright) a 375, 820, 1280 y 1440 px, repetidas con los precios en pesos:
  - sin errores ni advertencias de consola, sin peticiones fallidas y sin desbordamiento horizontal;
  - Plus Jakarta Sans cargada de verdad, ningún elemento con `display:grid` y todos los titulares en dos líneas o menos;
  - ninguna tarjeta Bento recorta su contenido;
  - carrito, validación de campos y pedido con el payload exacto (id, productos, utm, moneda);
  - enlaces `wa.me` con el texto codificado y actualizado según el pack;
  - reintento sin duplicar si falla la lectura de la respuesta, error visible si Apps Script no devuelve JSON, y degradación limpia cuando el sitio aún no está configurado;
  - eventos `view`, `cta_click`, `wa_click` y `form_start`;
  - contenido visible con movimiento reducido y también si `app.js` no carga.
- **Contraste:** todos los pares de texto superan 4.5:1 (cálculo WCAG).
- **Paquete Netlify:** la carpeta se sirvió tal cual desde un servidor estático, sin build ni rutas absolutas.
- **Shopify:** se leyó la tienda (plan Basic, Argentina, ARS, 0 productos), se creó el producto en DRAFT y se releyó por `get-product` y GraphQL: estado, etiqueta, handle, precios, costo por artículo, SEO, inventario sin seguimiento y moneda. `node shopify/verificar-catalogo.mjs` termina con código 0 contra ese catálogo real.

**No verificado (hazlo en tu prueba de punta a punta):**

- El Apps Script contra Google real: autorización, fórmulas de la hoja `Resumen`, el prefijo `'` que evita fórmulas en Sheets y la lectura de la respuesta desde el navegador.
- El despliegue en Netlify. Los encabezados de `netlify.toml` podrían no aplicarse con arrastrar y soltar (no verificado); el sitio funciona igual.
- La apertura de WhatsApp en un teléfono real.
- De Shopify solo se verificó el borrador. Sin probar: pasar a ACTIVE, la tienda online y su URL pública, el checkout, los pagos y las tarifas de envío (sin configurar).
- Costos de proveedor, envío, plazos y las afirmaciones del producto (bloquea la luz, se conecta por Bluetooth, se carga por USB). Se comprueban con la unidad de muestra.
- El tipo de cambio de hoy: se usó $1.920 por dólar, la última cotización con fecha que encontré (2 de diciembre de 2025).
- Las políticas vigentes de TikTok e Instagram sobre contenido comercial y música.

**Limitaciones de esta sesión:**

- `copyfy.io`, `doba.com` e `hypersku.com` no resuelven desde la red del entorno. Si quieres un análisis más profundo, agrégalos a los dominios permitidos (*menú del entorno → Editar → Acceso a la red*).
- La skill de diseño instalada solo incluía su `SKILL.md`, sin los scripts `draw`, `inspect` y `lint`. Apliqué sus reglas a mano y las medí con Playwright. Su criterio de al menos 4 imágenes reales **no se cumple**: no hay fotos del producto, así que la portada usa una ilustración SVG. Cuando llegue la muestra, pon las fotos en la carpeta y súbelas en `PRODUCT_IMAGES` (`app.js`).
- La "tracción viral" no está medida con datos de ventas; solo hay menciones en listas de blogs comerciales.

## 5. Pasos manuales para ti, en orden

1. **Proveedor (tarjeta).** Pide cotización y **1 unidad de muestra** de un antifaz Bluetooth. Si la pasarela del proveedor exige tarjeta física, este es el paso que solo tú puedes hacer. Pregunta además quién paga aranceles e IVA de importación, con qué régimen entra el envío a Argentina y cuánto tarda; evalúa también un proveedor local (mayorista) para evitar la aduana. Con la muestra, verifica la lista de `content/guiones-tiktok-reels.md` y actualiza costos en la sección 2 (y el costo por artículo en Shopify). Con esos datos, una foto real y la comparación de la regla 4.E de `PIVOT_RULES.md`, el producto puede pasar de DRAFT a ACTIVE.
2. **Google Sheets.** Sigue `apps-script/README.md` (5 pasos) y copia la URL `/exec`.
3. **Configura el sitio.** En `sites/antifaz-bluetooth-pausa/app.js` reemplaza `[WHATSAPP_NUMBER]` (país y número, solo dígitos) y `[APPS_SCRIPT_URL]`.
4. **Netlify.** Arrastra la carpeta `sites/antifaz-bluetooth-pausa` a <https://app.netlify.com/drop>. Copia el dominio resultante.
5. **Prueba de punta a punta.** Haz un pedido de prueba: debe aparecer una fila en `Pedidos`, eventos en `Eventos`, y el botón de confirmación debe abrir WhatsApp. Borra las filas de prueba.
6. **Shopify, checkout (opcional).** El cierre principal sigue siendo WhatsApp y Sheets. Si quieres vender también por la tienda de Shopify, configura en su panel los métodos de pago y la tarifa de envío: yo no toco pagos ni envíos. El producto se queda en DRAFT hasta cumplir las condiciones de la sección 9.
7. **Videos.** Graba los 5 de `content/guiones-tiktok-reels.md` con tu muestra, reemplaza `[DOMINIO_NETLIFY]` y `[NOMBRE_BLUETOOTH]`, y publica uno por día con su enlace `utm_campaign`.
8. **A las 48 horas** pásame las métricas de la sección 6.

## 6. Métricas que necesito para el siguiente pivote

- **De la hoja `Resumen`:** visitas, clics en el botón de pedir, clics a WhatsApp, inicios de formulario, leads, pedidos y pedidos entregados, desglosados por `utm_campaign`.
- **De cada video (estadísticas de la app):** vistas, retención en los 3 primeros segundos, compartidos y clics al enlace.
- **De WhatsApp:** cuántos chats llegaron sin pasar por el formulario.
- **De costos reales:** cotización del proveedor, costo de envío y cualquier comisión o devolución.

Con eso aplico `PIVOT_RULES.md` de inmediato: primero separo falta de tráfico (menos de 100 visitas en 48 h) de falta de conversión, y cambio una sola cosa por ciclo.

## 7. Riesgos abiertos

- **Saturación:** el antifaz Bluetooth aparece en varias listas de blogs comerciales; la diferenciación vive en el ángulo de los videos, no en el producto.
- **Plazos antes de Navidad:** no hay datos de entrega. La web no promete fechas.
- **Batería de litio:** puede restringir el método de envío; preguntar al proveedor.
- **Normativa local:** devoluciones, protección de datos y publicidad varían por país; revisa la tuya antes de vender.
- **Precio frente al mercado argentino:** el piso del 35% de margen ($46.021 por unidad) queda 1,15 veces por encima del precio local más alto que encontré ($40.000; banda de $12.000 a $40.000, capturas sin fecha firme). Con estos costos el producto no compite sin bajar el margen o conseguir un costo menor. Por eso no pasa a ACTIVE (regla 4.E de `PIVOT_RULES.md`) hasta cotizar al proveedor y, si no alcanza, repetir la Fase 1 con precios en pesos o buscar un proveedor local. Detalle y fuentes en `research/analisis-producto.md`.
- **Tipo de cambio:** el peso es volátil. Con el dólar a $2.400 el margen de la unidad baja al 35.4%. Recalcula con el cambio del día y la forma real de pago al proveedor antes de activar y en cada cambio de precio.
- **Aduana:** según la prensa, la franquicia de US$400 y el tope de cinco compras al año son para compras personales; la reventa o importación comercial entra por otro régimen que no pude confirmar. Consulta a un despachante de aduana o contador antes de vender y averigua quién paga aranceles e IVA en el envío.

## 8. Ver el sitio en local (opcional)

```bash
python3 -m http.server 8080 -d sites/antifaz-bluetooth-pausa
```

Abre <http://localhost:8080>. Sin configurar, el sitio muestra dos avisos en la consola y los botones de WhatsApp llevan al formulario.

## 9. Cambios en Shopify (ciclo 1, 2026-11-04)

Tienda conectada: plan Basic, Argentina, moneda ARS y **0 productos al empezar**. Solo se tocó lo creado en esta sesión; no se editó ni borró nada más.

| Acción | Producto | Id | Estado | Precio o costo |
|--------|----------|----|--------|----------------|
| Crear producto | Antifaz Bluetooth Pausa (`antifaz-bluetooth-pausa`) | `gid://shopify/Product/15530891018476` | DRAFT | $57.900 (1 antifaz) y $106.900 (2 antifaces) |
| Fijar costo por artículo | Variante "1 antifaz" | `gid://shopify/ProductVariant/68066917220588` | DRAFT | costo $18.393,60 |
| Fijar costo por artículo | Variante "2 antifaces" | `gid://shopify/ProductVariant/68066917253356` | DRAFT | costo $36.787,20 |
| Fijar SEO | Título y descripción | `gid://shopify/Product/15530891018476` | DRAFT | |

Estado releído tras los cambios: etiqueta `darwin-commerce`, vendor "Pausa", tipo "Antifaz para dormir", opción "Pack" con las dos variantes (SKU `PAUSA-1` y `PAUSA-2`), inventario sin seguimiento, requiere envío, sin imágenes y sin URL en la tienda online (es un borrador). La descripción es mínima ("Antifaz Bluetooth para dormir, en pack de 1 o de 2 unidades"): no afirma nada sobre el funcionamiento hasta verificar la muestra.

**Cuándo pasa a ACTIVE** (todas a la vez):

1. Costo, plazo de envío y quién paga aranceles e IVA de importación, confirmados por el proveedor, con URL o captura en `research/`.
2. Precio ≥ fórmula con ese costo y con el tipo de cambio real del día.
3. Al menos una imagen real con derecho de uso (la ilustración SVG de la landing no cuenta).
4. Descripción sin afirmaciones no verificadas.
5. Superar la comparación con precios locales de la regla 4.E de `PIVOT_RULES.md`. **Hoy no la supera:** el piso de la unidad ($46.021) está por encima del tope local encontrado ($40.000).

**Landing:** `CONFIG` en `app.js` pasó a ARS con $57.900 por unidad y $53.450 por unidad en el pack (total $106.900), con formato `es-AR` sin decimales; los valores estáticos del HTML, los guiones y `PIVOT_RULES.md` se alinearon. No se añadió el enlace "Comprar en la tienda": el producto no está ACTIVE ni tiene URL pública. Antes de dirigir tráfico al checkout de Shopify hay que configurar pagos y envío en su panel.

**Verificación:** `node shopify/verificar-catalogo.mjs` termina con código 0 (moneda, producto, etiqueta y precio de las dos variantes). Tras el cambio a pesos se repitieron las pruebas del backend (15/15), del verificador (10/10) y de la landing en Chromium (84/84).
