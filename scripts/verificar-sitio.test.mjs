// Pruebas del verificador. Ejecutar con: node --test scripts/verificar-sitio.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SITIO = new URL('../sites/guias-mate-termo', import.meta.url).pathname;
const SCRIPT = new URL('./verificar-sitio.mjs', import.meta.url).pathname;

function conMutacion(mutar, extra = []) {
  const dir = mkdtempSync(join(tmpdir(), 'sitio-'));
  cpSync(SITIO, dir, { recursive: true });
  mutar(dir);
  const r = spawnSync(process.execPath, [SCRIPT, dir, ...extra], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  return r;
}
const editar = (dir, archivo, fn) => writeFileSync(join(dir, archivo), fn(readFileSync(join(dir, archivo), 'utf8')));
const TERMO = 'como-elegir-un-termo-para-mate/index.html';

test('el sitio real pasa y avisa de los marcadores pendientes', () => {
  const r = conMutacion(() => {});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /enlaces\.js: termos sigue pendiente/);
  assert.match(r.stderr, /sitemap\.xml: falta reemplazar \[DOMINIO\]/);
});

test('en modo estricto los avisos pendientes fallan', () => {
  assert.equal(conMutacion(() => {}, ['--estricto']).status, 1);
});

test('con enlaces reales y dominio, el modo estricto pasa', () => {
  const r = conMutacion((d) => {
    editar(d, 'enlaces.js', (t) => t.replace(/"\[ENLACE_AFILIADO_(\w+)\]"/g, '"https://enlace.example/$1"'));
    editar(d, 'sitemap.xml', (t) => t.replaceAll('[DOMINIO]', 'https://ejemplo.netlify.app'));
    editar(d, 'robots.txt', (t) => t.replaceAll('[DOMINIO]', 'https://ejemplo.netlify.app'));
  }, ['--estricto']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('afirmar que se probó un producto falla; negarlo no', () => {
  const mal = conMutacion((d) => editar(d, TERMO, (t) => t.replace('<h2>Qué mirar en un termo</h2>', '<h2>Qué mirar en un termo</h2><p>Probé este termo durante un mes.</p>')));
  assert.equal(mal.status, 1);
  assert.match(mal.stderr, /afirma haber probado/);
  const bien = conMutacion(() => {});
  assert.doesNotMatch(bien.stderr, /afirma haber probado/);
});

test('publicar un precio falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('<h2>Qué mirar en un termo</h2>', '<h2>Qué mirar en un termo</h2><p>Cuesta $ 15.000.</p>')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /publica un precio/);
});

test('prueba social o escasez inventadas fallan', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('<h2>Qué mirar en un termo</h2>', '<h2>Qué mirar en un termo</h2><p>Últimas unidades, miles de compradores.</p>')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /prueba social, escasez/);
});

test('un enlace interno roto falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('href="/mate-de-calabaza-o-de-acero/"', 'href="/no-existe/"')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /enlace roto: \/no-existe\//);
});

test('un ancla inexistente falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('href="/#guias"', 'href="/#nada"')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /ancla inexistente/);
});

test('un aviso de comisión visible por defecto falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('<p class="aviso" hidden>', '<p class="aviso">')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /aviso de comisión oculto por defecto/);
});

test('un data-enlace sin clave en enlaces.js falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('data-enlace="termos"', 'data-enlace="otra"')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /"otra" no existe en enlaces\.js/);
});

test('un segundo h1 falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('</h1>', '</h1><h1>Otro</h1>')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /tiene 2 h1/);
});

test('un script externo falla', () => {
  const r = conMutacion((d) => editar(d, TERMO, (t) => t.replace('</body>', '<script src="https://analitica.example/x.js"></script></body>')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /script no permitido/);
});

test('CSS con grid o degradados falla', () => {
  const r = conMutacion((d) => editar(d, 'styles.css', (t) => t + '\n.x{display:grid;background:linear-gradient(red,blue)}'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /prohibido/);
});

test('un enlace de afiliado que no es https falla', () => {
  const r = conMutacion((d) => editar(d, 'enlaces.js', (t) => t.replace('"[ENLACE_AFILIADO_TERMOS]"', '"http://inseguro.example"')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no es una URL https válida/);
});

test('una página fuera del sitemap falla', () => {
  const r = conMutacion((d) => editar(d, 'sitemap.xml', (t) => t.replace(/<url><loc>\[DOMINIO\]\/mate-de-calabaza-o-de-acero\/<\/loc><\/url>\n?/, '')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /sitemap\.xml no lista \/mate-de-calabaza-o-de-acero\//);
});

test('falta de lang o de meta description falla', () => {
  assert.equal(conMutacion((d) => editar(d, 'index.html', (t) => t.replace('lang="es-AR"', 'lang="es"'))).status, 1);
  assert.equal(conMutacion((d) => editar(d, 'index.html', (t) => t.replace(/<meta name="description"[^>]*>/, ''))).status, 1);
});
