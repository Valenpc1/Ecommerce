/* Cebá · aplica los enlaces de afiliado de enlaces.js. Sin dependencias, sin cookies, sin analítica. */
(function () {
  'use strict';

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
})();
