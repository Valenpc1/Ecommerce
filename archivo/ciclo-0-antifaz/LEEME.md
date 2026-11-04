# Archivo: ciclos 0 y 1 (antifaz Bluetooth)

Todo lo de esta carpeta es del modelo anterior y **ya no es válido**. Se conserva con `git mv` para no perder historial.

## Por qué se archivó

- El modelo suponía un proveedor, una unidad de muestra y atención de pedidos por WhatsApp. Nada de eso existe: el dueño no tiene proveedor, no tendrá contacto con ningún producto y nadie atenderá consultas.
- Los guiones de `guiones-tiktok-reels.md` usan primera persona y demostraciones físicas ("yo uso esto", "prueba de la linterna"). Sin el producto en la mano serían engañosos.
- El precio mínimo con 35% de margen ($46.021 ARS por unidad) quedaba por encima del precio local más alto encontrado ($40.000): ver `analisis-producto.md`.

## Qué hay

| Ruta | Contenido |
|------|-----------|
| `REPORT-ciclos-0-1.md` | Reporte completo de los ciclos 0 y 1 |
| `PIVOT_RULES.md` | Reglas de pivote de 48 horas del modelo anterior |
| `analisis-producto.md` | Fase 1 y contraste con el mercado argentino (útil como referencia de precios locales) |
| `guiones-tiktok-reels.md` | 5 guiones del antifaz |
| `metrics.csv` | Plantilla de métricas anterior |
| `apps-script/` | Backend de Google Sheets para pedidos, leads y eventos (probado con 15 casos en simulación) |
| `sites/antifaz-bluetooth-pausa/` | Landing oscura con Bento en Flexbox (84 comprobaciones en Chromium) |
| `shopify/verificar-catalogo.mjs` | Verificador de catálogo de Shopify contra `CONFIG.PACKS` |

## Shopify

El producto "Antifaz Bluetooth Pausa" quedó en estado **ARCHIVED** (no se borra) con la etiqueta `darwin-commerce`. Su estado releído está en `shopify/catalogo.json`.
