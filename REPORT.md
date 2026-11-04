# Reporte Darwin-Commerce · Ciclo 0 (2026-11-04)

## Resumen

- **Producto elegido:** Antifaz Bluetooth para dormir, tienda *Pausa*. Segmento de regalo y viaje, pico estacional de diciembre.
- **Precio:** $29.90 por unidad (margen estimado 47.9%, unos $14.32 por pedido) y pack de 2 por $54.90 (margen 43.2%). Envío incluido.
- **Estado:** sitio estático listo para arrastrar a Netlify, backend de Google Sheets listo para pegar en Apps Script, 5 guiones de video y reglas numéricas de pivote.
- **Lo que no puedo hacer yo:** reconectar Shopify, pedir la muestra al proveedor (si su pasarela exige tarjeta física), crear la hoja y el Apps Script en tu cuenta de Google, subir la carpeta a Netlify y publicar los videos. Pasos exactos en la sección 5.
- **Publicación:** la rama `claude/darwin-commerce-agent-tk4q8o` está subida a `Valenpc1/Ecommerce` (7 commits al cierre del ciclo 0). El primer intento falló con 403 por falta de permiso de escritura; el reintento posterior funcionó.
- **Shopify (ciclo 1):** autorizado para los productos, pero el conector pidió iniciar sesión de nuevo en la primera consulta. **No se leyó ni se cambió nada en la tienda** y no existe `shopify/catalogo.json`. Qué hacer: sección 5, paso 1. Qué se creará: sección 9.

## 1. Decisiones que tomé sin pedir permiso

| Decisión | Motivo | Dónde se cambia |
|----------|--------|-----------------|
| Producto: antifaz Bluetooth | Mejor margen absoluto y menor riesgo de los 5 candidatos (ver `research/analisis-producto.md`) | Fase 1 de nuevo (`PIVOT_RULES.md` 4.D) |
| Marca de tienda "Pausa" | Palabra común y corta; no se comprobó que no exista otro negocio con ese nombre | `index.html`, `app.js` |
| Moneda USD con símbolo `$` | Mercado exacto no indicado; WhatsApp y Sheets funcionan en cualquier país | `CONFIG` en `app.js` |
| Envío incluido en el precio | Simplifica la decisión de compra y ya está cubierto en el cálculo de costos | `index.html` y precio |
| Pago y entrega se coordinan por WhatsApp | No hay pasarela de pago propia; evita tarjetas y comisiones | `index.html`, preguntas frecuentes |
| Si llega con defecto: cambio o devolución del dinero | Es lo mínimo que se espera al vender online. **Tú debes poder cumplirlo**; confírmalo con tu proveedor | Pregunta "¿Y si llega con un defecto?" |
| Pack de 2 con ahorro de $4.90 | Sube el ticket y apoya el ángulo de regalo | `PACKS` en `app.js` |
| Casilla de consentimiento y aviso de uso de datos | Se guardan nombre, WhatsApp y dirección. Revisa si tu país exige un aviso de privacidad más completo | `index.html` |
| Sin reseñas, contadores ni escasez | No existen datos reales; inventarlos es engañar al cliente | Regla fija del proyecto |
| Shopify solo para productos | Lo autorizaste en el ciclo 1. Alcance: solo productos propios con la etiqueta `darwin-commerce`, en DRAFT hasta cumplir 4 condiciones; nada de temas, envíos, pagos, descuentos ni apps | Sección 9 |
| No usé Sheets, Drive ni Gmail | No eran estrictamente necesarios y crean cosas en tus cuentas | Todo es código local |

## 2. Cálculo del precio

Fórmula: `precio ≥ (costo producto + envío + comisiones) ÷ (1 − 0.35)`

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

## 3. Archivos entregados

| Ruta | Contenido |
|------|-----------|
| `research/analisis-producto.md` | Fase 1: candidatos, fuentes, riesgos y límites de la evidencia |
| `sites/antifaz-bluetooth-pausa/` | `index.html`, `styles.css`, `app.js`, `netlify.toml`. Es la carpeta que se arrastra a Netlify |
| `apps-script/Code.gs`, `apps-script/README.md` | Backend de Google Sheets y guía de 5 pasos |
| `content/guiones-tiktok-reels.md` | Fase 3: 5 guiones con plano, texto, audio, caption y hashtags |
| `metrics/metrics.csv`, `PIVOT_RULES.md` | Fase 4: plantilla de métricas y reglas de pivote |
| `shopify/verificar-catalogo.mjs` | Compara `shopify/catalogo.json` (copia de lo que devuelve Shopify) con `CONFIG.PACKS`. Probado con 10 casos; `catalogo.json` aún no existe |
| `REPORT.md` | Este documento |

Diseño: tema oscuro, Bento en Flexbox puro (ningún `display:grid`), Plus Jakarta Sans desde Google Fonts, superficies separadas por tono (sin sombras, degradados ni líneas), una sola familia tipográfica, cinco tamaños de texto, animaciones de entrada con alternativa para movimiento reducido.

## 4. Qué se verificó y qué no

**Verificado con evidencia (comandos ejecutados en esta sesión):**

- **Backend:** 15 pruebas con servicios de Google simulados en Node: lead y pedido válidos, duplicados por id, límite por WhatsApp, honeypot, inyección de fórmulas neutralizada, total calculado en servidor, eventos, JSON inválido, bloqueo ocupado.
- **Sitio:** 84 comprobaciones automáticas con Chromium (Playwright) a 375, 820, 1280 y 1440 px:
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

**No verificado (hazlo en tu prueba de punta a punta):**

- El Apps Script contra Google real: autorización, fórmulas de la hoja `Resumen`, el prefijo `'` que evita fórmulas en Sheets y la lectura de la respuesta desde el navegador.
- El despliegue en Netlify. Los encabezados de `netlify.toml` podrían no aplicarse con arrastrar y soltar (no verificado); el sitio funciona igual.
- La apertura de WhatsApp en un teléfono real.
- Todo lo de Shopify: el conector pidió iniciar sesión de nuevo, así que no hay ninguna lectura ni escritura verificada (sección 9).
- Costos de proveedor, envío, plazos y las afirmaciones del producto (bloquea la luz, se conecta por Bluetooth, se carga por USB). Se comprueban con la unidad de muestra.
- Las políticas vigentes de TikTok e Instagram sobre contenido comercial y música.

**Limitaciones de esta sesión:**

- `copyfy.io`, `doba.com` e `hypersku.com` no resuelven desde la red del entorno. Si quieres un análisis más profundo, agrégalos a los dominios permitidos (*menú del entorno → Editar → Acceso a la red*).
- La skill de diseño instalada solo incluía su `SKILL.md`, sin los scripts `draw`, `inspect` y `lint`. Apliqué sus reglas a mano y las medí con Playwright. Su criterio de al menos 4 imágenes reales **no se cumple**: no hay fotos del producto, así que la portada usa una ilustración SVG. Cuando llegue la muestra, pon las fotos en la carpeta y súbelas en `PRODUCT_IMAGES` (`app.js`).
- La "tracción viral" no está medida con datos de ventas; solo hay menciones en listas de blogs comerciales.

## 5. Pasos manuales para ti, en orden

1. **Reconecta Shopify.** Entra a <https://claude.ai/customize/connectors>, vuelve a conectar Shopify y elige la tienda correcta. Los conectores se leen al iniciar la sesión: abre una **sesión nueva** con este repositorio y pega el mismo prompt de Darwin-Commerce; retoma desde este `REPORT.md`. Un servidor de Shopify configurado solo en tu computadora no pasa a la nube: tiene que ser el conector de claude.ai.
2. **Proveedor (tarjeta).** Pide cotización y **1 unidad de muestra** de un antifaz Bluetooth. Si la pasarela del proveedor exige tarjeta física, este es el paso que solo tú puedes hacer. Con la muestra, verifica la lista de `content/guiones-tiktok-reels.md` y actualiza costos en la tabla de la sección 2. Con esos datos y una foto real, el producto de Shopify puede pasar de DRAFT a ACTIVE.
3. **Google Sheets.** Sigue `apps-script/README.md` (5 pasos) y copia la URL `/exec`.
4. **Configura el sitio.** En `sites/antifaz-bluetooth-pausa/app.js` reemplaza `[WHATSAPP_NUMBER]` (país y número, solo dígitos) y `[APPS_SCRIPT_URL]`.
5. **Netlify.** Arrastra la carpeta `sites/antifaz-bluetooth-pausa` a <https://app.netlify.com/drop>. Copia el dominio resultante.
6. **Prueba de punta a punta.** Haz un pedido de prueba: debe aparecer una fila en `Pedidos`, eventos en `Eventos`, y el botón de confirmación debe abrir WhatsApp. Borra las filas de prueba.
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

## 8. Ver el sitio en local (opcional)

```bash
python3 -m http.server 8080 -d sites/antifaz-bluetooth-pausa
```

Abre <http://localhost:8080>. Sin configurar, el sitio muestra dos avisos en la consola y los botones de WhatsApp llevan al formulario.

## 9. Cambios en Shopify (ciclo 1, 2026-11-04)

**No se hizo ninguna lectura ni cambio en Shopify.** El conector respondió "necesita iniciar sesión de nuevo" en la primera consulta (`get-shop-info` y una búsqueda de productos), antes de cualquier escritura. Por eso no hay `shopify/catalogo.json`: ese archivo es una copia de lo que devuelve `get-product` y no se escribe a mano. Tampoco se pudo confirmar la moneda, el país, el plan ni los canales de la tienda.

| Acción | Producto | Id | Estado | Precio |
|--------|----------|----|--------|--------|
| Crear (pendiente) | Antifaz Bluetooth Pausa | sin crear | DRAFT | $29.90 (1 antifaz) y $54.90 (2 antifaces) |

**Lo que se creará al recuperar la sesión** (reglas `shopify_rules` del prompt):

- Producto "Antifaz Bluetooth Pausa" con etiqueta `darwin-commerce`, estado DRAFT y sin imágenes. Opción "Pack" con las variantes "1 antifaz" y "2 antifaces"; sus títulos coinciden con `label` en `CONFIG.PACKS` para que el verificador las empareje.
- Precios $29.90 y $54.90 si la tienda cobra en USD. Si la moneda es otra, se recalculan con la fórmula de la sección 2 y se anota la tasa de cambio usada (`[no verificado]` hasta tener una fuente).
- Costo por artículo $9.58 y $19.16 `[no verificado]`, sin seguimiento de inventario.
- Descripción mínima ("Antifaz Bluetooth para dormir, en pack de 1 o de 2 unidades"), sin afirmaciones de funcionamiento hasta verificar la muestra.

**Cuándo pasa a ACTIVE** (las cuatro a la vez): costo y plazo de envío confirmados por el proveedor, con URL o captura en `research/`; precio ≥ fórmula con ese costo; al menos una imagen real con derecho de uso; descripción sin afirmaciones no verificadas. Hoy no se cumple ninguna con datos confirmados.

**Landing:** `CONFIG.PACKS` ya coincide con los precios y títulos de variante previstos, así que no se tocó. El enlace "Comprar en la tienda" solo se añade con el producto ACTIVE y su URL pública; antes de dirigir tráfico a ese enlace hay que configurar envío gratis y pagos en Shopify.

**Al crear el producto:** releer con `get-product`, guardar `shopify/catalogo.json` y ejecutar `node shopify/verificar-catalogo.mjs`, que debe terminar con código 0. El verificador está probado con 10 casos sobre datos temporales de prueba (coincidencia, precio, moneda, variantes, etiqueta, JSON roto y archivo ausente); contra Shopify real todavía no se ha ejecutado.
