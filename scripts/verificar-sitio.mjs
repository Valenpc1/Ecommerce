#!/usr/bin/env node
/**
 * Verifica el sitio de guías: SEO básico, enlaces internos, enlaces de afiliado, aviso de comisión,
 * reglas de honestidad (nadie tiene el producto) y reglas de diseño. Sin dependencias.
 *
 * Uso: node scripts/verificar-sitio.mjs [carpeta_del_sitio] [--estricto]
 * Código 0 = sin FALLOS. Los AVISOS (marcadores pendientes como [DOMINIO]) solo fallan con --estricto,
 * que es lo que hay que correr antes de dar el sitio por publicable.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const estricto = args.includes('--estricto');
const raiz = resolve(args.find((a) => !a.startsWith('--')) ?? 'sites/guias-mate-termo');
let fallos = 0;
let avisos = 0;
const ok = (m) => console.log('  OK    ' + m);
const fallo = (m) => { fallos++; console.error('  FALLO ' + m); };
const aviso = (m) => { avisos++; console.warn('  AVISO ' + m); };

if (!existsSync(raiz)) { console.error(`FALLO: no existe ${raiz}`); process.exit(1); }
const leer = (p) => readFileSync(p, 'utf8');
const peso = (ruta) => statSync(ruta).size / 1024;

function paginas(dir) {
  let out = [];
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    if (statSync(p).isDirectory()) out = out.concat(paginas(p));
    else if (nombre === 'index.html') out.push(p);
  }
  return out;
}
const rutaDe = (p) => '/' + p.slice(raiz.length + 1).replace(/index\.html$/, '').replace(/\\/g, '/');

const lista = paginas(raiz);
if (!lista.length) { console.error('FALLO: no hay páginas index.html'); process.exit(1); }
console.log(`Sitio: ${raiz} · ${lista.length} páginas`);

/* ───── enlaces.js ───── */
const rutaEnlaces = join(raiz, 'enlaces.js');
const claves = {};
if (!existsSync(rutaEnlaces)) fallo('falta enlaces.js');
else {
  for (const m of leer(rutaEnlaces).matchAll(/(\w+)\s*:\s*"([^"]*)"/g)) claves[m[1]] = m[2];
  for (const [k, v] of Object.entries(claves)) {
    if (/^\[.*\]$/.test(v.trim())) aviso(`enlaces.js: ${k} sigue pendiente (${v})`);
    else if (!/^https:\/\/\S+$/.test(v.trim())) fallo(`enlaces.js: ${k} no es una URL https válida`);
    else ok(`enlaces.js: ${k} tiene un enlace real`);
  }
}

/* ───── honestidad ───── */
// \b de JavaScript solo entiende letras ASCII ("Probé " no tendría límite tras la é): se usan límites Unicode.
const palabra = (alternativas) => new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternativas})(?![\\p{L}\\p{N}_])`, 'iu');
const PROHIBIDAS = [
  [palabra('prob[ée]|probamos|probado|us[ée]|usamos|compr[ée]|compramos|recib[ií]|recibimos|testeamos|teste[ée]'), 'afirma haber probado, usado, comprado o recibido un producto', true],
  [palabra('(?:mi|nuestra) experiencia'), 'apela a experiencia propia', false],
  [palabra('miles de|más vendid[oa]s?|testimonios?|reseñas? de clientes|stock limitado|últimas unidades|oferta por tiempo limitado|solo por hoy'), 'usa prueba social, escasez o urgencia no verificables', false],
  [/[$]\s?\d|(?<![\p{L}])ARS\s?\d|\d\s?pesos(?![\p{L}])/iu, 'publica un precio (cambian seguido; se mira en la publicación vigente)', false]
];
const textoVisible = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ');

/* ───── por página ───── */
const titulos = new Set();
const canonicales = new Map();
const descripciones = new Set();
const modificados = new Map(); // canonical -> dateModified (debe coincidir con el lastmod del sitemap)
for (const p of lista) {
  const ruta = rutaDe(p);
  const html = leer(p);
  const et = `[${ruta}]`;

  if (/<html[^>]*\blang="es-AR"/.test(html)) ok(`${et} lang es-AR`); else fallo(`${et} falta <html lang="es-AR">`);

  const titulo = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1];
  if (!titulo) fallo(`${et} falta <title>`);
  else if (titulo.length > 70) fallo(`${et} <title> de ${titulo.length} caracteres (máximo 70)`);
  else if (titulos.has(titulo)) fallo(`${et} <title> repetido`);
  else { titulos.add(titulo); ok(`${et} title (${titulo.length} car.)`); }

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1];
  if (!desc) fallo(`${et} falta meta description`);
  else if (desc.length < 70 || desc.length > 170) fallo(`${et} meta description de ${desc.length} caracteres (entre 70 y 170)`);
  else if (descripciones.has(desc)) fallo(`${et} meta description repetida`);
  else { descripciones.add(desc); ok(`${et} meta description (${desc.length} car.)`); }

  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) ?? [])[1];
  canonicales.set(ruta, canonical);
  if (!canonical) fallo(`${et} falta <link rel="canonical">`); else ok(`${et} canonical`);

  // etiquetas para compartir (Open Graph) y datos estructurados (JSON-LD)
  if (canonical) {
    const og = (k) => (html.match(new RegExp(`<meta property="${k}" content="([^"]*)"`)) ?? [])[1];
    const faltanOg = ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt'].filter((k) => !og(k));
    if (!/<meta name="twitter:card" content="[^"]+"/.test(html)) faltanOg.push('twitter:card');
    if (faltanOg.length) fallo(`${et} faltan etiquetas para compartir: ${faltanOg.join(', ')}`);
    else if (og('og:url') !== canonical) fallo(`${et} og:url (${og('og:url')}) no coincide con el canonical`);
    else {
      try {
        const u = new URL(og('og:image'));
        const archivo = join(raiz, u.pathname);
        if (u.origin !== new URL(canonical).origin) fallo(`${et} og:image debe estar en ${new URL(canonical).origin}`);
        else if (!existsSync(archivo)) fallo(`${et} og:image no existe en el sitio: ${u.pathname}`);
        else if (peso(archivo) > 300) fallo(`${et} og:image pesa ${peso(archivo).toFixed(0)} KB (máximo 300)`);
        else ok(`${et} etiquetas para compartir completas (imagen de ${peso(archivo).toFixed(0)} KB)`);
      } catch { fallo(`${et} og:image no es una URL absoluta`); }
    }

    const entidades = [];
    const scriptsLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!scriptsLd.length) fallo(`${et} faltan los datos estructurados (JSON-LD)`);
    for (const [, cuerpo] of scriptsLd) {
      try {
        const d = JSON.parse(cuerpo);
        if (d['@context'] !== 'https://schema.org') fallo(`${et} JSON-LD sin "@context": "https://schema.org"`);
        entidades.push(...(d['@graph'] ?? [d]));
      } catch (e) { fallo(`${et} JSON-LD inválido: ${e.message}`); }
    }
    if (entidades.length) {
      const buscar = (tipo) => entidades.find((e) => e && e['@type'] === tipo);
      const h1txt = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? '').replace(/<[^>]+>/g, '').trim();
      const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (ruta === '/') {
        const sitio = buscar('WebSite');
        if (!sitio) fallo(`${et} falta el JSON-LD WebSite`);
        else if (sitio.url !== canonical || !sitio.name) fallo(`${et} el JSON-LD WebSite debe tener name y una url igual al canonical`);
        else ok(`${et} JSON-LD WebSite válido`);
      } else {
        const art = buscar('Article');
        const migas = buscar('BreadcrumbList');
        const errores = [];
        if (!art) errores.push('falta Article');
        else {
          if (art.mainEntityOfPage !== canonical) errores.push('mainEntityOfPage no coincide con el canonical');
          if (art.headline !== h1txt) errores.push('headline distinto del h1');
          if ((art.headline ?? '').length > 110) errores.push('headline de más de 110 caracteres');
          if (!formatoFecha.test(art.datePublished ?? '') || !formatoFecha.test(art.dateModified ?? '') || art.dateModified < art.datePublished) errores.push('datePublished o dateModified inválidas');
          if (!art.author?.name || !art.publisher?.name) errores.push('faltan author o publisher');
          modificados.set(canonical, art.dateModified);
        }
        if (!migas) errores.push('falta BreadcrumbList');
        else {
          const items = migas.itemListElement ?? [];
          if (items.length < 2 || items.some((it, i) => it.position !== i + 1) || items[items.length - 1].item !== canonical) errores.push('BreadcrumbList mal armada (posiciones o última URL distinta del canonical)');
        }
        if (errores.length) fallo(`${et} JSON-LD: ${errores.join('; ')}`); else ok(`${et} JSON-LD Article y BreadcrumbList válidos`);
      }
    }
  }

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 === 1) ok(`${et} un solo h1`); else fallo(`${et} tiene ${h1} h1 (debe haber 1)`);

  // enlaces internos y anclas
  for (const m of html.matchAll(/href="(\/[^"]*|#[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//')) { fallo(`${et} enlace sin protocolo: ${href}`); continue; }
    const [camino, ancla] = href.split('#');
    let destino = p;
    if (camino && camino !== '/') {
      destino = camino.endsWith('/') ? join(raiz, camino, 'index.html') : join(raiz, camino);
    } else if (camino === '/') destino = join(raiz, 'index.html');
    if (camino && !existsSync(destino)) { fallo(`${et} enlace roto: ${href}`); continue; }
    if (ancla && !new RegExp(`id="${ancla}"`).test(leer(destino))) fallo(`${et} ancla inexistente: ${href}`);
  }

  // scripts: solo locales
  for (const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) {
    if (!/^\/(enlaces|app)\.js$/.test(m[1])) fallo(`${et} script no permitido: ${m[1]}`);
  }

  // enlaces de afiliado
  for (const m of html.matchAll(/<a\b[^>]*data-enlace="([^"]+)"[^>]*>/g)) {
    const etiqueta = m[0];
    const clave = m[1];
    if (!(clave in claves)) fallo(`${et} data-enlace="${clave}" no existe en enlaces.js`);
    const href = (etiqueta.match(/href="([^"]*)"/) ?? [])[1] ?? '';
    if (!href.startsWith('https://listado.mercadolibre.com.ar/')) fallo(`${et} el enlace por defecto de "${clave}" no es una búsqueda de Mercado Libre`);
    if (!/target="_blank"/.test(etiqueta) || !/rel="[^"]*noopener/.test(etiqueta)) fallo(`${et} "${clave}" debe abrir en pestaña nueva con rel noopener`);
  }

  // aviso de comisión en cada bloque de compra
  const bloques = html.match(/<section class="compra"[\s\S]*?<\/section>/g) ?? [];
  const conEnlace = html.match(/data-enlace=/g) ?? [];
  if (conEnlace.length && !bloques.length) fallo(`${et} hay botones de afiliado fuera de un bloque .compra`);
  for (const b of bloques) {
    if (!/<p class="aviso" hidden>[^<]*enlaces? de afiliado[^<]*comisi[óo]n/.test(b)) fallo(`${et} un bloque .compra no tiene el aviso de comisión oculto por defecto`);
    else ok(`${et} aviso de comisión presente y oculto por defecto`);
  }

  // honestidad
  const texto = textoVisible(html);
  for (const [re, motivo, admiteNegacion] of PROHIBIDAS) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of texto.matchAll(g)) {
      if (admiteNegacion && /\b(no|ni)\s+$/i.test(texto.slice(Math.max(0, m.index - 6), m.index))) continue;
      fallo(`${et} ${motivo}: "${m[0]}"`);
    }
  }
}

/* ───── modelo 3D, activos y app.js ───── */
const VERSIONADO = /-(v\d+|\d+\.\d+(?:\.\d+)?)(?:\.[a-z0-9]+)+$/i;
const EXENTOS = /^(LEEME|.*LICENSE.*)\.txt$/i;
for (const p of lista) {
  const html = leer(p);
  if (!/data-modelo/.test(html)) continue;
  const et = `[${rutaDe(p)}]`;
  const src = (html.match(/data-modelo[^>]*data-src="([^"]+)"/) ?? [])[1];
  const glb = src ? join(raiz, src) : '';
  if (!src || !existsSync(glb)) fallo(`${et} el modelo 3D indicado en data-src no existe`);
  else if (peso(glb) > 1500) fallo(`${et} el modelo 3D pesa ${peso(glb).toFixed(0)} KB (máximo 1500)`);
  else ok(`${et} modelo 3D de ${peso(glb).toFixed(0)} KB`);

  const poster = html.match(/<img class="hero-poster"([^>]*)>/);
  if (!poster) fallo(`${et} falta la imagen de póster (.hero-poster)`);
  else {
    const psrc = (poster[1].match(/src="([^"]+)"/) ?? [])[1];
    if (!psrc || !existsSync(join(raiz, psrc))) fallo(`${et} el póster no existe: ${psrc}`);
    else if (peso(join(raiz, psrc)) > 150) fallo(`${et} el póster pesa ${peso(join(raiz, psrc)).toFixed(0)} KB (máximo 150)`);
    else ok(`${et} póster de ${peso(join(raiz, psrc)).toFixed(0)} KB`);
    if (!/alt="[^"]{8,}"/.test(poster[1])) fallo(`${et} el póster necesita un texto alternativo descriptivo`);
    if (!/width="\d+"/.test(poster[1]) || !/height="\d+"/.test(poster[1])) fallo(`${et} el póster necesita width y height`);
  }

  const faltan = [
    [/Ermolli/, 'el autor (Ermolli)'],
    [/sketchfab\.com\/3d-models\/mate-uruguayo-e2fd6553b7b144f8afe2dc51929f95a3/, 'el enlace a la fuente'],
    [/CC BY 4\.0/, 'la licencia (CC BY 4.0)'],
    [/creativecommons\.org\/licenses\/by\/4\.0/, 'el enlace a la licencia'],
    [/modific/i, 'el aviso de modificaciones']
  ].filter(([re]) => !re.test(html)).map(([, nombre]) => nombre);
  if (faltan.length) fallo(`${et} falta en el crédito del modelo 3D: ${faltan.join(', ')}`);
  else ok(`${et} crédito CC BY 4.0 completo`);

  if (rutaDe(p) === '/') {
    const psrc = (poster?.[1].match(/src="([^"]+)"/) ?? [])[1];
    const primera = ['index.html', 'styles.css', 'app.js', 'enlaces.js', psrc].filter(Boolean).map((f) => join(raiz, f)).filter(existsSync).reduce((s, f) => s + peso(f), 0);
    if (primera > 200) fallo(`${et} la primera carga pesa ${primera.toFixed(0)} KB (máximo 200; el 3D carga después)`);
    else ok(`${et} primera carga de ${primera.toFixed(0)} KB (el 3D carga después)`);
  }
}

for (const carpeta of ['assets', 'vendor']) {
  const dir = join(raiz, carpeta);
  if (!existsSync(dir)) continue;
  for (const nombre of readdirSync(dir)) {
    if (EXENTOS.test(nombre)) continue;
    if (!VERSIONADO.test(nombre)) fallo(`${carpeta}/${nombre}: se guarda un año en caché, así que el nombre debe llevar versión (p. ej. -v1 o -4.4.0)`);
  }
}
if (existsSync(join(raiz, 'vendor')) && readdirSync(join(raiz, 'vendor')).some((n) => /^model-viewer/.test(n) && !/LICENSE/i.test(n))) {
  if (existsSync(join(raiz, 'vendor', 'model-viewer.LICENSE.txt'))) ok('vendor: licencia del visor presente');
  else fallo('vendor: falta model-viewer.LICENSE.txt (Apache-2.0)');
}

const rutaApp = join(raiz, 'app.js');
if (existsSync(rutaApp)) {
  const app = leer(rutaApp);
  for (const m of app.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    if (!/^\/vendor\/model-viewer-\d+\.\d+\.\d+\.min\.js$/.test(m[1]) || !existsSync(join(raiz, m[1]))) fallo(`app.js importa algo no permitido o inexistente: ${m[1]}`);
    else ok(`app.js importa solo el visor alojado en el sitio (${m[1]})`);
  }
  const prohibidos = app.match(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|document\.cookie|localStorage|sessionStorage/g);
  if (prohibidos) fallo(`app.js usa ${[...new Set(prohibidos)].join(', ')}: el sitio no rastrea ni pide datos`);
  else ok('app.js: sin peticiones propias, cookies ni almacenamiento');
}

/* ───── diseño ───── */
const rutaCss = join(raiz, 'styles.css');
if (!existsSync(rutaCss)) fallo('falta styles.css');
else {
  const css = leer(rutaCss);
  const prohibidas = css.match(/display:\s*(inline-)?grid|grid-template|gradient|box-shadow|text-shadow|backdrop-filter|@import/gi);
  if (prohibidas) fallo(`styles.css usa algo prohibido: ${[...new Set(prohibidas)].join(', ')}`);
  else ok('styles.css: Flexbox puro, sin degradados, sombras ni @import');
}

/* ───── sitemap, robots y despliegue ───── */
const rutaMapa = join(raiz, 'sitemap.xml');
if (!existsSync(rutaMapa)) fallo('falta sitemap.xml');
else {
  const mapa = leer(rutaMapa);
  const locs = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const entradas = [...mapa.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]*)<\/lastmod>)?\s*<\/url>/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));
  for (const e of entradas) {
    if (!e.lastmod) fallo(`sitemap.xml: falta <lastmod> en ${e.loc}`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(e.lastmod)) fallo(`sitemap.xml: lastmod inválido en ${e.loc}: ${e.lastmod}`);
  }
  for (const [canonical, modificada] of modificados) {
    const e = entradas.find((x) => x.loc === canonical);
    if (e?.lastmod && e.lastmod !== modificada) fallo(`sitemap.xml: el lastmod de ${canonical} (${e.lastmod}) no coincide con dateModified (${modificada})`);
  }
  for (const p of lista) {
    const ruta = rutaDe(p);
    if (!locs.some((l) => l.endsWith(ruta) && (ruta !== '/' || /\/$/.test(l)))) fallo(`sitemap.xml no lista ${ruta}`);
  }
  for (const [ruta, canonical] of canonicales) {
    if (canonical && !locs.includes(canonical)) fallo(`[${ruta}] el canonical (${canonical}) no coincide con ninguna URL del sitemap`);
    if (canonical && /\[DOMINIO\]/.test(canonical)) aviso(`[${ruta}] el canonical conserva [DOMINIO]`);
  }
  if (/\[DOMINIO\]/.test(mapa)) aviso('sitemap.xml: falta reemplazar [DOMINIO] por el dominio real');
}
const rutaRobots = join(raiz, 'robots.txt');
if (!existsSync(rutaRobots)) fallo('falta robots.txt');
else {
  const robots = leer(rutaRobots);
  if (!/^Sitemap:/m.test(robots)) fallo('robots.txt no declara el sitemap');
  if (/\[DOMINIO\]/.test(robots)) aviso('robots.txt: falta reemplazar [DOMINIO] por el dominio real');
}
if (!existsSync(join(raiz, 'netlify.toml'))) fallo('falta netlify.toml');

/* Verificación de Search Console por archivo HTML: va en la raíz y Google solo acepta el contenido exacto. */
for (const nombre of readdirSync(raiz).filter((n) => /^google[0-9a-f]{16}\.html$/.test(n))) {
  if (leer(join(raiz, nombre)).trim() === `google-site-verification: ${nombre}`) ok(`${nombre}: verificación de Search Console con el contenido exacto`);
  else fallo(`${nombre}: debe contener exactamente "google-site-verification: ${nombre}" (Google no acepta otro contenido ni otro nombre)`);
}

console.log(`\n${fallos} fallo(s), ${avisos} aviso(s)${estricto && avisos ? ' (modo estricto: los avisos cuentan como fallo)' : ''}.`);
process.exit(fallos || (estricto && avisos) ? 1 : 0);
