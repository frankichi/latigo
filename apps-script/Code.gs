/**
 * EL LÁTIGO · Backend en Google Sheets (Google Apps Script)
 * Base de datos: "Látigo_BD"
 * https://docs.google.com/spreadsheets/d/1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U/edit
 * ------------------------------------------------------------------
 * 1. Abre Látigo_BD  →  Extensiones  →  Apps Script
 * 2. Borra lo que haya en Código.gs y pega TODO este archivo. Guarda (💾).
 * 3. Arriba elige la función  setup  y pulsa ▶ Ejecutar. Acepta los permisos.
 *    En el "Registro de ejecución" aparecerá tu CLAVE: cópiala para la app.
 * 4. Implementar → Nueva implementación → Tipo: Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 *    Copia la URL que termina en /exec y pégala en la app (⚙️ Ajustes).
 *
 * La clave NO está escrita en este archivo: se guarda en
 * ⚙️ Configuración del proyecto → Propiedades de la secuencia de comandos → CLAVE.
 * Puedes cambiarla ahí cuando quieras (y luego cambiarla en la app).
 *
 * Si modificas este código: Implementar → Administrar implementaciones
 * → ✏️ Editar → Versión: "Nueva versión" → Implementar (la URL no cambia).
 */

// ID de la hoja "Látigo_BD" (sale de su URL, entre /d/ y /edit)
const SHEET_ID = '1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U';

const HOJAS = {
  Productos:  ['id','nombre','presentacion','precio','creado'],
  Insumos:    ['id','nombre','unidad','categoria','stockInicial','stockMinimo','costoRef','creado'],
  Compras:    ['id','fecha','insumoId','cantidad','costoTotal','proveedor','nota'],
  Produccion: ['id','fecha','productoId','botellas','consumos','costoInsumos','otrosCostos','costoTotal','nota'],
  Clientes:   ['id','nombres','apellidos','telefono','whatsapp','direccion','referencia','nota','creado'],
  Pedidos:    ['id','fecha','clienteId','items','total','estado','pagado','metodoPago','direccionEntrega','nota'],
  Gastos:     ['id','fecha','categoria','descripcion','monto'],
};

/** Crea las hojas con sus encabezados. Ejecútala una vez. */
function setup() {
  const ss = libro();
  Object.keys(HOJAS).forEach(function (nombre) {
    const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    const h = HOJAS[nombre];
    sh.getRange(1, 1, 1, h.length).setValues([h])
      .setFontWeight('bold').setBackground('#0b0f12').setFontColor('#e8a93a');
    sh.setFrozenRows(1);
    // Todo como texto: así Sheets no cambia fechas, teléfonos ni decimales.
    sh.getRange(1, 1, sh.getMaxRows(), h.length).setNumberFormat('@');
  });
  const def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);

  const props = PropertiesService.getScriptProperties();
  let clave = props.getProperty('CLAVE');
  if (!clave) {
    clave = 'latigo-' + Utilities.getUuid().slice(0, 8);
    props.setProperty('CLAVE', clave);
  }
  Logger.log('✅ "' + ss.getName() + '" lista. Tu CLAVE para la app es:  ' + clave);
}

/** Muestra la clave actual en el registro (por si la olvidaste). */
function verClave() {
  Logger.log('CLAVE: ' + (PropertiesService.getScriptProperties().getProperty('CLAVE') || '(aún no creada: ejecuta setup)'));
}

function libro() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActive();
}

function claveActual() {
  return PropertiesService.getScriptProperties().getProperty('CLAVE') || '';
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

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (accion === 'save')       return salida({ ok: true, row: guardar(p.sheet, p.row) });
      if (accion === 'delete')     return salida({ ok: true, deleted: eliminar(p.sheet, p.id) });
      if (accion === 'replaceAll') { reemplazarTodo(p.data); return salida({ ok: true }); }
    } finally { lock.releaseLock(); }

    return salida({ ok: false, error: 'Acción desconocida: ' + accion });
  } catch (err) {
    return salida({ ok: false, error: String(err && err.message || err) });
  }
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
  const sh = hoja(nombre), h = HOJAS[nombre], last = sh.getLastRow();
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

function fila(nombre, row) {
  return HOJAS[nombre].map(function (k) { return row[k] == null ? '' : String(row[k]); });
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
  const sh = hoja(nombre), h = HOJAS[nombre];
  const r = buscarFila(sh, row.id);
  const destino = r > 0 ? r : sh.getLastRow() + 1;
  sh.getRange(destino, 1, 1, h.length).setNumberFormat('@').setValues([fila(nombre, row)]);
  return row;
}

function eliminar(nombre, id) {
  const sh = hoja(nombre), r = buscarFila(sh, id);
  if (r > 0) { sh.deleteRow(r); return true; }
  return false;
}

function reemplazarTodo(data) {
  Object.keys(HOJAS).forEach(function (n) {
    const sh = hoja(n), h = HOJAS[n], last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, h.length).clearContent();
    const rows = (data && data[n]) || [];
    if (rows.length) {
      sh.getRange(2, 1, rows.length, h.length).setNumberFormat('@')
        .setValues(rows.map(function (row) { return fila(n, row); }));
    }
  });
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
