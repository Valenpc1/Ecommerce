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
const descripciones = new Set();
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
  for (const p of lista) {
    const ruta = rutaDe(p);
    if (!locs.some((l) => l.endsWith(ruta) && (ruta !== '/' || /\/$/.test(l)))) fallo(`sitemap.xml no lista ${ruta}`);
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

console.log(`\n${fallos} fallo(s), ${avisos} aviso(s)${estricto && avisos ? ' (modo estricto: los avisos cuentan como fallo)' : ''}.`);
process.exit(fallos || (estricto && avisos) ? 1 : 0);
