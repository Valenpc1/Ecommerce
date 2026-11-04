# Reglas de pivote · modelo de afiliación con contenido indexable

Estado: **ciclo 2, sin datos.** El sitio todavía no está publicado. Se aplica cuando haya números en `metrics/metrics.csv` (o que el dueño los pase por chat). Se decide sin pedir permiso y con **un solo cambio por ciclo**.

> **Todos los umbrales son hipótesis iniciales**, sin benchmarks verificados. Se recalibran con los primeros datos reales.

Por qué ya no son 48 horas: el tráfico llega por búsqueda orgánica, que tarda semanas en indexar y posicionar `[no verificado]`. Decidir antes sería reaccionar a ruido.

## 1. Qué se mide y de dónde

| Métrica | Fuente | Quién la lee |
|---------|--------|--------------|
| Impresiones en búsqueda, clics desde búsqueda, páginas indexadas | Google Search Console | El dueño pasa los números |
| Clics en enlaces de afiliado, pedidos, comisión en pesos | Panel del programa de afiliados | El dueño pasa los números |
| Estado del sitio | `node scripts/verificar-sitio.mjs --estricto` | El agente |

Ratios: **CTR de búsqueda** = clics ÷ impresiones. **Paso a Mercado Libre** = clics en enlaces de afiliado ÷ clics desde búsqueda. **Comisión por clic** = comisión ÷ clics en enlaces de afiliado.

## 2. Calendario

| Semanas desde publicar | Qué se hace |
|------------------------|-------------|
| 1 a 4 | No se decide nada: indexación. Solo se corrigen errores técnicos que informe Search Console |
| 5 en adelante | Revisión cada 14 días con el árbol de abajo |

## 3. Árbol de decisión (la primera condición que se cumple manda)

| # | Condición | Diagnóstico | Acción |
|---|-----------|-------------|--------|
| 1 | A las 3 semanas, menos de 3 páginas indexadas | Problema de descubrimiento | Revisar cobertura, `robots.txt`, `sitemap.xml` y enlaces internos. No tocar el contenido |
| 2 | A las 5 semanas, con 3 páginas indexadas, menos de 100 impresiones | Poca demanda o mucha competencia en estos temas | Escribir 3 guías nuevas del mismo nicho con otras preguntas (búsquedas más específicas) |
| 3 | 100 impresiones o más y CTR de búsqueda menor al 1% | Los títulos no atraen | Reescribir `title` y `description` de las páginas con más impresiones |
| 4 | CTR de búsqueda de 1% o más y paso a Mercado Libre menor al 5% | La página no lleva al botón | Subir el bloque de compra, aclarar el texto del botón y la promesa |
| 5 | 50 clics en enlaces de afiliado o más y ningún pedido en 14 días | Enlaces mal atribuidos, categoría con poca conversión o publicaciones poco convincentes | Revisar los enlaces uno por uno y pasar de búsquedas a publicaciones concretas |
| 6 | Hay comisiones | Funciona | **Escalar**: 3 guías cercanas por ciclo y no cambiar lo que rinde |

## 4. Condición de cierre

Si pasan **12 semanas** con menos de 50 impresiones por semana, el nicho se archiva y se pasa al de reserva (accesorios de mascotas) o se repite la Fase 1. El gasto es $0: la pérdida máxima es tiempo.

## 5. Si los términos oficiales no permiten el modelo

Si el programa no permite enlaces en sitios web o exige algo que el sitio no cumple, **se detiene la publicación** y se cambia de canal: el único cambio razonable es pasar el contenido a otro formato que sí permitan, algo que hay que decidir con el texto oficial a la vista.

## 6. Registro de experimentos

| Fecha | Cambio (número del árbol) | Hipótesis | Métrica a vigilar | Resultado a 14 días | Decisión |
|-------|---------------------------|-----------|-------------------|---------------------|----------|
| | | | | | |
