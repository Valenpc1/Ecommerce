# Fase 4 · Reglas de adaptación evolutiva

Estado: **ciclo 0, sin datos reales todavía.** Este documento se aplica solo cuando hay métricas en `metrics/metrics.csv` o en la hoja `Resumen` de Google Sheets. Las reglas se ejecutan sin pedir permiso: se decide, se cambia, se anota en el registro de experimentos y se reporta.

> **Todos los umbrales son hipótesis iniciales**, no benchmarks verificados. No hay en este proyecto datos de conversión propios ni una fuente confiable de referencia para este producto. Se recalibran cuando haya 500 visitas acumuladas.

## 1. Cómo se mide

Fuente: pestañas `Eventos`, `Leads` y `Pedidos` del Google Sheet (resumen automático en `Resumen`). Lo que la hoja no ve (vistas del video, retención, chats de WhatsApp) se anota a mano en `metrics/metrics.csv`.

| Métrica | Fórmula |
|---------|---------|
| Visitas | eventos `view` (una por sesión) |
| **CTR de la landing** | `cta_click ÷ view` |
| Inicio de formulario | `form_start ÷ cta_click` |
| Envío de formulario | `pedidos ÷ form_start` |
| Conversión total | `pedidos ÷ view` |
| Tasa de cierre | `pedidos con estado "entregado" ÷ pedidos recibidos` |
| Margen real por pedido | `total cobrado − (costo producto + envío + comisiones)` |

## 2. Cuándo se revisa

Cada **48 horas**, siempre a la misma hora, y siempre después de que haya pasado al menos una publicación nueva. Se copian los números a `metrics.csv` y se corre el árbol de la sección 3 **en orden**: la primera condición que se cumple manda.

## 3. Árbol de decisión

| # | Condición (ventana de 48 h) | Diagnóstico | Acción inmediata |
|---|------------------------------|-------------|------------------|
| 1 | Visitas **< 100** | Problema de tráfico, no de producto ni de web. Con tan pocas visitas un cero no dice nada | **No tocar** web, precio ni producto. Publicar 3 videos nuevos con ganchos distintos (ver `content/`) y revisar que el enlace de la biografía lleve el `utm_campaign` correcto |
| 2 | Visitas ≥ 100 y **CTR < 6%** | La promesa de la portada no engancha | Copy: aplicar la siguiente variante de titular (sección 4.B) |
| 3 | CTR ≥ 6% y `form_start ÷ cta_click < 30%` | Hay interés pero falta confianza o claridad | Layout 4.C-1: subir el bloque de pedido y la política de defectos |
| 4 | `form_start ÷ cta_click ≥ 30%` y `pedidos ÷ form_start < 35%` | El formulario espanta | Layout 4.C-2: formulario mínimo (nombre y WhatsApp) |
| 5 | `clics_whatsapp` > 2 × `form_start` | Tu público prefiere hablar | Layout 4.C-3: WhatsApp como acción principal |
| 6 | Visitas ≥ 300, pedidos = 0 | Precio o producto fuera de lugar | Precio: aplicar la siguiente variante (sección 4.A). Si ya se usó la variante C y siguen en 0, ir a producto (4.D) |
| 7 | ≥ 10 pedidos y tasa de cierre < 50% | Se pierde dinero después del clic | No es de web: confirmar por WhatsApp en menos de 1 hora, revisar plazos de entrega y entregas fallidas |
| 8 | Margen real < 35% del precio | Los costos reales superan la estimación | Subir precio $3 o retirar el pack hasta recuperar el 35% |
| 9 | Ninguna anterior | Funciona | **Escalar**: repetir el formato ganador con 3 ganchos nuevos y no cambiar nada de la web |

Regla de oro: **un solo cambio por ciclo de 48 h**, para saber qué funcionó. La excepción es la fila 1, que nunca toca la web.

## 4. Escalera de cambios (lista para ejecutar)

Los precios se cambian editando `CONFIG.PACKS` en `sites/antifaz-bluetooth-pausa/app.js`. El texto de los videos con precio hay que regrabarlo.

### 4.A Precio (nunca por debajo del 35% de margen)

Costo estimado por unidad: $15.58 = producto $9.58 + envío $3.50 + comisiones y fallos $2.50 `[estimaciones, validar con cotización real]`.

| Variante | Unidad | Pack de 2 | Margen unidad | Margen pack |
|----------|--------|-----------|---------------|-------------|
| A (actual) | $29.90 | $54.90 | 47.9% | 43.2% |
| B | $26.90 | $49.90 | 42.1% | 37.6% |
| C (piso) | $24.90 | $48.00 | 37.4% | 35.1% |
| Prohibido | menos de $23.97 | menos de $47.94 | menos de 35% | menos de 35% |

En `app.js`: variante B = `unit: 26.9` y pack de 2 `unit: 24.95`; variante C = `unit: 24.9` y pack de 2 `unit: 24.0`.

### 4.B Copy de la portada

Cada variante debe caber en dos líneas en móvil (unos 26 caracteres como máximo). Se elige primero la del video con mejor retención.

| Variante | Titular (`h1` de `index.html`) | Cuándo |
|----------|--------------------------------|--------|
| A (actual) | Duerme con música | Inicio |
| B | Tu música, sin auriculares | Ganó el video 1 o 3 |
| C | Duerme de día | Ganó el video 2 |
| D | Oscuridad y tu música | Ganó el video 5 |

Cambiar también el primer párrafo (`.lead`) para que repita la promesa del video ganador.

### 4.C Layout

| Código | Cambio | Dónde |
|--------|--------|-------|
| C-1 | Subir la sección `#pedido` justo debajo de la portada, antes del Bento, y mostrar la pregunta de defectos | orden de secciones en `index.html` |
| C-2 | Formulario mínimo: dejar solo nombre, WhatsApp y consentimiento; ciudad y dirección se piden por WhatsApp (quitar las reglas `ciudad` y `direccion` obligatorias en `app.js`) | `#order-form` y `RULES` |
| C-3 | Botón principal de la portada = WhatsApp; el formulario pasa a segundo plano | `.hero-actions` |

### 4.D Producto

Se usa **solo** cuando el árbol lo indica (fila 6 con la variante de precio C ya probada) o tras 14 días sin ningún pedido entregado con tráfico suficiente.

1. Repetir la Fase 1 con búsquedas nuevas (no reutilizar el análisis de hoy).
2. Reserva del análisis actual: herramienta gua sha (ver `research/analisis-producto.md`).
3. Copiar `sites/antifaz-bluetooth-pausa/` a `sites/<nuevo-slug>/`, cambiar `PRODUCT`, `PACKS`, textos y la ilustración o fotos, y reutilizar el **mismo** Apps Script (la columna `producto` distingue los pedidos).
4. Nuevo cálculo de precio con la fórmula `precio ≥ (costo + envío + comisiones) ÷ (1 − 0.35)`.
5. Nuevo conjunto de 5 guiones.

## 5. Condición de cierre ("evoluciona o muere")

Si pasan **3 ciclos de pivote (unos 14 días)** con tráfico suficiente (más de 300 visitas por ciclo) y **cero** pedidos entregados, el producto se archiva, se registra el aprendizaje y se reinicia en la Fase 1. El gasto en publicidad es $0, así que la pérdida máxima es el tiempo y la unidad de muestra.

## 6. Registro de experimentos

Una fila por cambio. Sin esta tabla no se puede saber qué funcionó.

| Fecha | Cambio (código del árbol) | Hipótesis | Métrica a vigilar | Resultado a 48 h | Decisión |
|-------|---------------------------|-----------|-------------------|------------------|----------|
| | | | | | |
