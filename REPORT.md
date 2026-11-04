# Reporte Darwin-Commerce · Ciclo 2: afiliación + portada 3D (actualizado 2026-11-04)

El historial de los ciclos 0 y 1 (antifaz Bluetooth) está en `archivo/ciclo-0-antifaz/`.

## Resumen

- **Modelo:** sin proveedor, sin contacto con el producto y sin publicidad propia, el dropshipping no es posible. El negocio es **afiliación con contenido indexable**: guías de compra de mate y termo que llevan a Mercado Libre. Shopify Collective no opera en el país ni la moneda de esta tienda; el antifaz quedó **ARCHIVED**.
- **Lo nuevo en este ciclo:** cargué tus 4 enlaces de afiliado, el dominio `ceba.netlify.app` (sitemap, robots y un `canonical` por página), la etiqueta de Search Console y una **portada con un mate en 3D** (el modelo que me pasaste, con su crédito CC BY 4.0).
- **Portada 3D:** el póster se ve siempre; el visor 3D se descarga recién después de cargar la página y solo si el dispositivo lo soporta. Primera carga: 62 KB. Todo se aloja en el propio sitio: sin cookies, sin analítica, sin servidores de terceros para el visor.
- **Ganancia por venta:** hasta 15% del valor de la compra, según la prensa `[no verificado]`. **Esperá ingresos cero durante las primeras semanas** mientras Google indexa el sitio.
- **Lo que no puedo verificar desde acá:** el sitio publicado (mi red bloquea `ceba.netlify.app`), los términos oficiales de Mercado Libre Afiliados y a dónde lleva cada enlace `meli.la`.
- **Lo que necesita a una persona:** el Paquete de arranque de la sección 4. Quedan 4 pasos cortos.

## 1. Decisiones que tomé sin pedir permiso

| Decisión | Motivo |
|----------|--------|
| Abandonar el dropshipping del antifaz | Requería un proveedor y una muestra que no existen, y el precio mínimo quedaba por encima del mercado local |
| Mecanismo: Mercado Libre Afiliados | Es local (pesos, envío y devoluciones los maneja la plataforma) y no exige proveedor ni atención de clientes |
| Nicho: mate y termo, con accesorios de mascotas como reserva | Se consume todo el año y las guías se pueden escribir sin datos técnicos de cada producto. La demanda está respaldada solo por menciones de prensa: es una decisión con criterio, no con datos |
| Marca "Cebá" | Corta y local. **No se contrastó con negocios existentes** |
| Español rioplatense (voseo) | Tu mercado es Argentina |
| Sin WhatsApp, formularios, Sheets ni analítica | Nadie atenderá consultas y así no se guardan datos personales ni hace falta aviso de privacidad |
| Los botones llevan a la búsqueda normal de Mercado Libre hasta que haya enlace real | El sitio es correcto en cualquier estado. El aviso de comisión solo aparece cuando hay enlace de afiliado |
| Asignar tus 4 enlaces como termos, mates, equipos y bombillas, en ese orden | Es el orden de la tabla del paquete. **No lo confirmaste ni abrí los enlaces** (evito generar clics propios) |
| Portada con el mate 3D como mejora progresiva | El sitio era "simplón"; el 3D aporta identidad sin romper nada si falla: queda el póster |
| Alojar el visor (`model-viewer` 4.4.0, Apache-2.0) en el sitio | Cero peticiones a terceros, sin cookies. Elegí 4.4.0 porque las 4.3.0 y 4.3.1 escriben mensajes de depuración en la consola |
| Nombres con versión en `assets/` y `vendor/` y caché de un año | Lo exige la caché `immutable`: si cambia un archivo, cambia su nombre |
| Netlify conectado al repositorio | Una sola vez; después cada push se publica solo |
| No volver a llamar a Collective | La herramienta indica que la respuesta no cambia para esta tienda |

## 2. Qué se hizo

| Ruta | Contenido |
|------|-----------|
| `sites/guias-mate-termo/` | Sitio estático: `index.html` y tres guías, `styles.css`, `app.js`, `enlaces.js` (el único archivo que se edita para los enlaces), `robots.txt`, `sitemap.xml`, `netlify.toml` |
| `sites/guias-mate-termo/assets/` | `mate-v1.glb` (853 KB), `mate-poster-v1.webp` (45 KB) y `LEEME.txt` con el crédito y los cambios |
| `sites/guias-mate-termo/vendor/` | `model-viewer-4.4.0.min.js`, su licencia Apache-2.0 y `LEEME.txt` |
| `scripts/verificar-sitio.mjs` y `.test.mjs` | Verificador (SEO, enlaces, aviso de comisión, honestidad, diseño, 3D, caché y privacidad) y sus 24 pruebas |
| `research/modelo-afiliados-argentina.md` | Auditoría de herramientas, mecanismos y nichos con fuentes |
| `PIVOT_RULES.md` | Reglas de pivote con ciclos de 14 días (las de 48 horas no aplican a búsqueda orgánica) |
| `content/materiales-redes.md` | Cinco piezas opcionales para redes: nadie las publica solo |
| `metrics/metrics.csv` | Plantilla con los 7 números que hay que pasar cada 14 días |
| `shopify/catalogo.json` | Estado releído de Shopify (antifaz ARCHIVED) |
| `archivo/ciclo-0-antifaz/` | Todo lo del modelo anterior y `LEEME.md` con el motivo |

Reglas de honestidad aplicadas a todo el sitio: no se afirma haber probado, usado ni recibido nada; no hay precios, reseñas ni escasez; cada dato de marca se atribuye a "la ficha de la marca"; y si hay enlace de afiliado, se avisa junto al botón.

### Portada con modelo 3D

| Aspecto | Detalle |
|---------|---------|
| Modelo | "Mate Uruguayo." de Ermolli en Sketchfab, licencia **CC BY 4.0** (la licencia figura en los metadatos del archivo; **no pude reabrir la página de Sketchfab** para reconfirmarla) |
| Cambios al modelo | Texturas reducidas a un máximo de 1024 px y convertidas a WebP: de 8,3 MB a 853 KB. La malla no se tocó. El crédito con el aviso de modificación está en el pie del inicio y en `assets/LEEME.txt` |
| Herramientas | glTF-Transform 4.5.1 para optimizar; `model-viewer` 4.4.0 para mostrar |
| Cuándo carga | El póster es parte de la página. El visor y el modelo (≈1,9 MB sin comprimir) se piden después del evento `load` y en reposo del navegador |
| Cuándo **no** carga | Sin WebGL, con ahorro de datos o conexión 2G, sin JavaScript o con el visor bloqueado: queda el póster |
| Movimiento | Gira solo y se puede arrastrar; con "reducir movimiento" activado no gira solo |
| Cambiar el modelo | Subir `mate-v2.glb` y `mate-poster-v2.webp`, actualizar `data-src` y el `src` del póster en `index.html` y correr el verificador (presupuestos: modelo 1500 KB, póster 150 KB, primera carga 200 KB) |

## 3. Qué mediré y cuándo

| Métrica | Fuente | Cuándo se mira |
|---------|--------|----------------|
| Páginas indexadas, impresiones, clics de búsqueda | Search Console (los pasás vos) | Cada 14 días desde la semana 5; antes solo errores técnicos |
| Clics en enlaces de afiliado, pedidos y comisión | Panel de afiliados (los pasás vos) | Cada 14 días |
| Estado del sitio | `verificar-sitio.mjs --estricto` | Antes de cada publicación |

Calendario si el sitio se publicó el 2026-11-04: primera lectura de datos el **2026-12-09**, segunda el 2026-12-23 y el límite de 12 semanas de `PIVOT_RULES.md` el **2027-01-27**. Con cada lectura aplico `PIVOT_RULES.md` con un solo cambio por ciclo; si en 12 semanas no hay ni 50 impresiones por semana, archivo el nicho.

## 4. Paquete de arranque: estado

| # | Paso | Estado |
|---|------|--------|
| 1 | Permitir `www.mercadolibre.com.ar`, `listado.mercadolibre.com.ar`, `articulo.mercadolibre.com.ar`, `www.shopify.com` y `ceba.netlify.app` en la red del entorno (menú del entorno → *Edit* → *Network access* → *Allowed domains*; <https://code.claude.com/docs/en/cloud-environments#network-access>) | **Pendiente, opcional.** Me permitiría leer los términos oficiales, abrir las fichas reales y comprobar el sitio publicado. Puede hacer falta una sesión nueva |
| 2 | Registrarte en Mercado Libre Afiliados | **Hecho por vos** (pasaste los enlaces). **Falta confirmar los términos**: que permitan enlaces en sitios web, cómo piden avisar la comisión y la tabla por categoría. Si me pegás ese texto, ajusto el aviso |
| 3 | Pasarme 4 enlaces de afiliado | **Cargados** en `enlaces.js` como `termos`, `mates`, `equipos` y `bombillas`. **Confirmame el orden y qué abre cada uno**; si no coincide, es un cambio de una línea |
| 4 | Conectar Netlify al repositorio (*Base directory* `sites/guias-mate-termo`, *Build command* vacío, *Publish directory* `.`) | **Hecho por vos** según el dominio que pasaste. No puedo ver el sitio, así que **no verifiqué que esté en línea ni que haya publicado el último commit** |
| 5 | Pasarme el dominio | **Hecho:** `https://ceba.netlify.app` en `sitemap.xml`, `robots.txt` y el `canonical` de cada página |
| 6 | Google Search Console | **A medias.** Agregué la etiqueta de verificación al inicio. Falta que, con el sitio publicado, apretés *Verificar* y envíes `https://ceba.netlify.app/sitemap.xml`. Pegaste el valor con el prefijo `google-site-verification=` (formato del registro DNS); en la etiqueta HTML puse solo el código. Si falla, elegí *Archivo HTML* y pasame el nombre y el contenido |
| 7 | Revisión semanal automática | **Sin respuesta.** Decime sí o no; no programo nada sin tu sí |
| 8 | Cada 14 días, pasarme 7 números (Search Console: impresiones, clics y páginas indexadas; panel de afiliados: clics, pedidos y comisión en pesos) | **Pendiente**, desde el 2026-12-09 |

## 5. Qué se verificó y qué no

**Verificado con evidencia:**

- **Verificador en modo estricto:** 0 fallos y 0 avisos sobre el sitio real (enlaces cargados, dominio, `canonical`, crédito CC BY, pesos, nombres versionados, licencia del visor, `app.js` sin peticiones propias, cookies ni almacenamiento).
- **24 pruebas con mutaciones:** modifican el sitio a propósito y deben fallar: primera persona, precios, escasez, enlaces rotos, anclas, aviso visible, scripts externos, CSS prohibido, enlaces no `https`, página fuera del sitemap, `canonical` ausente, crédito incompleto, póster sin texto alternativo, modelo sobre el presupuesto o inexistente, archivos sin versión, visor sin licencia y `app.js` con `fetch`, almacenamiento o importaciones ajenas. Todas pasan.
- **Chromium (132 comprobaciones):** el modelo carga y el póster se desvanece; con ahorro de datos, sin WebGL, sin JavaScript y con el visor bloqueado queda el póster y no hay errores; con movimiento reducido no gira solo; consola limpia; solo se piden recursos del propio sitio y de Google Fonts; titulares en dos líneas o menos a 375, 820 y 1440 px; el comportamiento de los enlaces en cuatro escenarios.
- **Defectos reales encontrados y corregidos:** la tabla de la guía de mates desbordaba la pantalla en móvil (424 px contra 375) y mi prueba era ciega a eso; `requestIdleCallback` recibía un número y el 3D **nunca cargaba**, lo detecté con una prueba de depuración. Ambos están corregidos y las pruebas ahora los detectan.
- **Contraste:** todos los pares de texto de la paleta superan 4,5:1.
- **Shopify:** plan Basic, Argentina, ARS; el antifaz está ARCHIVED y la etiqueta sigue intacta.
- **Publicación:** el commit `8315577` está en la rama remota y coincide con el local.

**No verificado:**

- **El sitio publicado:** si `ceba.netlify.app` está en línea, si publicó este commit y cómo se ve.
- **El 3D en un dispositivo real:** lo probé en Chromium con WebGL por software. No lo vi en iPhone, Android ni Safari, y el rendimiento en gama baja es desconocido. Si el visor falla, el sitio sigue funcionando con el póster.
- **El peso real con compresión:** el visor y el modelo suman ≈1,9 MB sin comprimir; Netlify suele comprimir el JavaScript, pero no lo medí.
- **Los términos oficiales** de Mercado Libre Afiliados y de Shopify (sitios bloqueados).
- **A dónde lleva cada `meli.la`** y que el orden asumido sea el correcto.
- **Que la verificación de Search Console funcione con la etiqueta** tal como la cargué.
- **La licencia vigente en Sketchfab** del modelo.
- **Las guías:** contienen criterios generales de compra, sin fuente por cada línea y sin datos técnicos de productos. Conviene que una persona las lea una vez.
- **La demanda de mate y termo** y el nombre "Cebá".

## 6. Riesgos abiertos

- **SEO lento y competido.** Contenido genérico y sin experiencia propia contra sitios grandes: puede no posicionar. No prometo resultados.
- **Dependencia de un programa que no pude leer.** Si los términos no permiten el modelo, hay que cambiarlo.
- **Enlaces no confirmados.** Si el orden de los `meli.la` está cruzado, un botón llevaría a otra categoría; es un riesgo de coherencia, no de seguridad.
- **Sin medición propia.** No puedo leer ni ventas ni tráfico: dependo de los 7 números cada 14 días.
- **Peso de la portada 3D en móviles modestos.** Está limitado por presupuesto y por la mejora progresiva, pero no lo medí en dispositivos reales.
- **Atribución CC BY.** Si se quita el crédito del pie o se cambia el modelo sin actualizarlo, se incumple la licencia; el verificador falla en ese caso.

## 7. Cambios en Shopify

Tienda conectada: plan Basic, Argentina, ARS. Solo se tocó lo creado por este proyecto. En este ciclo no hubo cambios nuevos.

| Acción | Producto | Id | Estado final |
|--------|----------|----|--------------|
| Archivar (no se borra) | Antifaz Bluetooth Pausa (`antifaz-bluetooth-pausa`) | `gid://shopify/Product/15530891018476` | ARCHIVED |

Otras llamadas fueron solo lectura (`get-shop-info`, búsquedas de productos y una consulta GraphQL de verificación). La búsqueda en Collective devolvió que no opera para esta tienda y no se repitió. Shopify sugirió cuatro apps de abastecimiento del App Store (Dropshipper-ai, Syncee AI Dropship, DropCommerce y Printful); están descartadas porque exigen proveedor, tarjeta y atención de clientes.
