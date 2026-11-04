/* Cebá · enlaces de afiliado (enlaces.js) y modelo 3D del inicio.
   Sin cookies, sin analítica y sin peticiones a terceros. */
(function () {
  'use strict';

  /* ───── Enlaces de afiliado ───── */
  var enlaces = window.ENLACES || {};
  var esReal = function (v) {
    return typeof v === 'string' && /^https:\/\/\S+$/.test(v.trim()) && !/^\[.*\]$/.test(v.trim());
  };

  document.querySelectorAll('.compra').forEach(function (bloque) {
    var hayAfiliado = false;
    bloque.querySelectorAll('a[data-enlace]').forEach(function (a) {
      var clave = a.getAttribute('data-enlace');
      if (esReal(enlaces[clave])) {
        a.href = enlaces[clave].trim();
        a.rel = 'sponsored noopener';
        hayAfiliado = true;
      } else {
        a.rel = 'noopener';
      }
    });
    var aviso = bloque.querySelector('.aviso');
    if (aviso) aviso.hidden = !hayAfiliado;
  });

  if (!Object.keys(enlaces).some(function (k) { return esReal(enlaces[k]); })) {
    console.info('[Cebá] enlaces.js sin enlaces de afiliado: los botones llevan a la búsqueda normal de Mercado Libre.');
  }

  /* ───── Modelo 3D del hero (mejora progresiva) ─────
     El póster (imagen) se ve siempre. El visor 3D se descarga recién al terminar la página y solo si
     hay WebGL y el usuario no pidió ahorrar datos. Si algo falla, queda el póster. */
  var contenedor = document.querySelector('[data-modelo]');
  if (!contenedor) return;

  var conexion = navigator.connection || {};
  var ahorraDatos = conexion.saveData === true || /(^|-)2g$/.test(conexion.effectiveType || '');
  var hayWebGL = (function () {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  })();
  if (ahorraDatos || !hayWebGL) return;

  var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function montarVisor() {
    import('/vendor/model-viewer-4.4.0.min.js').then(function () {
      var mv = document.createElement('model-viewer');
      var atributos = {
        src: contenedor.getAttribute('data-src'),
        alt: 'Modelo 3D de un mate uruguayo con bombilla. Arrastrá para girarlo.',
        'camera-controls': '',
        'disable-zoom': '',
        'disable-pan': '',
        'touch-action': 'pan-y',
        'camera-orbit': '30deg 76deg 92%',
        'field-of-view': '28deg',
        'min-camera-orbit': 'auto 45deg auto',
        'max-camera-orbit': 'auto 100deg auto',
        'interaction-prompt': 'none',
        exposure: '1.15',
        'shadow-intensity': '1',
        'shadow-softness': '0.9',
        'environment-image': 'neutral'
      };
      if (!sinMovimiento) {
        atributos['auto-rotate'] = '';
        atributos['auto-rotate-delay'] = '0';
        atributos['rotation-per-second'] = '18deg';
      }
      Object.keys(atributos).forEach(function (k) { mv.setAttribute(k, atributos[k]); });
      mv.addEventListener('load', function () { contenedor.classList.add('listo'); }, { once: true });
      mv.addEventListener('error', function () { mv.remove(); }, { once: true });
      contenedor.appendChild(mv);
    }).catch(function () { /* queda el póster */ });
  }

  var arrancar = function () {
    if (window.requestIdleCallback) window.requestIdleCallback(montarVisor, { timeout: 2000 });
    else window.setTimeout(montarVisor, 1);
  };
  if (document.readyState === 'complete') arrancar();
  else window.addEventListener('load', arrancar, { once: true });
})();
