/**
 * EL LÁTIGO · Backend en Google Sheets (Google Apps Script)
 * Base de datos: "Látigo_BD"
 * https://docs.google.com/spreadsheets/d/1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U/edit
 * ------------------------------------------------------------------
 * 1. Abre Látigo_BD  →  Extensiones  →  Apps Script
 * 2. Borra lo que haya en Código.gs y pega TODO este archivo. Guarda (💾).
 * 3. Arriba elige la función  setup  y pulsa ▶ Ejecutar. Acepta los permisos.
 *    Crea las pestañas y deja lista la clave (la misma que ya trae la app).
 * 4. Implementar → Nueva implementación → Tipo: Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 *    La URL /exec ya está escrita en index.html (DEFAULT_API_URL).
 *
 * La clave de la app es CLAVE_APP (abajo) y debe ser IGUAL a DEFAULT_TOKEN
 * en index.html. Si un día la cambias, cámbiala en los dos archivos,
 * vuelve a ejecutar setup y sube la web de nuevo.
 *
 * Si modificas este código: Implementar → Administrar implementaciones
 * → ✏️ Editar → Versión: "Nueva versión" → Implementar (la URL no cambia).
 *
 * BOLETAS / COMPROBANTES (fotos y escaneos) — NO se usa Google Drive:
 *  - La foto se sube a ImgBB DIRECTO DESDE EL CELULAR (ImgBB bloquea a los
 *    servidores de Google, por eso no pasa por aquí). ImgBB la convierte en link.
 *  - Este script solo le entrega la API key a la app (protegida con la CLAVE)
 *    y guarda el link en la hoja "Comprobantes" (SOLO TEXTO).
 *  - API key gratuita de ImgBB: https://api.imgbb.com/ → "Get API key" → pégala en IMGBB_KEY.
 */

// ID de la hoja "Látigo_BD" (sale de su URL, entre /d/ y /edit)
const SHEET_ID = '1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U';

// Clave que usa la app (igual a DEFAULT_TOKEN en index.html)
const CLAVE_APP = 'latigo-tah0or7h4j1nyt';

const HOJAS = {
  Productos:  ['id','nombre','presentacion','precio','creado'],
  Insumos:    ['id','nombre','unidad','categoria','stockInicial','stockMinimo','costoRef','creado'],
  Compras:    ['id','fecha','insumoId','cantidad','costoTotal','proveedor','nota'],
  Produccion: ['id','fecha','productoId','botellas','consumos','costoInsumos','otrosCostos','costoTotal','nota'],
  Clientes:   ['id','numero','registrado','nota','creado'],   // clientes = números 1..100
  Pedidos:    ['id','fecha','clienteId','items','total','estado','pagado','metodoPago','direccionEntrega','nota'],
  Gastos:     ['id','fecha','categoria','descripcion','monto'],
  Comprobantes: ['id','fecha','tipo','monto','proveedor','nota','refTipo','refId','referencia','url','thumbUrl','deleteUrl','creado','etiqueta'],   // url = link de la imagen (ImgBB)
  Mensajes:   ['id','fecha','hora','clienteId','de','texto','fotos','pedidoId','origen','creado'],   // mensajes de los pacientes (solo texto + links)
};

// API key gratuita de ImgBB (https://api.imgbb.com/ → Get API key). Se queda aquí, oculta: la web no la ve.
const IMGBB_KEY = '5ae40e651daa4cd6e36875edd7e43242';

/** Crea las hojas con sus encabezados. Ejecútala una vez. */
function setup() {
  const ss = libro();
  // Formato antiguo de Clientes (nombres/teléfonos): se guarda como respaldo, no se borra
  const viejo = ss.getSheetByName('Clientes');
  if (viejo && String(viejo.getRange(1, 2).getValue()) === 'nombres') {
    viejo.setName('Clientes_antiguo_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmm'));
  }
  Object.keys(HOJAS).forEach(function (nombre) {
    const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    const h = encabezados(sh, HOJAS[nombre]);
    sh.getRange(1, 1, 1, h.length).setValues([h])
      .setFontWeight('bold').setBackground('#0b0f12').setFontColor('#e8a93a');
    sh.setFrozenRows(1);
    // Todo como texto: así Sheets no cambia fechas, teléfonos ni decimales.
    sh.getRange(1, 1, sh.getMaxRows(), h.length).setNumberFormat('@');
  });
  const def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);

  PropertiesService.getScriptProperties().setProperty('CLAVE', CLAVE_APP);
  Logger.log('✅ "' + ss.getName() + '" lista y conectada. Ya puedes usar la app.');
  Logger.log(claveImgbb() ? '📎 Boletas: API key de ImgBB lista.' : '⚠️ Boletas: falta pegar tu API key de ImgBB en IMGBB_KEY.');
}

/** Muestra la clave actual en el registro (por si la olvidaste). */
function verClave() {
  Logger.log('CLAVE: ' + (PropertiesService.getScriptProperties().getProperty('CLAVE') || '(aún no creada: ejecuta setup)'));
}

function libro() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
}

function claveActual() {
  return PropertiesService.getScriptProperties().getProperty('CLAVE') || CLAVE_APP;
}

function doGet(e)  { return manejar((e && e.parameter) || {}); }
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return salida({ ok: false, error: 'Datos inválidos' }); }
  return manejar(body);
}

function manejar(p) {
  try {
    const CLAVE = claveActual();
    if (!CLAVE) return salida({ ok: false, error: 'Falta ejecutar setup en Apps Script' });
    if (String(p.token || '') !== CLAVE) return salida({ ok: false, error: 'Clave incorrecta' });
    const accion = p.action || 'ping';
    if (accion === 'ping') return salida({ ok: true, msg: 'Conectado a "' + libro().getName() + '"' });
    if (accion === 'all')  return salida({ ok: true, data: leerTodo() });
    if (accion === 'imgbbKey') {
      const k = claveImgbb();
      return salida(k ? { ok: true, key: k } : { ok: false, error: 'Falta la API key de ImgBB en Apps Script (IMGBB_KEY)' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (accion === 'save')       return salida({ ok: true, row: guardar(p.sheet, p.row) });
      if (accion === 'saveMany')   return salida({ ok: true, n: guardarVarios(p.sheet, p.rows) });
      if (accion === 'delete')     return salida({ ok: true, deleted: eliminar(p.sheet, p.id) });
      if (accion === 'replaceAll') { reemplazarTodo(p.data); return salida({ ok: true }); }
    } finally { lock.releaseLock(); }

    return salida({ ok: false, error: 'Acción desconocida: ' + accion });
  } catch (err) {
    return salida({ ok: false, error: String(err && err.message || err) });
  }
}

/** Encabezados actuales de la hoja + los que falten (nunca quita columnas). */
function encabezados(sh, extra) {
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const actuales = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String).filter(function (x) { return x; });
  (extra || []).forEach(function (k) {
    if (/^[A-Za-z0-9_]{1,40}$/.test(k) && actuales.indexOf(k) < 0) actuales.push(k);
  });
  return actuales;
}

function asegurarEncabezados(sh, h) {
  sh.getRange(1, 1, 1, h.length).setNumberFormat('@').setValues([h])
    .setFontWeight('bold').setBackground('#0b0f12').setFontColor('#e8a93a');
}

function hoja(nombre) {
  if (!HOJAS[nombre]) throw new Error('Hoja no permitida: ' + nombre);
  let sh = libro().getSheetByName(nombre);
  if (!sh) { setup(); sh = libro().getSheetByName(nombre); }
  return sh;
}

function leerTodo() {
  const res = {};
  Object.keys(HOJAS).forEach(function (n) { res[n] = leerHoja(n); });
  return res;
}

function leerHoja(nombre) {
  const sh = hoja(nombre), h = encabezados(sh, HOJAS[nombre]), last = sh.getLastRow();
  if (last < 2) return [];
  const tz = Session.getScriptTimeZone();
  return sh.getRange(2, 1, last - 1, h.length).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      const o = {};
      h.forEach(function (k, i) {
        let v = r[i];
        if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
        o[k] = v;
      });
      return o;
    });
}

function fila(h, row) {
  return h.map(function (k) { return row[k] == null ? '' : String(row[k]); });
}

function buscarFila(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}

function guardar(nombre, row) {
  if (!row || !row.id) throw new Error('Falta el id');
  const sh = hoja(nombre);
  const antes = encabezados(sh, []), h = encabezados(sh, HOJAS[nombre].concat(Object.keys(row)));
  if (h.length !== antes.length) asegurarEncabezados(sh, h);
  const r = buscarFila(sh, row.id);
  const destino = r > 0 ? r : sh.getLastRow() + 1;
  sh.getRange(destino, 1, 1, h.length).setNumberFormat('@').setValues([fila(h, row)]);
  return row;
}

/** Guarda muchas filas de una vez (ej. un chat importado). */
function guardarVarios(nombre, rows) {
  rows = (rows || []).filter(function (r) { return r && r.id; });
  if (!rows.length) return 0;
  const sh = hoja(nombre);
  let claves = HOJAS[nombre].slice();
  rows.forEach(function (r) { claves = claves.concat(Object.keys(r)); });
  const antes = encabezados(sh, []), h = encabezados(sh, claves);
  if (h.length !== antes.length) asegurarEncabezados(sh, h);
  const last = sh.getLastRow(), idx = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach(function (v, i) { idx[String(v[0])] = i + 2; });
  const nuevos = [];
  rows.forEach(function (row) {
    const r = idx[String(row.id)];
    if (r > 0) sh.getRange(r, 1, 1, h.length).setNumberFormat('@').setValues([fila(h, row)]);
    else if (r !== -1) { nuevos.push(fila(h, row)); idx[String(row.id)] = -1; }
  });
  if (nuevos.length) sh.getRange(sh.getLastRow() + 1, 1, nuevos.length, h.length).setNumberFormat('@').setValues(nuevos);
  return rows.length;
}

function eliminar(nombre, id) {
  const sh = hoja(nombre), r = buscarFila(sh, id);
  if (r > 0) { sh.deleteRow(r); return true; }
  return false;
}

function reemplazarTodo(data) {
  Object.keys(HOJAS).forEach(function (n) {
    const rows = (data && data[n]) || [];
    const sh = hoja(n), last = sh.getLastRow();
    let claves = HOJAS[n].slice();
    rows.forEach(function (row) { claves = claves.concat(Object.keys(row)); });
    const h = encabezados(sh, claves);
    asegurarEncabezados(sh, h);
    if (last > 1) sh.getRange(2, 1, last - 1, Math.max(sh.getLastColumn(), h.length)).clearContent();
    if (rows.length) {
      sh.getRange(2, 1, rows.length, h.length).setNumberFormat('@')
        .setValues(rows.map(function (row) { return fila(h, row); }));
    }
  });
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* =================== BOLETAS → LINK (ImgBB) ===================
   La foto la sube el celular directo a ImgBB; aquí solo se guarda el link en la hoja.
   (ImgBB responde "You have been forbidden" a los servidores de Google.) */

function claveImgbb() {
  const k = PropertiesService.getScriptProperties().getProperty('IMGBB_KEY') || IMGBB_KEY;
  return /PEGA_AQUI/.test(k) ? '' : String(k || '').trim();
}

/** Verifica que la API key esté puesta (la prueba real de subida se hace desde la app). */
function verificarImgbb() {
  const k = claveImgbb();
  Logger.log(k ? '✅ API key de ImgBB lista (' + k.slice(0, 6) + '…). La app sube las fotos directo desde el celular.' : '⚠️ Falta pegar la API key en IMGBB_KEY.');
}
