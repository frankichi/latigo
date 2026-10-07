# 🔥 EL LÁTIGO · Sistema de control

> **SACA EL BURRO QUE TIENES DENTRO**

App web para celular y computadora que controla **producción, insumos, costos, clientes, pedidos e ingresos** de El Látigo.

- **Base de datos:** Google Sheets **Látigo_BD** ([abrir](https://docs.google.com/spreadsheets/d/1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U/edit))
- **Publicación:** GitHub + Vercel

## 📁 Qué hay en esta carpeta

```
el-latigo/
├── index.html                 ← la app completa
├── manifest.webmanifest       ← permite instalarla en el celular
├── vercel.json                ← configuración de Vercel
├── sw.js                      ← permite instalarla y que se actualice sola
├── img/                       ← logo, íconos y etiqueta
├── apps-script/
│   ├── Code.gs                ← backend: conecta la app con Látigo_BD
│   ├── appsscript.json        ← configuración del Apps Script
│   └── .clasp.json            ← (opcional) para subir el backend con clasp
└── scripts/
    ├── subir-github.sh        ← sube/actualiza en GitHub (Mac/Linux/Git Bash)
    ├── subir-github.bat       ← lo mismo para Windows
    └── actualizar-apps-script.sh ← (opcional) sube Code.gs sin copiar/pegar
```

Recomendado: repositorio de GitHub **privado**, porque `index.html` lleva la clave de conexión.

---

## Paso 1 · Conectar Látigo_BD (5 min)

1. Abre **[Látigo_BD](https://docs.google.com/spreadsheets/d/1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U/edit)** → menú **Extensiones → Apps Script**.
2. Borra todo lo que haya en `Código.gs` y pega el contenido de **`apps-script/Code.gs`**. Guarda (💾).
3. *(Recomendado)* ⚙️ **Configuración del proyecto** → marca **“Mostrar el archivo de manifiesto appsscript.json”**. Abre ese archivo en el editor y reemplázalo con **`apps-script/appsscript.json`**, que fija la zona horaria de Lima y los permisos justos.
4. Arriba elige la función **`setup`** y pulsa **▶ Ejecutar**.
   - Google pedirá permisos: *Revisar permisos → tu cuenta → Configuración avanzada → Ir a … (no seguro) → Permitir*. Es normal, el script es tuyo.
   - Se crean 7 pestañas en Látigo_BD: Productos, Insumos, Compras, Produccion, Clientes, Pedidos y Gastos.
   - En el **Registro de ejecución** aparece: *✅ "Látigo_BD" lista y conectada.*
5. *(Solo la primera vez)* **Implementar → Nueva implementación → ⚙️ Aplicación web**:
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier usuario**
6. **Implementar** → copia la **URL** que termina en `/exec` y ponla en `DEFAULT_API_URL` dentro de `index.html`. La de Látigo_BD ya está puesta.

> 🔑 La clave ya viene fija y es la misma en los dos lados: `CLAVE_APP` en `Code.gs` y `DEFAULT_TOKEN` en `index.html`. Nadie tiene que escribirla. Si la cambias, cámbiala en ambos, vuelve a ejecutar `setup` y sube la web.
> 🔄 ¿Cambiaste `Code.gs`? Ejecuta `setup` y luego **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL no cambia.

## Paso 2 · Subir a GitHub

**Opción A, con el script (recomendado):**
1. Crea un repositorio vacío en [github.com/new](https://github.com/new), por ejemplo `el-latigo`.
2. Abre una terminal en esta carpeta y ejecuta:
   - **Mac / Linux / Git Bash:** `./scripts/subir-github.sh https://github.com/TU_USUARIO/el-latigo.git`
   - **Windows:** `scripts\subir-github.bat https://github.com/TU_USUARIO/el-latigo.git`
3. Para futuras actualizaciones basta con `./scripts/subir-github.sh` (sin la dirección).

**Opción B, desde la web:** en el repositorio, *Add file → Upload files* y arrastra **todo el contenido** de la carpeta (incluida `img/`).

## Paso 3 · Publicar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) con tu cuenta de GitHub.
2. Importa el repositorio `el-latigo` → *Framework Preset:* **Other** → **Deploy**.
3. Obtendrás `el-latigo.vercel.app` (puedes cambiar el nombre o poner tu dominio). Cada vez que subas cambios a GitHub, Vercel se actualiza solo.

## Paso 4 · Usar la app

**No hay nada que configurar.** La app ya trae la conexión con Látigo_BD. Se abre la web y se usa. El punto de arriba en **verde** indica que todo está guardado.

**🛠️ Modo administrador (solo para ti):** abre la web con `?admin` al final, por ejemplo `https://el-latigo.vercel.app/?admin`. En ⚙️ aparecen:
- 🧪 Probar conexión
- ⬆️ Subir datos del celular
- ♻️ Restaurar copia
- 🧪 Datos de ejemplo
- 🗑️ Borrar datos del celular

El usuario normal no ve estas opciones.

> ✅ **Comprobar el backend:** abre tu URL `/exec?action=ping` en el navegador. Si dice `"Clave incorrecta"`, está **todo bien** (responde, pero no sin clave). Si dice `"Falta ejecutar setup"`, ejecuta `setup`.

📲 **Instalar en el celular:** la app muestra el botón **Instalar** en Inicio y en ⚙️ Ajustes.
- **Android:** un toque y queda el ícono del burro en la pantalla de inicio.
- **iPhone:** muestra los 3 pasos de Safari (Compartir → Agregar a inicio).

**Sin íconos duplicados:**
- El botón no aparece dentro de la app instalada.
- En Android el navegador no la vuelve a ofrecer si ya está instalada.
- En iPhone se oculta al tocar "Ya lo agregué".

**Versiones nuevas:**
- Cuando subas mejoras a GitHub, el mismo ícono abre la versión nueva sola. Nadie reinstala nada.
- Sin internet, la app abre igual con la última versión guardada.

⚠️ **No cambies el dominio** de Vercel una vez instalada. Un dominio nuevo cuenta como otra app y habría que instalarla de nuevo. Si quieres un dominio propio (ej. `app.ellatigo.pe`), ponlo **antes** de compartir el link.

---

## ⚙️ Opcional: actualizar el backend sin copiar y pegar (clasp)

1. Activa la API en [script.google.com/home/usersettings](https://script.google.com/home/usersettings).
2. Copia el **ID de la secuencia de comandos** (Apps Script → ⚙️ Configuración del proyecto) en `apps-script/.clasp.json`.
3. Ejecuta `./scripts/actualizar-apps-script.sh ID_DE_IMPLEMENTACION`. Con el ID de implementación se conserva la misma URL `/exec`.

---

## 🧭 Cómo se usa

1. **Ventas → Mis productos:** crea todo lo que vendes. Cada producto tiene:
   - **Tipo:** 💧 Líquido, 📦 Sólido o uno nuevo con *➕ Crear otro tipo…* (ej. Cápsulas, Combos). Los tipos nuevos aparecen solos en filtros, listas y reportes.
   - **Unidad de venta:** botella, frasco, bolsa, caja… Se sugiere según el tipo.
   - **Presentación, características y precio**, más un **precio por mayor** opcional que se aplica solo en el pedido al llegar a la cantidad indicada.
   - **📄 Duplicar** para crear variantes rápido (otro tamaño, otro sabor).
   - **🙈 Ocultar** para lo que ya no se vende, conservando su historial.
2. **Producción → Almacén:** registra tus insumos con lo que tienes hoy y un mínimo para alertas.
3. **Producción → Compras:** cada compra suma al almacén y fija el precio promedio.
4. **Producción → Lotes:** cada producción descuenta insumos, suma botellas y calcula el **costo por botella**.
5. **Ventas → Pedidos:** cliente (nuevo o existente), productos y dirección. Botones *✓ Entregado*, *💵 Cobrado* y *WhatsApp* con el pedido ya escrito.
5b. **Envíos en cada pedido (🚚):**
   - Elige el destino: **Lima (distrito)**, **Provincia** o **Recoge el cliente**.
   - Anota lo que tú pagas en ese pedido de **delivery, embalaje y flete** (cada pedido es un evento), y si quieres, lo que **le cobras al cliente** por el envío (se suma al total).
   - Cada número de cliente recuerda su distrito o provincia, y la app sugiere el costo del último envío a ese destino.
   - En **Reportes → Envíos por destino** ves cuánto cuesta enviar a cada distrito o provincia.
   - **🧪 Laboratorista (pago quincenal):** en *Producción → 🧪 Laborat.* se registra cada pago de quincena (1–15 y 16–fin de mes). El monto se reparte entre las unidades producidas en esa quincena y suma al costo por unidad. La app muestra si la quincena actual y la anterior están pagadas, y avisa en Inicio si falta registrar una.
6. **Producción → Gastos:** delivery, luz, publicidad, mano de obra…
7. **Clientes:** son **números del 1 al 100**, como en el cuaderno del dueño (no se guardan nombres ni teléfonos). Cada número tiene un recuadro ✅ *Registrado* que se activa o desactiva con un toque. Al tocar el número se ve su historial, cuánto compró, cuánto debe y su producto favorito. La cantidad de números se cambia en ⚙️ Ajustes.
8. **Reportes:** gráficos, ranking de clientes asiduos y descargas para Excel.

**Cómo calcula:**
- *Plata que entró* = pedidos cobrados.
- *Plata que salió* = compras de insumos + gastos + “otros costos” de los lotes.
- *Ganancia* = entró − salió.
- *Stock de botellas* = producidas − vendidas.

## 📎 Boletas y comprobantes (fotos / escaneos) → link

**No se guarda nada en Google Drive.** Cada foto o escaneo se sube a **ImgBB** (hosting de imágenes gratuito, https://imgbb.com), que la convierte en un **link**. En Látigo_BD solo se guarda ese link, como texto.

- En **Compras**, **Gastos**, **pago del laboratorista** y en el **envío de cada pedido** hay un recuadro *📎 Boleta* con dos botones: **📷 Tomar foto** y **📁 Foto o PDF**.
- También se puede subir desde **Producción → 📎 Boletas → Subir boleta**, eligiendo el tipo (Compra de insumos, Producción, Envío u Otro) y a qué registro pertenece.
- **Qué guarda la hoja "Comprobantes":** fecha, tipo, monto, emisor, a qué registro pertenece, `url` (link de la imagen), `thumbUrl` (miniatura) y `deleteUrl` (link para borrarla de ImgBB). La compra o el pedido también guardan el link (`comprobanteUrl` / `comprobanteEnvioUrl`).
- **Las fotos** se achican en el celular antes de subir (~100–400 KB).
- **Los PDF** escaneados se convierten en el celular a una sola imagen, hasta 6 páginas.
- Si no hay internet, quedan en cola y se suben solas al volver la señal.
- **⚠️ Faltan:** muestra las compras y los envíos de los últimos 30 días sin comprobante.
- La API key de ImgBB va **solo en Apps Script** (`Code.gs`). La app la pide al subir y la guarda en el celular. Si la cambias en `Code.gs`, la app toma la nueva sola.

### Para activar las boletas (una sola vez)
1. Tu API key de ImgBB ya está puesta en `apps-script/Code.gs` (`IMGBB_KEY`).
2. En Apps Script de Látigo_BD, reemplaza `Código.gs` por el nuevo `Code.gs` y guarda. Si activaste el manifiesto, reemplaza también `appsscript.json`.
3. *(Opcional)* Ejecuta **`verificarImgbb`**: debe decir *✅ API key de ImgBB lista*.
4. **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar.** La URL no cambia.
5. Sube la web a GitHub.

**¿Por qué la foto se sube desde el celular y no desde Apps Script?** ImgBB bloquea a los servidores de Google (*"You have been forbidden to use this website"*). Por eso el celular sube la foto directo a ImgBB, y Apps Script solo le entrega la key (protegida con la clave de la app) y guarda el link en la hoja. La key no está escrita en la web ni en `index.html`.

> Las imágenes de ImgBB son públicas para quien tenga el link (no aparecen en buscadores). Para borrar una del todo, usa el botón **❌ ImgBB** de la boleta o el `deleteUrl` de la hoja.

## 🔐 Seguridad

- Las boletas están en ImgBB: las ve quien tenga su link (está en la hoja y en la app).
- La app no tiene usuario ni contraseña: **quien tenga el link de la web puede ver y editar los datos** (ventas, costos y pedidos; los clientes son solo números). Compártelo solo con quien use la app y no lo publiques.
- La clave va dentro de `index.html`. Si quieres que nadie más la vea, deja el repositorio de GitHub en **privado** (Vercel funciona igual).
- Sin internet la app sigue funcionando: guarda en el celular y sube los cambios cuando vuelve la conexión.
- Haz respaldos de vez en cuando desde **⚙️ → Descargar respaldo**.
