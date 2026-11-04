# Backend de Pausa en 5 pasos (Google Sheets + Apps Script, costo cero)

Tiempo estimado: 5 minutos. Necesitas una cuenta de Google.

1. **Crea la hoja.** En [Google Sheets](https://sheets.new) crea una hoja nueva y llámala `Pausa · Pedidos`.
2. **Pega el código.** En la hoja: *Extensiones → Apps Script*. Borra lo que haya, pega todo el contenido de `Code.gs` y guarda (Ctrl+S).
3. **Inicializa y prueba.**
   - En el selector de funciones elige `setup` y pulsa *Ejecutar*. Google pedirá permisos: *Revisar permisos → tu cuenta → Avanzado → Ir a (proyecto) → Permitir*. Esto crea las pestañas `Leads`, `Pedidos`, `Eventos` y `Resumen`.
   - Ejecuta `selfTest`. Debe aparecer una fila `PRUEBA borrar` en `Leads` (bórrala después).
4. **Publica como aplicación web.** *Implementar → Nueva implementación → ⚙ Aplicación web*:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier persona**
   - Pulsa *Implementar* y copia la URL que termina en `/exec`.
5. **Conéctala a la web.** En `sites/antifaz-bluetooth-pausa/app.js` reemplaza `[APPS_SCRIPT_URL]` por esa URL y `[WHATSAPP_NUMBER]` por tu número con prefijo de país y sin signos (ej. `573001234567`). Vuelve a subir la carpeta a Netlify.

**Comprobación rápida:** abre la URL `/exec` en el navegador; debe responder `{"ok":true,"service":"pausa-backend",...}`. Luego envía un pedido de prueba desde la web y mira la pestaña `Pedidos`.

## Qué guarda cada pestaña

| Pestaña | Contenido |
|---------|-----------|
| `Leads` | Quien dejó su WhatsApp para recibir información (nombre, ciudad, utm) |
| `Pedidos` | Carrito: producto, cantidad, total (calculado por el servidor), dirección, `estado` |
| `Eventos` | Vistas y clics (`view`, `cta_click`, `wa_click`, `form_start`) con su `utm_campaign` |
| `Resumen` | Tabla diaria de 14 días con vistas, CTR y conversión, y desglose por video |

## Uso diario

- Cambia la columna `estado` de `Pedidos` a mano: `nuevo → confirmado → enviado → entregado` (o `cancelado`). `Resumen` suma como ingreso solo los `entregado`.
- Para atribuir ventas a cada video, publica el enlace con `?utm_source=tiktok&utm_campaign=video1` (ver `content/`).
- Aviso por correo por cada pedido: escribe tu correo en `CONFIG.NOTIFY_EMAIL` dentro de `Code.gs`. Vacío = sin avisos.

## Si cambias el código

*Implementar → Administrar implementaciones → ✏ editar → Versión: Nueva versión → Implementar.* La URL `/exec` se mantiene. Sin crear una versión nueva, la web seguirá usando el código anterior.

## Notas de seguridad y datos

- Los datos de tus clientes quedan en **tu** Google Drive. Bórralos si te lo piden.
- El script neutraliza valores que empiezan por `=`, `+`, `-` o `@` para evitar inyección de fórmulas en la hoja.
- Un campo oculto trampa (`website`) descarta bots; el mismo WhatsApp no puede enviar dos pedidos distintos en 30 segundos; reenviar el mismo pedido no lo duplica.
- Las cuotas gratuitas de Apps Script son suficientes para tráfico orgánico normal. Si un video se vuelve muy viral, revisa la página oficial de cuotas de Apps Script.
