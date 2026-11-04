/* Pausa · landing estática. Sin dependencias ni build. */
(() => {
  'use strict';

  /* ════════ CONFIGURACIÓN: lo único que debes editar ════════ */
  const CONFIG = {
    PRODUCT: 'Antifaz Bluetooth Pausa',
    // País + número, solo dígitos. Ej.: '573001234567'
    WHATSAPP_NUMBER: '[WHATSAPP_NUMBER]',
    // URL "/exec" de la aplicación web de Apps Script (ver apps-script/README.md)
    APPS_SCRIPT_URL: '[APPS_SCRIPT_URL]',
    CURRENCY: 'USD',
    CURRENCY_SYMBOL: '$',
    // Packs del catálogo. unit = precio por unidad; total = qty × unit.
    PACKS: [
      { id: '1', qty: 1, unit: 29.9, label: '1 antifaz' },
      { id: '2', qty: 2, unit: 27.45, label: '2 antifaces' }
    ],
    // Fotos reales del producto (rutas dentro de la carpeta). Vacío = se usa la ilustración.
    PRODUCT_IMAGES: [],
    TRACK_EVENTS: true
  };
  /* ═══════════════════════════════════════════════════════════ */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const isPlaceholder = (v) => /^\[.*\]$/.test(String(v).trim());
  const backendReady = () => !isPlaceholder(CONFIG.APPS_SCRIPT_URL) && /^https:\/\//.test(CONFIG.APPS_SCRIPT_URL);
  const waDigits = () => String(CONFIG.WHATSAPP_NUMBER).replace(/\D/g, '');
  const waReady = () => !isPlaceholder(CONFIG.WHATSAPP_NUMBER) && waDigits().length >= 8 && waDigits().length <= 15;
  const waLink = (text) => `https://wa.me/${waDigits()}?text=${encodeURIComponent(text)}`;

  const money = (n) => CONFIG.CURRENCY_SYMBOL + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const round2 = (n) => Math.round(n * 100) / 100;
  const packById = (id) => CONFIG.PACKS.find((p) => p.id === String(id)) || CONFIG.PACKS[0];
  const packTotal = (p) => round2(p.qty * p.unit);

  const store = (k, v) => { try { sessionStorage.setItem('pausa:' + k, v); } catch (_) { /* sin almacenamiento */ } };
  const read = (k) => { try { return sessionStorage.getItem('pausa:' + k); } catch (_) { return null; } };

  const rand = (n) => {
    const a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.from(a, (b) => (b % 36).toString(36)).join('').toUpperCase();
  };
  const newId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}${rand(4)}`;

  /* ───────── Atribución (utm) y sesión ───────── */
  const UTM = {};
  const params = new URLSearchParams(location.search);
  ['utm_source', 'utm_campaign', 'utm_content'].forEach((k) => {
    const fromUrl = params.get(k);
    if (fromUrl) { UTM[k] = fromUrl.slice(0, 80); store(k, UTM[k]); }
    else { const saved = read(k); if (saved) UTM[k] = saved; }
  });
  let SESSION = read('sid');
  if (!SESSION) { SESSION = rand(10); store('sid', SESSION); }
  let REFERRER = '';
  try { REFERRER = document.referrer ? new URL(document.referrer).hostname : ''; } catch (_) { REFERRER = ''; }

  /* ───────── Métricas (vistas y clics → pestaña Eventos) ───────── */
  function track(evento, detalle) {
    if (!CONFIG.TRACK_EVENTS || !backendReady()) return;
    try {
      fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'event', evento, sesion: SESSION, detalle: detalle || '', ...UTM })
      }).catch(() => {});
    } catch (_) { /* las métricas nunca deben romper la página */ }
  }

  /* ───────── Envío a Google Apps Script ───────── */
  // Devuelve: 'ok' | 'sin-confirmar' | 'rate' | 'rechazado' | 'error'
  async function send(payload) {
    const body = JSON.stringify(payload);
    const post = async (mode) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 15000);
      try {
        return await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST', mode, redirect: 'follow', signal: ctl.signal,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body
        });
      } finally { clearTimeout(timer); }
    };
    try {
      const res = await post('cors');
      const json = await res.json();
      if (json && json.ok) return 'ok';
      return json && json.error === 'rate_limited' ? 'rate' : 'rechazado';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'error';
      if (err instanceof SyntaxError) {
        console.error('[Pausa] Apps Script no devolvió JSON. Revisa que esté publicado con acceso "Cualquier persona".');
        return 'rechazado';
      }
      // Posible bloqueo CORS al leer la respuesta: el envío pudo llegar. Se reintenta sin leerla;
      // el servidor ignora duplicados porque el id es el mismo.
      try { await post('no-cors'); return 'sin-confirmar'; } catch (_) { return 'error'; }
    }
  }

  /* ───────── Catálogo y carrito ───────── */
  const state = { pack: CONFIG.PACKS[0], orderId: null, leadId: null };

  function renderPrices() {
    $$('[data-price]').forEach((el) => { el.textContent = money(packTotal(packById(el.dataset.price))); });
    $$('[data-save]').forEach((el) => {
      const p = packById(el.dataset.save);
      const single = CONFIG.PACKS[0];
      el.textContent = money(round2(single.unit * p.qty - packTotal(p)));
    });
  }

  function renderCart() {
    const p = state.pack;
    const t = money(packTotal(p));
    $('#cart-line').textContent = `${p.qty} × ${CONFIG.PRODUCT}`;
    $('#cart-subtotal').textContent = t;
    $('#cart-total').textContent = t;
    $$('.pack').forEach((label) => {
      label.classList.toggle('is-selected', $('input', label).checked);
    });
  }

  /* ───────── WhatsApp ───────── */
  const inquiryText = () =>
    `Hola, quiero información del ${CONFIG.PRODUCT} (${state.pack.label}, ${money(packTotal(state.pack))}).`;

  function orderText(nombre, ciudad, id) {
    const p = state.pack;
    return `Hola, soy ${nombre}. Quiero pedir: ${p.qty} × ${CONFIG.PRODUCT}. Total: ${money(packTotal(p))}.` +
      (ciudad ? ` Ciudad: ${ciudad}.` : '') + (id ? ` Pedido ${id}.` : '');
  }

  function refreshWa() {
    const form = $('#order-form');
    const nombre = form ? form.elements.nombre.value.trim() : '';
    const ciudad = form ? form.elements.ciudad.value.trim() : '';
    $$('[data-wa]').forEach((a) => {
      if (!waReady()) { a.setAttribute('href', '#pedido'); a.removeAttribute('target'); return; }
      const text = a.dataset.wa === 'order' && nombre ? orderText(nombre, ciudad, state.orderId) : inquiryText();
      a.setAttribute('href', waLink(text));
    });
  }

  /* ───────── Validación ───────── */
  const RULES = {
    nombre: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
    whatsapp: (v) => { const d = v.replace(/\D/g, ''); return d.length >= 7 && d.length <= 15 ? '' : 'Escribe un WhatsApp válido, con código de país.'; },
    ciudad: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu ciudad.'),
    direccion: (v) => (v.trim().length >= 5 ? '' : 'Escribe la dirección de entrega.'),
    consent: (v, el) => (el.checked ? '' : 'Necesitamos tu permiso para escribirte.')
  };

  function setError(el, msg) {
    const out = document.getElementById('e-' + el.id);
    if (out) out.textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }

  function validateForm(form) {
    let first = null;
    $$('[required]', form).forEach((el) => {
      const rule = RULES[el.name];
      if (!rule) return;
      const msg = rule(el.value, el);
      setError(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }

  function liveValidation(form) {
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (el.getAttribute && el.getAttribute('aria-invalid') && RULES[el.name]) setError(el, RULES[el.name](el.value, el));
    });
    form.addEventListener('change', (e) => {
      const el = e.target;
      if (el.getAttribute && el.getAttribute('aria-invalid') && RULES[el.name]) setError(el, RULES[el.name](el.value, el));
    });
  }

  function setStatus(el, msg, kind) {
    el.textContent = msg || '';
    if (kind) el.setAttribute('data-kind', kind); else el.removeAttribute('data-kind');
  }

  function setBusy(btn, busy, label) {
    btn.disabled = busy;
    btn.textContent = label;
  }

  /* ───────── Formulario de pedido (carrito) ───────── */
  function initOrder() {
    const form = $('#order-form');
    const status = $('#order-status');
    const submit = $('#order-submit');
    const confirmBox = $('#order-confirm');
    liveValidation(form);

    $$('input[name="pack"]').forEach((r) => r.addEventListener('change', () => {
      state.pack = packById(r.value);
      renderCart();
      refreshWa();
    }));
    form.addEventListener('input', refreshWa);

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validateForm(form)) { setStatus(status, 'Revisa los campos marcados.', 'error'); return; }
      state.orderId = state.orderId || newId('P');
      const fd = new FormData(form);
      const p = state.pack;
      const payload = {
        type: 'order', id: state.orderId,
        nombre: fd.get('nombre'), whatsapp: fd.get('whatsapp'),
        ciudad: fd.get('ciudad'), direccion: fd.get('direccion'), notas: fd.get('notas') || '',
        moneda: CONFIG.CURRENCY,
        items: [{ nombre: CONFIG.PRODUCT, cantidad: p.qty, precio: p.unit }],
        website: fd.get('website') || '',
        referrer: REFERRER, ...UTM
      };
      setBusy(submit, true, 'Enviando…');
      setStatus(status, '');
      const result = backendReady() ? await send(payload) : 'sin-backend';
      setBusy(submit, false, 'Enviar pedido');

      if (result === 'rate') {
        setStatus(status, 'Ya recibimos un pedido de este WhatsApp hace un momento. Si quieres cambiarlo, escríbenos por WhatsApp.', 'error');
        return;
      }
      if (result === 'rechazado' || result === 'error') {
        setStatus(status, 'No pudimos enviar tu pedido. Inténtalo otra vez o pídelo directo por WhatsApp.', 'error');
        return;
      }
      const nombre = String(payload.nombre).trim();
      $('#confirm-title').textContent = `Pedido recibido, ${nombre.split(' ')[0]}`;
      $('#confirm-text').textContent = result === 'sin-backend'
        ? `Tu código es ${payload.id}. Para terminar, envíanos el pedido por WhatsApp con el botón.`
        : `Tu código es ${payload.id}. Te escribiremos por WhatsApp para confirmar la dirección y la forma de pago. Si quieres ir más rápido, confírmalo tú con el botón.`;
      const wa = $('#confirm-wa');
      if (waReady()) { wa.setAttribute('href', waLink(orderText(nombre, String(payload.ciudad).trim(), payload.id))); }
      form.hidden = true;
      confirmBox.hidden = false;
      confirmBox.focus();
    });
  }

  /* ───────── Formulario de leads ───────── */
  function initLead() {
    const form = $('#lead-form');
    const status = $('#lead-status');
    const submit = $('#lead-submit');
    liveValidation(form);

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!validateForm(form)) { setStatus(status, 'Revisa los campos marcados.', 'error'); return; }
      state.leadId = state.leadId || newId('L');
      const fd = new FormData(form);
      const payload = {
        type: 'lead', id: state.leadId,
        nombre: fd.get('nombre'), whatsapp: fd.get('whatsapp'),
        mensaje: `Interés en ${CONFIG.PRODUCT}`,
        website: fd.get('website') || '',
        referrer: REFERRER, ...UTM
      };
      setBusy(submit, true, 'Enviando…');
      setStatus(status, '');
      const result = backendReady() ? await send(payload) : 'sin-backend';
      setBusy(submit, false, 'Quiero que me escriban');

      if (result === 'rate') { setStatus(status, 'Ya tenemos tu número. Te escribimos en breve.', ''); return; }
      if (result === 'rechazado' || result === 'error') {
        setStatus(status, 'No pudimos enviar tus datos. Inténtalo otra vez o escríbenos por WhatsApp.', 'error');
        return;
      }
      const nombre = String(payload.nombre).trim().split(' ')[0];
      setStatus(status, result === 'sin-backend'
        ? `Gracias, ${nombre}. Escríbenos por WhatsApp para continuar.`
        : `Gracias, ${nombre}. Te escribimos por WhatsApp en breve.`, '');
      form.reset();
      state.leadId = null;
    });
  }

  /* ───────── Fotos reales del producto (opcional) ───────── */
  function initImages() {
    if (!CONFIG.PRODUCT_IMAGES.length) return;
    $$('[data-product-visual]').forEach((slot, i) => {
      const src = CONFIG.PRODUCT_IMAGES[Math.min(i, CONFIG.PRODUCT_IMAGES.length - 1)];
      const img = new Image();
      img.src = src;
      img.alt = `${CONFIG.PRODUCT}, foto del producto`;
      img.decoding = 'async';
      slot.replaceChildren(img);
      slot.removeAttribute('aria-hidden');
    });
  }

  /* ───────── Entrada de secciones al hacer scroll ───────── */
  function initReveal() {
    const els = $$('.reveal');
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => {
      const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 80 + 'ms');
      io.observe(el);
    });
  }

  /* ───────── Eventos de interés ───────── */
  function initTracking() {
    if (!read('viewed')) { track('view'); store('viewed', '1'); }
    document.addEventListener('click', (e) => {
      const cta = e.target.closest('[data-cta]');
      if (cta) track('cta_click', cta.dataset.cta);
      const wa = e.target.closest('[data-wa]');
      if (wa) track('wa_click', wa.dataset.wa);
    });
    let started = false;
    document.addEventListener('focusin', (e) => {
      const form = e.target.closest && e.target.closest('form');
      if (form && !started) { started = true; track('form_start', form.id); }
    });
  }

  /* ───────── Arranque ───────── */
  function init() {
    if (!backendReady()) console.warn('[Pausa] APPS_SCRIPT_URL sin configurar: los pedidos no se guardarán en Google Sheets (solo WhatsApp).');
    if (!waReady()) console.warn('[Pausa] WHATSAPP_NUMBER sin configurar: los botones de WhatsApp apuntan al formulario.');
    renderPrices();
    renderCart();
    refreshWa();
    initImages();
    initOrder();
    initLead();
    initTracking();
    initReveal();
    window.__pausaReady = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
