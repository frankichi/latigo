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

1. **Ventas → Mis productos:** crea lo que vendes con su precio.
2. **Producción → Almacén:** registra tus insumos con lo que tienes hoy y un mínimo para alertas.
3. **Producción → Compras:** cada compra suma al almacén y fija el precio promedio.
4. **Producción → Lotes:** cada producción descuenta insumos, suma botellas y calcula el **costo por botella**.
5. **Ventas → Pedidos:** cliente (nuevo o existente), productos y dirección. Botones *✓ Entregado*, *💵 Cobrado* y *WhatsApp* con el pedido ya escrito.
6. **Producción → Gastos:** delivery, luz, publicidad, mano de obra…
7. **Clientes:** son **números del 1 al 100**, como en el cuaderno del dueño (no se guardan nombres ni teléfonos). Cada número tiene un recuadro ✅ *Registrado* que se activa o desactiva con un toque. Al tocar el número se ve su historial, cuánto compró, cuánto debe y su producto favorito. La cantidad de números se cambia en ⚙️ Ajustes.
8. **Reportes:** gráficos, ranking de clientes asiduos y descargas para Excel.

**Cómo calcula:**
- *Plata que entró* = pedidos cobrados.
- *Plata que salió* = compras de insumos + gastos + “otros costos” de los lotes.
- *Ganancia* = entró − salió.
- *Stock de botellas* = producidas − vendidas.

## 🔐 Seguridad

- La app no tiene usuario ni contraseña: **quien tenga el link de la web puede ver y editar los datos** (ventas, costos y pedidos; los clientes son solo números). Compártelo solo con quien use la app y no lo publiques.
- La clave va dentro de `index.html`. Si quieres que nadie más la vea, deja el repositorio de GitHub en **privado** (Vercel funciona igual).
- Sin internet la app sigue funcionando: guarda en el celular y sube los cambios cuando vuelve la conexión.
- Haz respaldos de vez en cuando desde **⚙️ → Descargar respaldo**.
