// Pruebas del verificador. Ejecutar con: node --test scripts/verificar-sitio.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, renameSync } from 'node:fs';
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
// Reescribe el fragmento JSON de un .glb (y las longitudes) sin tocar los datos binarios.
function parcharGlb(ruta, cambiar) {
  const b = readFileSync(ruta);
  const largo = b.readUInt32LE(12);
  const json = JSON.parse(b.toString('utf8', 20, 20 + largo));
  cambiar(json);
  let nuevo = Buffer.from(JSON.stringify(json), 'utf8');
  nuevo = Buffer.concat([nuevo, Buffer.alloc((4 - (nuevo.length % 4)) % 4, 0x20)]);
  const cabecera = Buffer.from(b.subarray(0, 20));
  cabecera.writeUInt32LE(nuevo.length, 12);
  const todo = Buffer.concat([cabecera, nuevo, b.subarray(20 + largo)]);
  todo.writeUInt32LE(todo.length, 8);
  writeFileSync(ruta, todo);
}
const DOM = 'https://ceba.netlify.app';

test('el sitio real pasa incluso en modo estricto y sin avisos', () => {
  const r = conMutacion(() => {}, ['--estricto']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stderr, /AVISO/);
});

test('un enlace de afiliado pendiente avisa; en modo estricto falla', () => {
  const mutar = (d) => editar(d, 'enlaces.js', (t) => t.replace('"https://meli.la/2v693i7"', '"[ENLACE_AFILIADO_TERMOS]"'));
  const normal = conMutacion(mutar);
  assert.equal(normal.status, 0, normal.stdout + normal.stderr);
  assert.match(normal.stderr, /enlaces\.js: termos sigue pendiente/);
  assert.equal(conMutacion(mutar, ['--estricto']).status, 1);
});

test('un [DOMINIO] sin reemplazar en robots avisa; en estricto falla', () => {
  const mutar = (d) => editar(d, 'robots.txt', (t) => t.replace(DOM, '[DOMINIO]'));
  const normal = conMutacion(mutar);
  assert.equal(normal.status, 0, normal.stdout + normal.stderr);
  assert.match(normal.stderr, /robots\.txt: falta reemplazar \[DOMINIO\]/);
  assert.equal(conMutacion(mutar, ['--estricto']).status, 1);
});

test('afirmar que se probó un producto falla; negarlo no', () => {
  const mal = conMutacion((d) => editar(d, TERMO, (t) => t.replace('<h2>Qué mirar en un termo</h2>', '<h2>Qué mirar en un termo</h2><p>Probé este termo durante un mes.</p>')));
  assert.equal(mal.status, 1);
  assert.match(mal.stderr, /afirma haber probado/);
  assert.doesNotMatch(conMutacion(() => {}).stderr, /afirma haber probado/);
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
  const r = conMutacion((d) => editar(d, 'enlaces.js', (t) => t.replace('"https://meli.la/2v693i7"', '"http://inseguro.example"')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no es una URL https válida/);
});

test('una página fuera del sitemap falla', () => {
  const r = conMutacion((d) => editar(d, 'sitemap.xml', (t) => t.replace(new RegExp(`  <url><loc>${DOM}/mate-de-calabaza-o-de-acero/</loc>[^\\n]*</url>\\n`), '')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /sitemap\.xml no lista \/mate-de-calabaza-o-de-acero\//);
});

test('un canonical ausente o distinto del sitemap falla', () => {
  const sin = conMutacion((d) => editar(d, TERMO, (t) => t.replace(/<link rel="canonical"[^>]*>\n/, '')));
  assert.equal(sin.status, 1);
  assert.match(sin.stderr, /falta <link rel="canonical">/);
  const otro = conMutacion((d) => editar(d, TERMO, (t) => t.replace(`${DOM}/como-elegir-un-termo-para-mate/`, 'https://otro.example/termo/')));
  assert.equal(otro.status, 1);
  assert.match(otro.stderr, /el canonical .* no coincide con ninguna URL del sitemap/);
});

test('falta de lang o de meta description falla', () => {
  assert.equal(conMutacion((d) => editar(d, 'index.html', (t) => t.replace('lang="es-AR"', 'lang="es"'))).status, 1);
  assert.equal(conMutacion((d) => editar(d, 'index.html', (t) => t.replace(/<meta name="description"[^>]*>/, ''))).status, 1);
});

test('el archivo de verificación de Google debe tener el contenido exacto y su mismo nombre', () => {
  const real = conMutacion(() => {}, ['--estricto']);
  assert.match(real.stdout, /google4aef02e4b7763dd2\.html: verificación de Search Console/);
  const envuelto = conMutacion((d) => writeFileSync(join(d, 'google4aef02e4b7763dd2.html'), '<html>google-site-verification: google4aef02e4b7763dd2.html</html>'));
  assert.equal(envuelto.status, 1);
  assert.match(envuelto.stderr, /google4aef02e4b7763dd2\.html: debe contener exactamente/);
  const renombrado = conMutacion((d) => renameSync(join(d, 'google4aef02e4b7763dd2.html'), join(d, 'google1111111111111111.html')));
  assert.equal(renombrado.status, 1);
  assert.match(renombrado.stderr, /google1111111111111111\.html: debe contener exactamente/);
  const otro = conMutacion((d) => writeFileSync(join(d, 'google0123456789abcdef.html'), 'google-site-verification: google0123456789abcdef.html'), ['--estricto']);
  assert.equal(otro.status, 0, otro.stdout + otro.stderr);
  assert.match(otro.stdout, /google0123456789abcdef\.html: verificación de Search Console/);
});

test('etiquetas para compartir y datos estructurados incompletos o incoherentes fallan', () => {
  const sinImagen = conMutacion((d) => editar(d, TERMO, (t) => t.replace(/ *<meta property="og:image" [^>]*>\n/, '')));
  assert.equal(sinImagen.status, 1);
  assert.match(sinImagen.stderr, /faltan etiquetas para compartir: og:image/);
  const imagenFantasma = conMutacion((d) => editar(d, TERMO, (t) => t.replace('/assets/og-ceba-v2.png"', '/assets/no-existe-v1.png"')));
  assert.equal(imagenFantasma.status, 1);
  assert.match(imagenFantasma.stderr, /og:image no existe en el sitio: \/assets\/no-existe-v1\.png/);
  const urlDistinta = conMutacion((d) => editar(d, TERMO, (t) => t.replace(/(<meta property="og:url" content=")[^"]*/, '$1https://otro.example/')));
  assert.equal(urlDistinta.status, 1);
  assert.match(urlDistinta.stderr, /og:url \(https:\/\/otro\.example\/\) no coincide con el canonical/);
  const jsonRoto = conMutacion((d) => editar(d, TERMO, (t) => t.replace('"@type": "Article",', '"@type": "Article" ,,')));
  assert.equal(jsonRoto.status, 1);
  assert.match(jsonRoto.stderr, /JSON-LD inválido/);
  const otraPagina = conMutacion((d) => editar(d, TERMO, (t) => t.replace(/("mainEntityOfPage": ")[^"]*/, '$1https://ceba.netlify.app/otra/')));
  assert.equal(otraPagina.status, 1);
  assert.match(otraPagina.stderr, /JSON-LD: mainEntityOfPage no coincide con el canonical/);
});

test('el lastmod del sitemap debe existir y coincidir con dateModified', () => {
  const distinto = conMutacion((d) => editar(d, 'sitemap.xml', (t) => t.replace(`<loc>${DOM}/como-curar-un-mate/</loc><lastmod>2026-11-04</lastmod>`, `<loc>${DOM}/como-curar-un-mate/</loc><lastmod>2026-10-01</lastmod>`)));
  assert.equal(distinto.status, 1);
  assert.match(distinto.stderr, /el lastmod de .*como-curar-un-mate\/ \(2026-10-01\) no coincide con dateModified \(2026-11-04\)/);
  const ausente = conMutacion((d) => editar(d, 'sitemap.xml', (t) => t.replace('<lastmod>2026-11-04</lastmod>', '')));
  assert.equal(ausente.status, 1);
  assert.match(ausente.stderr, /falta <lastmod> en /);
});

/* ───── modelo 3D, activos y app.js ───── */
test('el crédito CC BY incompleto del modelo 3D falla', () => {
  const r = conMutacion((d) => editar(d, 'index.html', (t) => t.replace(/Se modificó:[^<]*/, '')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /falta en el crédito del modelo 3D: el aviso de modificaciones/);
  const sinAutor = conMutacion((d) => editar(d, 'index.html', (t) => t.replaceAll('fervinas', 'alguien')));
  assert.equal(sinAutor.status, 1);
  assert.match(sinAutor.stderr, /el autor \(fervinas\)/);
  const otraFuente = conMutacion((d) => editar(d, 'index.html', (t) => t.replace('mate-argentino-lowpoly-free-download-65686b57aa5f4df5ac624368a28def99', 'otro-modelo')));
  assert.equal(otraFuente.status, 1);
  assert.match(otraFuente.stderr, /el enlace a la fuente/);
});

test('un modelo 3D con licencia no admitida o sin metadatos falla', () => {
  const noComercial = conMutacion((d) => parcharGlb(join(d, 'assets/mate-v2.glb'), (j) => { j.asset.extras.license = 'CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)'; }));
  assert.equal(noComercial.status, 1);
  assert.match(noComercial.stderr, /la licencia del modelo 3D \(CC-BY-NC-4\.0\) no está entre las admitidas/);
  const sinMetadatos = conMutacion((d) => parcharGlb(join(d, 'assets/mate-v2.glb'), (j) => { delete j.asset.extras; }));
  assert.equal(sinMetadatos.status, 1);
  assert.match(sinMetadatos.stderr, /no trae author, license y source/);
  const otroAutor = conMutacion((d) => parcharGlb(join(d, 'assets/mate-v2.glb'), (j) => { j.asset.extras.author = 'otra persona (https://sketchfab.com/otra)'; }));
  assert.equal(otroAutor.status, 1);
  assert.match(otroAutor.stderr, /el autor \(otra persona\)/);
});

test('un modelo 3D con las piezas sólidas en modo transparente falla (se tapan al girar)', () => {
  const r = conMutacion((d) => parcharGlb(join(d, 'assets/mate-v2.glb'), (j) => { j.materials.find((m) => m.name === 'Mate').alphaMode = 'BLEND'; }));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dibuja \d+ piezas en modo transparente \(BLEND\)/);
  const real = conMutacion(() => {}, ['--estricto']);
  assert.match(real.stdout, /modelo 3D con 1 pieza\(s\) transparente\(s\): las sólidas son opacas/);
});

test('un póster sin texto alternativo o sin tamaño falla', () => {
  const sinAlt = conMutacion((d) => editar(d, 'index.html', (t) => t.replace(/ alt="Mate argentino[^"]*"/, ' alt=""')));
  assert.equal(sinAlt.status, 1);
  assert.match(sinAlt.stderr, /texto alternativo descriptivo/);
  const sinTam = conMutacion((d) => editar(d, 'index.html', (t) => t.replace(' width="1024" height="1024"', '')));
  assert.equal(sinTam.status, 1);
  assert.match(sinTam.stderr, /width y height/);
});

test('un modelo 3D que supera el presupuesto falla', () => {
  const r = conMutacion((d) => writeFileSync(join(d, 'assets/mate-v2.glb'), Buffer.alloc(2 * 1024 * 1024)));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /el modelo 3D pesa .* KB \(máximo 1500\)/);
});

test('un modelo 3D inexistente falla', () => {
  const r = conMutacion((d) => rmSync(join(d, 'assets/mate-v2.glb')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /data-src no existe/);
});

test('un archivo sin versión en assets o vendor falla (caché de un año)', () => {
  const r = conMutacion((d) => renameSync(join(d, 'assets/mate-v2.glb'), join(d, 'assets/mate.glb')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /assets\/mate\.glb: se guarda un año en caché/);
  const vendor = conMutacion((d) => writeFileSync(join(d, 'vendor/otro.min.js'), '//'));
  assert.equal(vendor.status, 1);
  assert.match(vendor.stderr, /vendor\/otro\.min\.js: se guarda un año/);
});

test('sin la licencia del visor falla', () => {
  const r = conMutacion((d) => rmSync(join(d, 'vendor/model-viewer.LICENSE.txt')));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /falta model-viewer\.LICENSE\.txt/);
});

test('app.js con peticiones propias, almacenamiento o imports ajenos falla', () => {
  const fetchear = conMutacion((d) => editar(d, 'app.js', (t) => t + "\nfetch('https://analitica.example/x');"));
  assert.equal(fetchear.status, 1);
  assert.match(fetchear.stderr, /app\.js usa fetch/);
  const almacen = conMutacion((d) => editar(d, 'app.js', (t) => t + "\nlocalStorage.setItem('a','b');"));
  assert.equal(almacen.status, 1);
  const ajeno = conMutacion((d) => editar(d, 'app.js', (t) => t.replace('/vendor/model-viewer-4.4.0.min.js', 'https://cdn.example/mv.js')));
  assert.equal(ajeno.status, 1);
  assert.match(ajeno.stderr, /importa algo no permitido/);
});
