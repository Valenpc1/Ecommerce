#!/usr/bin/env node
/**
 * Compara shopify/catalogo.json (copia de lo que devuelve get-product) con CONFIG.PACKS de la landing.
 * Sin dependencias. Uso:
 *   node shopify/verificar-catalogo.mjs [shopify/catalogo.json] [sites/antifaz-bluetooth-pausa/app.js]
 *
 * Formato esperado de catalogo.json (solo datos de catálogo, sin tokens ni datos personales):
 * {
 *   "leido": "2026-11-04",
 *   "moneda": "USD",
 *   "productos": [{
 *     "handle": "antifaz-bluetooth-pausa", "titulo": "Antifaz Bluetooth Pausa",
 *     "estado": "DRAFT", "etiquetas": ["darwin-commerce"],
 *     "variantes": [{ "titulo": "1 antifaz", "precio": "29.90", "costo": "9.58" }]
 *   }]
 * }
 * Sale con código 0 solo si todo coincide.
 */
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const catalogPath = process.argv[2] ?? 'shopify/catalogo.json';
const appPath = process.argv[3] ?? 'sites/antifaz-bluetooth-pausa/app.js';

const round2 = (n) => Math.round(n * 100) / 100;
let failures = 0;
const ok = (msg) => console.log('  OK   ', msg);
const fail = (msg) => { failures++; console.error('  FALLO', msg); };

if (!existsSync(appPath)) { console.error(`FALLO: no existe ${appPath}`); process.exit(1); }
if (!existsSync(catalogPath)) {
  console.error(`FALLO: no existe ${catalogPath}. Se genera releyendo el producto con get-product; no se escribe a mano.`);
  process.exit(1);
}

// Extrae el literal CONFIG de app.js sin ejecutar la página.
const src = readFileSync(appPath, 'utf8');
const match = src.match(/const CONFIG = (\{[\s\S]*?\n {2}\});/);
if (!match) { console.error(`FALLO: no se encontró el bloque CONFIG en ${appPath}`); process.exit(1); }
let CONFIG;
try { CONFIG = vm.runInNewContext('(' + match[1] + ')'); }
catch (e) { console.error('FALLO: no se pudo interpretar CONFIG:', e.message); process.exit(1); }

let catalog;
try { catalog = JSON.parse(readFileSync(catalogPath, 'utf8')); }
catch (e) { console.error(`FALLO: ${catalogPath} no es JSON válido: ${e.message}`); process.exit(1); }

console.log(`Catálogo: ${catalogPath}  ·  Landing: ${appPath}`);

if (catalog.moneda === CONFIG.CURRENCY) ok(`moneda ${catalog.moneda}`);
else fail(`moneda del catálogo (${catalog.moneda}) ≠ CONFIG.CURRENCY (${CONFIG.CURRENCY})`);

const product = (catalog.productos ?? []).find((p) => p.titulo === CONFIG.PRODUCT);
if (!product) {
  fail(`no hay un producto titulado "${CONFIG.PRODUCT}" en el catálogo`);
} else {
  ok(`producto "${product.titulo}" (estado ${product.estado})`);
  if ((product.etiquetas ?? []).includes('darwin-commerce')) ok('etiqueta darwin-commerce');
  else fail('falta la etiqueta darwin-commerce');

  for (const pack of CONFIG.PACKS) {
    const expected = round2(pack.qty * pack.unit);
    const variant = (product.variantes ?? []).find((v) => v.titulo === pack.label);
    if (!variant) { fail(`no hay una variante "${pack.label}" en Shopify`); continue; }
    const actual = Number(variant.precio);
    if (Number.isFinite(actual) && round2(actual) === expected) ok(`variante "${pack.label}": ${actual.toFixed(2)} = ${expected.toFixed(2)}`);
    else fail(`variante "${pack.label}": Shopify ${variant.precio} ≠ landing ${expected.toFixed(2)}`);
  }

  const extra = (product.variantes ?? []).filter((v) => !CONFIG.PACKS.some((p) => p.label === v.titulo));
  extra.forEach((v) => fail(`la variante "${v.titulo}" existe en Shopify pero no en CONFIG.PACKS`));
}

console.log(failures ? `\n${failures} diferencia(s). Alinea Shopify y app.js en el mismo commit.` : '\nCatálogo y landing coinciden.');
process.exit(failures ? 1 : 0);
