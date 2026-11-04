/**
 * PAUSA · Backend de captura (Google Apps Script → Google Sheets)
 *
 * Recibe por POST (text/plain con JSON) desde la landing:
 *   type "lead"   → pestaña Leads
 *   type "order"  → pestaña Pedidos (carrito)
 *   type "event"  → pestaña Eventos (vistas y clics, para medir CTR)
 *
 * Despliegue: Implementar → Nueva implementación → Aplicación web
 *   Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
 * Instrucciones paso a paso: apps-script/README.md
 */

var CONFIG = {
  NOTIFY_EMAIL: '',          // Opcional: correo que recibe un aviso por cada pedido nuevo
  RATE_LIMIT_SECONDS: 30,    // Mismo WhatsApp + mismo tipo de envío dentro de esta ventana = rechazado
  MAX_ITEMS: 10,
  TABS: { LEADS: 'Leads', ORDERS: 'Pedidos', EVENTS: 'Eventos', SUMMARY: 'Resumen' }
};

var HEADERS = {
  Leads: ['fecha', 'id', 'nombre', 'whatsapp', 'ciudad', 'mensaje', 'utm_source', 'utm_campaign', 'utm_content', 'referrer', 'estado'],
  Pedidos: ['fecha', 'id', 'nombre', 'whatsapp', 'ciudad', 'direccion', 'producto', 'cantidad', 'precio_unitario', 'total', 'moneda', 'notas', 'utm_source', 'utm_campaign', 'utm_content', 'estado'],
  Eventos: ['fecha', 'sesion', 'evento', 'utm_source', 'utm_campaign', 'utm_content', 'detalle']
};

var EVENT_TYPES = ['view', 'cta_click', 'wa_click', 'form_start'];

/* ───────────── Puntos de entrada ───────────── */

function doGet() {
  return json_({ ok: true, service: 'pausa-backend', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var body = parseBody_(e);
    if (!body) return json_({ ok: false, error: 'bad_request' });
    if (body.website) return json_({ ok: true }); // honeypot: los bots rellenan este campo oculto

    var type = String(body.type || '');
    var result;
    if (type === 'event') result = handleEvent_(body);
    else if (type === 'lead') result = withLock_(function () { return handleLead_(body); });
    else if (type === 'order') result = withLock_(function () { return handleOrder_(body); });
    else result = { ok: false, error: 'unknown_type' };
    return json_(result);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'server' });
  }
}

/* ───────────── Manejadores ───────────── */

function handleLead_(b) {
  var id = cleanId_(b.id);
  var nombre = clean_(b.nombre, 80);
  var whatsapp = cleanPhone_(b.whatsapp);
  if (!id || !nombre || !whatsapp) return { ok: false, error: 'invalid' };

  var sheet = tab_(CONFIG.TABS.LEADS);
  if (exists_(sheet, id)) return { ok: true, id: id, duplicate: true };
  if (rateLimited_('lead', whatsapp, id)) return { ok: false, error: 'rate_limited' };

  sheet.appendRow([
    new Date(), id, nombre, whatsapp,
    clean_(b.ciudad, 60), clean_(b.mensaje, 300),
    clean_(b.utm_source, 60), clean_(b.utm_campaign, 80), clean_(b.utm_content, 80),
    clean_(b.referrer, 80), 'nuevo'
  ]);
  return { ok: true, id: id };
}

function handleOrder_(b) {
  var id = cleanId_(b.id);
  var nombre = clean_(b.nombre, 80);
  var whatsapp = cleanPhone_(b.whatsapp);
  var items = parseItems_(b.items);
  if (!id || !nombre || !whatsapp || !items) return { ok: false, error: 'invalid' };

  var sheet = tab_(CONFIG.TABS.ORDERS);
  if (exists_(sheet, id)) return { ok: true, id: id, duplicate: true };
  if (rateLimited_('order', whatsapp, id)) return { ok: false, error: 'rate_limited' };

  var cantidad = 0;
  var total = 0;
  var producto = items.map(function (it) {
    cantidad += it.cantidad;
    total += it.cantidad * it.precio;
    return it.cantidad + '× ' + it.nombre;
  }).join(' | ');
  total = round2_(total); // el total lo calcula el servidor, no se confía en el del navegador

  sheet.appendRow([
    new Date(), id, nombre, whatsapp,
    clean_(b.ciudad, 60), clean_(b.direccion, 160),
    producto, cantidad, items[0].precio, total, clean_(b.moneda, 6) || 'ARS',
    clean_(b.notas, 300),
    clean_(b.utm_source, 60), clean_(b.utm_campaign, 80), clean_(b.utm_content, 80),
    'nuevo'
  ]);
  notify_('Pedido nuevo ' + id, nombre + ' · ' + whatsapp + '\n' + producto + '\nTotal: ' + total);
  return { ok: true, id: id, total: total };
}

function handleEvent_(b) {
  var ev = String(b.evento || '');
  if (EVENT_TYPES.indexOf(ev) === -1) return { ok: false, error: 'invalid_event' };
  tab_(CONFIG.TABS.EVENTS).appendRow([
    new Date(), clean_(b.sesion, 40), ev,
    clean_(b.utm_source, 60), clean_(b.utm_campaign, 80), clean_(b.utm_content, 80),
    clean_(b.detalle, 120)
  ]);
  return { ok: true };
}

/* ───────────── Utilidades ───────────── */

function parseBody_(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return null;
    var data = JSON.parse(e.postData.contents);
    return data && typeof data === 'object' ? data : null;
  } catch (err) {
    return null;
  }
}

function parseItems_(items) {
  if (!Array.isArray(items) || !items.length) return null;
  var out = [];
  for (var i = 0; i < items.length && i < CONFIG.MAX_ITEMS; i++) {
    var it = items[i] || {};
    var qty = Math.floor(Number(it.cantidad));
    var price = Number(it.precio);
    if (!(qty >= 1 && qty <= 20) || !(price >= 0 && price < 1e9)) return null;
    var name = clean_(it.nombre, 80);
    if (!name) return null;
    out.push({ nombre: name, cantidad: qty, precio: round2_(price) });
  }
  return out.length ? out : null;
}

/** Evita inyección de fórmulas (=, +, -, @) y caracteres de control en celdas. */
function clean_(value, max) {
  var s = value === null || value === undefined ? '' : String(value);
  s = s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (max) s = s.slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function cleanPhone_(value) {
  var raw = clean_(value, 30).replace(/^'/, '');
  var digits = raw.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return '';
  return clean_(raw.replace(/[^\d+\-() ]/g, ''), 25);
}

function cleanId_(value) {
  var s = String(value || '');
  return /^[A-Za-z0-9_-]{6,40}$/.test(s) ? s : '';
}

function round2_(n) {
  return Math.round(n * 100) / 100;
}

function rateLimited_(type, phone, id) {
  var cache = CacheService.getScriptCache();
  var key = 'rl:' + type + ':' + phone.replace(/\D/g, '');
  var seen = cache.get(key);
  if (seen && seen !== id) return true;
  cache.put(key, id, CONFIG.RATE_LIMIT_SECONDS);
  return false;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return { ok: false, error: 'busy' };
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function exists_(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var found = sheet.getRange(2, 2, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return !!found;
}

function notify_(subject, body) {
  if (!CONFIG.NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, '[Pausa] ' + subject, body);
  } catch (err) {
    console.error(err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function tab_(name) {
  var sh = spreadsheet_().getSheetByName(name);
  if (!sh) {
    setup();
    sh = spreadsheet_().getSheetByName(name);
  }
  return sh;
}

/** Letra de columna (A, B…) de un encabezado. */
function col_(tab, header) {
  var idx = HEADERS[tab].indexOf(header);
  if (idx < 0) throw new Error('Encabezado no encontrado: ' + tab + '.' + header);
  return String.fromCharCode(65 + idx);
}

/* ───────────── Configuración inicial (ejecutar una vez) ───────────── */

function setup() {
  var ss = spreadsheet_();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      var headers = HEADERS[name];
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
  buildSummary_(ss);
  return 'ok';
}

function buildSummary_(ss) {
  var sh = ss.getSheetByName(CONFIG.TABS.SUMMARY) || ss.insertSheet(CONFIG.TABS.SUMMARY);
  sh.clear();
  var E = CONFIG.TABS.EVENTS, L = CONFIG.TABS.LEADS, P = CONFIG.TABS.ORDERS;
  var pTotal = col_('Pedidos', 'total');
  var pEstado = col_('Pedidos', 'estado');
  var pCamp = col_('Pedidos', 'utm_campaign');
  var pLast = col_('Pedidos', 'estado');

  function between(tab, day) {
    return tab + '!$A:$A,">="&' + day + ',' + tab + '!$A:$A,"<"&(' + day + '+1)';
  }
  function evt(day, name) {
    return '=COUNTIFS(' + between(E, day) + ',' + E + '!$C:$C,"' + name + '")';
  }

  sh.getRange('A1').setValue('Resumen diario (últimos 14 días). CTR = clics CTA ÷ vistas. Conversión = pedidos ÷ vistas.').setFontWeight('bold');
  var header = ['Fecha', 'Vistas', 'Clics CTA', 'Clics WhatsApp', 'Leads', 'Pedidos', 'Entregados', 'Ingresos entregados', 'CTR', 'Conversión'];
  sh.getRange(2, 1, 1, header.length).setValues([header]).setFontWeight('bold');

  var rows = [];
  for (var i = 0; i < 14; i++) {
    var r = 3 + i;
    var day = '$A' + r;
    rows.push([
      i === 0 ? '=TODAY()' : '=A' + (r - 1) + '-1',
      evt(day, 'view'),
      evt(day, 'cta_click'),
      evt(day, 'wa_click'),
      '=COUNTIFS(' + between(L, day) + ')',
      '=COUNTIFS(' + between(P, day) + ')',
      '=COUNTIFS(' + between(P, day) + ',' + P + '!$' + pEstado + ':$' + pEstado + ',"entregado")',
      '=SUMIFS(' + P + '!$' + pTotal + ':$' + pTotal + ',' + between(P, day) + ',' + P + '!$' + pEstado + ':$' + pEstado + ',"entregado")',
      '=IFERROR(C' + r + '/B' + r + ',0)',
      '=IFERROR(F' + r + '/B' + r + ',0)'
    ]);
  }
  sh.getRange(3, 1, rows.length, header.length).setFormulas(rows);
  sh.getRange(3, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd');
  sh.getRange(3, 8, rows.length, 1).setNumberFormat('#,##0.00');
  sh.getRange(3, 9, rows.length, 2).setNumberFormat('0.0%');

  var totalRow = 3 + rows.length;
  var sums = ['Total'];
  for (var c = 2; c <= 8; c++) {
    var letter = String.fromCharCode(64 + c);
    sums.push('=SUM(' + letter + '3:' + letter + (totalRow - 1) + ')');
  }
  sums.push('=IFERROR(C' + totalRow + '/B' + totalRow + ',0)');
  sums.push('=IFERROR(F' + totalRow + '/B' + totalRow + ',0)');
  sh.getRange(totalRow, 1, 1, sums.length).setFormulas([sums]).setFontWeight('bold');
  sh.getRange(totalRow, 8).setNumberFormat('#,##0.00');
  sh.getRange(totalRow, 9, 1, 2).setNumberFormat('0.0%');

  var blockRow = totalRow + 3;
  sh.getRange(blockRow - 1, 1).setValue('Eventos por video / campaña (utm_campaign)').setFontWeight('bold');
  sh.getRange(blockRow - 1, 8).setValue('Pedidos por video / campaña').setFontWeight('bold');
  sh.getRange(blockRow, 1).setFormula(
    '=IFERROR(QUERY(' + E + "!A:G,\"select E, count(A) where E <> '' group by E pivot C label E 'utm_campaign'\",1),\"Sin datos aún\")"
  );
  sh.getRange(blockRow, 8).setFormula(
    '=IFERROR(QUERY(' + P + '!A:' + pLast + ',"select ' + pCamp + ', count(A), sum(' + pTotal + ") where " + pCamp + " <> '' group by " + pCamp +
    " label " + pCamp + " 'utm_campaign', count(A) 'pedidos', sum(" + pTotal + ") 'total'\",1),\"Sin pedidos aún\")"
  );
  sh.setFrozenRows(2);
}

/** Prueba manual desde el editor: debe aparecer una fila "PRUEBA borrar" en Leads. */
function selfTest() {
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        type: 'lead',
        id: 'TEST-' + Date.now(),
        nombre: 'PRUEBA borrar',
        whatsapp: '+10000000000',
        ciudad: 'Prueba',
        utm_campaign: 'selftest'
      })
    }
  });
  console.log(res.getContent());
  return res.getContent();
}
