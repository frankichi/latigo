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

Todo puede ir a GitHub, incluso en un repositorio público. La **clave secreta no está en ningún archivo**: vive en Apps Script y en el celular.

---

## Paso 1 · Conectar Látigo_BD (5 min)

1. Abre **[Látigo_BD](https://docs.google.com/spreadsheets/d/1kaNDTvYF2sQOqTzfiD9spfPKtSpaqiExUzpyTMMec6U/edit)** → menú **Extensiones → Apps Script**.
2. Borra todo lo que haya en `Código.gs` y pega el contenido de **`apps-script/Code.gs`**. Guarda (💾).
3. *(Recomendado)* ⚙️ **Configuración del proyecto** → marca **“Mostrar el archivo de manifiesto appsscript.json”**. Abre ese archivo en el editor y reemplázalo con **`apps-script/appsscript.json`**, que fija la zona horaria de Lima y los permisos justos.
4. Arriba elige la función **`setup`** y pulsa **▶ Ejecutar**.
   - Google pedirá permisos: *Revisar permisos → tu cuenta → Configuración avanzada → Ir a … (no seguro) → Permitir*. Es normal, el script es tuyo.
   - Se crean 7 pestañas en Látigo_BD: Productos, Insumos, Compras, Produccion, Clientes, Pedidos y Gastos.
   - En el **Registro de ejecución** aparece tu **CLAVE** (ej. `latigo-1a2b3c4d`). **Cópiala.**
5. **Implementar → Nueva implementación → ⚙️ Aplicación web**:
   - *Ejecutar como:* **Yo**
   - *Quién tiene acceso:* **Cualquier usuario**
6. **Implementar** → copia la **URL** que termina en `/exec`.

> 🔑 ¿Olvidaste la clave? Ejecuta la función `verClave`. Para cambiarla: ⚙️ Configuración del proyecto → Propiedades de la secuencia de comandos → `CLAVE`.
> 🔄 ¿Cambiaste el código? **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL no cambia.

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

## Paso 4 · Conectar la app

1. Abre la web en el celular → toca **⚙️**.
2. Pega la **URL `/exec`** y la **CLAVE** → **🧪 Probar conexión** (debe decir *Conectado a "Látigo_BD"*) → **Guardar ajustes**.
3. El indicador de arriba se pone **verde**.
4. Si ya habías registrado datos antes de conectar: **⚙️ → ⬆️ Subir los datos de este celular a Sheets**.

📱 **Instalar como app:**
- **Android (Chrome):** menú ⋮ → *Agregar a pantalla principal*.
- **iPhone (Safari):** Compartir → *Agregar a inicio*.

Queda con el ícono del burro en llamas.

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
7. **Clientes:** datos de contacto, historial, producto favorito y ⭐ para los frecuentes.
8. **Reportes:** gráficos, ranking de clientes asiduos y descargas para Excel.

**Cómo calcula:**
- *Plata que entró* = pedidos cobrados.
- *Plata que salió* = compras de insumos + gastos + “otros costos” de los lotes.
- *Ganancia* = entró − salió.
- *Stock de botellas* = producidas − vendidas.

## 🔐 Seguridad

- Quien tenga la **URL `/exec` y la CLAVE** puede leer y escribir Látigo_BD. Compártelas solo con quien use la app.
- Sin internet la app sigue funcionando: guarda en el celular y sube los cambios cuando vuelve la conexión.
- Haz respaldos de vez en cuando desde **⚙️ → Descargar respaldo**.
