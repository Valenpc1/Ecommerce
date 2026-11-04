# Reporte Darwin-Commerce · Ciclo 2: afiliación + portada 3D (actualizado 2026-11-04)

El historial de los ciclos 0 y 1 (antifaz Bluetooth) está en `archivo/ciclo-0-antifaz/`.

## Resumen

- **Modelo:** sin proveedor, sin contacto con el producto y sin publicidad propia, el dropshipping no es posible. El negocio es **afiliación con contenido indexable**: guías de compra de mate y termo que llevan a Mercado Libre. Shopify Collective no opera en el país ni la moneda de esta tienda; el antifaz quedó **ARCHIVED**.
- **Productos de Shopify (re-verificado el 2026-11-04 por tu pregunta):** Collective, el único camino de Shopify con productos reales de otras marcas, respondió otra vez "does not operate in this store's country or currency" (tienda: Argentina, ARS, plan Basic). Las muestras de mock.shop son de relleno y la propia herramienta aclara que no son inventario de proveedores. `search_products` solo lee tu tienda: hoy tiene 1 producto, el antifaz archivado. Las 4 apps de abastecimiento que sugiere Shopify se instalan desde tu panel (yo no puedo): tres trabajan con proveedores de EE. UU., UE, Reino Unido y Canadá y la cuarta (Printful) es de impresión bajo demanda. Por eso el modelo sigue siendo afiliación.
- **Sitio publicado:** tu captura muestra el sitio en línea (con la insignia de Netlify) y la portada 3D. Tiene tus 4 enlaces de afiliado, el dominio en `sitemap.xml`, `robots.txt` y `canonical`, y ahora el archivo de verificación de Google en la raíz.
- **Términos de Mercado Libre (el texto que pegaste):** permiten sitios y blogs como "medios", **pero hay que declarar el sitio y que Mercado Libre lo apruebe, estar inscripto fiscalmente y facturar** (plazos de 30 y 60 días desde el alta). Una venta cuenta solo si es de un producto nuevo y ocurre **dentro de las 24 h del clic**. El primer cobro exige $500 y 3 compras de 3 compradores distintos. Detalle en `research/terminos-afiliados-mercadolibre.md`.
- **Skill `mercadolibre-auto-research`:** la instalé con tu comando en un directorio aislado y la leí entera. **No sirve para esto**: tasa autos usados, no menciona afiliados ni termos y necesita navegar Mercado Libre, que está bloqueado acá. No quedó instalada en el proyecto.
- **Ganancia por venta:** hasta 15% del valor de la compra, según la prensa `[no verificado]`; la tabla oficial por categoría falta. **Esperá ingresos cero durante las primeras semanas** mientras Google indexa el sitio y los pagos tardan más.
- **Lo que no puedo verificar desde acá:** el sitio publicado (mi red lo bloquea), la tabla de comisiones, las obligaciones complementarias y a dónde lleva cada enlace `meli.la`.
- **Lo que necesita a una persona:** el Paquete de arranque de la sección 4, ahora de 7 pasos. Los más urgentes: Search Console con la propiedad correcta y la situación fiscal, que tiene plazo.

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
| No usar los enlaces propios ni automatizar clics o compras, nunca | Las compras del propio afiliado no cuentan, y las hechas con robots tampoco; un patrón propio podría tratarse como simulación de transacciones (4.2, 2.4) |
| Portada con el mate 3D como mejora progresiva | El sitio era "simplón"; el 3D aporta identidad sin romper nada si falla: queda el póster |
| Alojar el visor (`model-viewer` 4.4.0, Apache-2.0) en el sitio | Cero peticiones a terceros, sin cookies. Elegí 4.4.0 porque las 4.3.0 y 4.3.1 escriben mensajes de depuración en la consola |
| Nombres con versión en `assets/` y `vendor/` y caché de un año | Lo exige la caché `immutable`: si cambia un archivo, cambia su nombre |
| Archivo de verificación de Google en la raíz, sin tocarlo | Es el método que elegiste en Search Console y Google solo acepta su contenido exacto |
| Probar la skill solo en un directorio aislado y descartarla | No toca afiliados, termos ni mates; instalada en el proyecto ocuparía el contexto con instrucciones de otro propósito |
| Netlify conectado al repositorio | Una sola vez; después cada push se publica solo |
| Probar Collective una vez más a pedido del dueño (2026-11-04) y no insistir | Misma respuesta que la primera vez; la herramienta indica que no va a cambiar para esta tienda |
| No ejecutar los pasos de telemetría de la skill UCP de Shopify | Mandan tu mensaje textual y el id de sesión a Shopify; no los pediste y no hacen falta. Para desactivarlos de forma permanente, la propia skill indica crear el archivo vacío `~/.config/shopify-ai-toolkit/opt-out` o definir `OPT_OUT_INSTRUMENTATION=true`; no toqué ninguna configuración |

## 2. Qué se hizo

| Ruta | Contenido |
|------|-----------|
| `sites/guias-mate-termo/` | Sitio estático: `index.html` y tres guías, `styles.css`, `app.js`, `enlaces.js` (el único archivo que se edita para los enlaces), `robots.txt`, `sitemap.xml`, `netlify.toml` y `google4aef02e4b7763dd2.html` (verificación de Search Console) |
| `sites/guias-mate-termo/assets/` | `mate-v1.glb` (853 KB), `mate-poster-v1.webp` (45 KB) y `LEEME.txt` con el crédito y los cambios |
| `sites/guias-mate-termo/vendor/` | `model-viewer-4.4.0.min.js`, su licencia Apache-2.0 y `LEEME.txt` |
| `scripts/verificar-sitio.mjs` y `.test.mjs` | Verificador (SEO, enlaces, aviso de comisión, honestidad, diseño, 3D, caché, privacidad y archivo de Google) y sus 25 pruebas |
| `research/terminos-afiliados-mercadolibre.md` | Qué exigen los términos de Mercado Libre Afiliados, cláusula por cláusula, y cómo está Cebá frente a cada una |
| `research/modelo-afiliados-argentina.md` | Auditoría de herramientas, mecanismos y nichos con fuentes |
| `PIVOT_RULES.md` | Reglas de pivote con ciclos de 14 días (las de 48 horas no aplican a búsqueda orgánica) y condiciones del programa |
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

Las semanas **no empiezan a contar** hasta que estén listos Search Console (verificado y con el sitemap enviado), el medio aprobado en el panel de afiliados y la situación fiscal en regla (`PIVOT_RULES.md`). Calendario si todo eso estuviera hecho el 2026-11-04: primera lectura de datos el **2026-12-09**, segunda el 2026-12-23 y el límite de 12 semanas el **2027-01-27**. Con cada lectura aplico `PIVOT_RULES.md` con un solo cambio por ciclo; si en 12 semanas no hay ni 50 impresiones por semana, archivo el nicho.

## 4. Paquete de arranque: estado

| # | Paso | Estado |
|---|------|--------|
| 1 | **Search Console, con la propiedad correcta.** Agregá una propiedad de tipo **Prefijo de la URL** con `https://ceba.netlify.app/` (la dirección del sitio, **no** la del sitemap) y verificá con **Archivo HTML**. El archivo `google4aef02e4b7763dd2.html` ya está en la raíz: abrí `https://ceba.netlify.app/google4aef02e4b7763dd2.html`, comprobá que muestre `google-site-verification: google4aef02e4b7763dd2.html` y recién ahí apretá *Verificar*. Después, en *Sitemaps*, escribí `sitemap.xml` y enviá. Si Google te da otro nombre de archivo, pasámelo | **En curso.** Subí el archivo (commit `59254e6`). Por tu mensaje, la propiedad parece haberse creado con `https://ceba.netlify.app/sitemap.xml/`, que no sirve: la propiedad es el sitio y el sitemap se envía después. Mi redacción anterior de este paso era ambigua |
| 2 | **Panel de afiliados:** (a) **declarar `https://ceba.netlify.app` como medio**; (b) confirmarme el orden y el destino de los 4 enlaces (termos, mates, equipos, bombillas) | Enlaces cargados con orden asumido. **Falta (a) y (b).** Sin (a), las ventas del sitio no cuentan y Mercado Libre puede rechazar el medio (cláusula 3.2) |
| 3 | **Situación fiscal:** monotributista, Responsable Inscripto o IVA Exento, y factura para cobrar (cláusulas 2.1 y 5.3). Desde el alta tenés **30 días** para regularizar Mercado Pago y **60 días** para la documentación fiscal (6.5). Consultalo con un contador | **Pendiente, con plazo.** Decime si ya estás inscripto: si no, la cuota mensual fija del monotributo es el único costo del modelo y hay que contrastarla con la comisión esperable |
| 4 | **Darme las páginas de Mercado Libre que faltan:** permitir `www.mercadolibre.com.ar` en la red del entorno (menú del entorno → *Edit* → *Network access* → *Allowed domains*; <https://code.claude.com/docs/en/cloud-environments#network-access>; puede hacer falta una sesión nueva) **o** pegarme `/ayuda/27913` (comisiones por categoría) y `/ayuda/32818` (obligaciones complementarias, parte de los términos) | **Pendiente.** Sin esas dos no sé cuánto paga cada categoría ni cómo exigen avisar la comisión |
| 5 | Netlify conectado y dominio `ceba.netlify.app` | **Hecho por vos.** Tu captura muestra el sitio publicado con la portada 3D |
| 6 | Revisión semanal automática | **Sin respuesta.** Decime sí o no; no programo nada sin tu sí |
| 7 | Cada 14 días, pasarme 7 números (Search Console: impresiones, clics y páginas indexadas; panel de afiliados: clics, pedidos y comisión en pesos) | **Pendiente**, desde el 2026-12-09 |

Además, **no compres ni hagas clics repetidos por tus propios enlaces**: esas compras no cuentan y pueden tratarse como simulación (4.2 y 2.4).

## 5. Qué se verificó y qué no

**Verificado con evidencia:**

- **Verificador en modo estricto:** 0 fallos y 0 avisos sobre el sitio real (enlaces cargados, dominio, `canonical`, crédito CC BY, pesos, nombres versionados, licencia del visor, archivo de Google con su contenido exacto, `app.js` sin peticiones propias, cookies ni almacenamiento).
- **25 pruebas con mutaciones:** modifican el sitio a propósito y deben fallar: primera persona, precios, escasez, enlaces rotos, anclas, aviso visible, scripts externos, CSS prohibido, enlaces no `https`, página fuera del sitemap, `canonical` ausente, crédito incompleto, póster sin texto alternativo, modelo sobre el presupuesto o inexistente, archivos sin versión, visor sin licencia, `app.js` con `fetch`, almacenamiento o importaciones ajenas, y archivo de Google con contenido o nombre incorrecto. Todas pasan.
- **Chromium (132 comprobaciones):** el modelo carga y el póster se desvanece; con ahorro de datos, sin WebGL, sin JavaScript y con el visor bloqueado queda el póster y no hay errores; con movimiento reducido no gira solo; consola limpia; solo se piden recursos del propio sitio y de Google Fonts; titulares en dos líneas o menos a 375, 820 y 1440 px; el comportamiento de los enlaces en cuatro escenarios.
- **Tu captura del sitio publicado:** portada con el mate, tipografía y botones correctos. No distingue el póster del visor 3D activo.
- **Skill descartada con evidencia:** instalada con `npx skills add` en un directorio aislado (1 skill copiada) y leídos `SKILL.md`, `README.md`, `CLAUDE.md` y `build.sh`. El `.skill` empaquetado es idéntico a `SKILL.md`; este no contiene comandos de shell, credenciales ni direcciones fuera de Mercado Libre y del Banco Nación, y `build.sh` solo comprime `SKILL.md` en `/tmp`. Tiene 0 menciones de afiliados, comisiones, termos o mates. Su propio README deslinda responsabilidad por "posibles infracciones" a los términos de Mercado Libre.
- **Defectos reales encontrados y corregidos:** la tabla de la guía de mates desbordaba la pantalla en móvil (424 px contra 375); `requestIdleCallback` recibía un número y el 3D **nunca cargaba**; y, por tu captura, los titulares tenían las palabras pegadas ("Elegí bien tu termo y tu mate" se leía casi sin espacios): la tipografía trae un espacio de 0,18 em y el tracking negativo lo dejaba en 0,135 em; medí en Chromium y ahora es 0,235 em, con las mismas líneas y sin desborde. Los tres están corregidos; los dos primeros tienen pruebas que los detectan.
- **Contraste:** todos los pares de texto de la paleta superan 4,5:1.
- **Shopify:** plan Basic, Argentina, ARS; el antifaz está ARCHIVED y la etiqueta sigue intacta.
- **Publicación:** cada commit está en la rama remota y coincide con el local.

**No verificado:**

- **Los términos oficiales:** los leí del texto que pegaste, no de la página. Pueden estar incompletos o haber cambiado (pueden modificarse sin aviso, 7.1). Faltan tres páginas: comisiones, obligaciones complementarias y Brandbook.
- **Que `ceba.netlify.app` sirva el archivo de Google** y que la verificación funcione: no puedo abrir el sitio. Lo comprobás vos abriendo la dirección del archivo.
- **El 3D interactivo en un dispositivo real:** lo probé en Chromium con WebGL por software. Probá arrastrar el mate en tu navegador y en el celular.
- **El peso real con compresión:** el visor y el modelo suman ≈1,9 MB sin comprimir; Netlify suele comprimir el JavaScript, pero no lo medí.
- **A dónde lleva cada `meli.la`** y que el orden asumido sea el correcto.
- **La licencia vigente en Sketchfab** del modelo.
- **Las guías:** contienen criterios generales de compra, sin fuente por cada línea y sin datos técnicos de productos. Conviene que una persona las lea una vez.
- **Las apps de abastecimiento de Shopify:** si envían a Argentina, a qué costo y con qué plazos (apps.shopify.com y los sitios de los proveedores están bloqueados acá), y si Shopify Payments o un cobro local funciona en tu tienda.
- **La demanda de mate y termo** y el nombre "Cebá".

## 6. Riesgos abiertos

- **Mercado Libre decide a su exclusivo criterio** si admite al afiliado y si aprueba el sitio como medio (2.1 y 3.2). Si lo rechaza, el sitio no cobra. Un sitio nuevo de 4 páginas puede parecer poco "activo y regular": conviene sumar guías con frecuencia.
- **Requisito fiscal con plazos.** Si pasan 60 días desde el alta sin la documentación, pueden suspender y esas ventas no se pagan. Si no estás inscripto, la cuota del monotributo puede superar las comisiones de los primeros meses y volver negativo **tu** flujo de caja.
- **Ventana corta y pago lento.** Solo cuentan compras dentro de las 24 h del clic, de productos nuevos y sin devolución. El primer cobro necesita 3 compradores distintos y llega semanas después de la compra.
- **SEO lento y competido.** Contenido genérico y sin experiencia propia contra sitios grandes: puede no posicionar. No prometo resultados.
- **Términos modificables sin aviso** (7.1) y tres páginas de Mercado Libre sin leer.
- **Enlaces no confirmados.** Si el orden de los `meli.la` está cruzado, un botón llevaría a otra categoría; es un riesgo de coherencia, no de seguridad.
- **Sin medición propia.** No puedo leer ni ventas ni tráfico: dependo de los 7 números cada 14 días.
- **Atribución y derechos del modelo 3D.** Si se quita el crédito del pie o se cambia el modelo sin actualizarlo, se incumple la licencia (el verificador falla). Y la cláusula 8.4 pide tener los derechos del contenido: la licencia CC BY alcanza, pero si Mercado Libre lo objetara hay que reemplazar el visual.
- **Peso de la portada 3D en móviles modestos.** Está limitado por presupuesto y por la mejora progresiva, pero no lo medí en dispositivos reales.

## 7. Cambios en Shopify

Tienda conectada: plan Basic, Argentina, ARS. Solo se tocó lo creado por este proyecto. En este ciclo no hubo cambios nuevos.

| Acción | Producto | Id | Estado final |
|--------|----------|----|--------------|
| Archivar (no se borra) | Antifaz Bluetooth Pausa (`antifaz-bluetooth-pausa`) | `gid://shopify/Product/15530891018476` | ARCHIVED |

Otras llamadas fueron solo lectura (`get-shop-info`, búsquedas de productos y una consulta GraphQL de verificación). La búsqueda en Collective devolvió que no opera para esta tienda las dos veces que se probó (la segunda, el 2026-11-04, a pedido del dueño) y no se repetirá. Shopify sugirió cuatro apps de abastecimiento del App Store (Dropshipper-ai, Syncee AI Dropship, DropCommerce y Printful); están descartadas por criterio, no por una prueba: en general implican pagar al proveedor cada pedido, envío internacional a la Argentina y reclamos a tu cargo, justo lo que no querés, y la tienda seguiría sin tráfico porque no hay publicidad `[no verificado: los sitios de las apps están bloqueados acá]`. Se instalan desde el panel de Shopify, no desde acá. Aunque Collective funcionara, importar productos es una acción del comerciante con el botón de importar de la app de Collective: no tiene API para aceptar invitaciones ni lo puedo hacer yo (documentación de Shopify). La skill `shopify-plugin:ucp` es un kit para **comprar** en nombre de un cliente y el comando `ucp` no está instalado acá: no la usé.
