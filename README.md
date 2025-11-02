# Gym Tracker (React)

Repositorio: `gym_tracker_react_v1`

Descripción
---------
Aplicación front-end en React para llevar registro de entrenamientos. Incluye un tracker de ejercicios, un sidebar de navegación y persistencia básica en localStorage y Firebase (Firestore) para la persistencia en la nube.

Estado actual
---------
- UI: Sidebar con mini-strip y comportamiento de "hamburger" implementado.
- Modo visual: ciclo de modos (default → dark → tripi → vivid/Neo-Brutalismo). El modo se persiste en localStorage con la clave `ui-mode`.
- Persistencia: acciones y pesos/repes se guardan en `localStorage`. Helpers centralizados en `src/services/LocalStorageService.js`.
- Tests: Se añadieron pruebas con React Testing Library para `Sidebar` y `WorkoutTracker` (RTL). Pruebas pasan en el entorno actual. Último resultado conocido: todos los tests (5 suites, 13 tests) pasan.

Requisitos
---------
- Node.js (recomiendo LTS >=16)
- npm (o yarn)
- Windows PowerShell (las instrucciones de ejemplo asumen PowerShell)

Instalación y ejecución (PowerShell)
---------
```powershell
# instalar dependencias
npm install

# levantar servidor de desarrollo
npm start

# ejecutar tests
npm test -- --watchAll=false
```

Notas sobre `npm start`
- Si al iniciar la aplicación encuentras un error sobre `node_modules/react-router-dom/dist/index.mjs` (ENOENT), es porque algunas herramientas esperan un archivo `.mjs` que en la versión instalada no está presente. Durante la auditoría se creó un shim temporal en `node_modules/react-router-dom/dist/index.mjs` que re-exporta `./index.js` para mitigar el problema.
- Recomendación (limpiar y reinstalar):
	1. Cerrar servidor si está abierto
	2. Eliminar `node_modules` y el lockfile:
		 - PowerShell: rm -r -fo node_modules; rm package-lock.json
	3. Reinstalar: `npm install`
	4. `npm start`
- Si necesitas una solución persistente sin reinstalar (temporal), puedes añadir un script `postinstall` en `package.json` que cree el shim. Idealmente lo mejor es pinnear la versión compatible de `react-router-dom` o actualizar las herramientas que lo consumen.

Estructura relevante
---------
- src/
	- App.js
	- index.js
	- styles.css      — estilos globales y temas (.dark-mode, .tripi-mode, .vivid-mode)
	- components/ui/Sidebar.js — sidebar + mini-strip
	- pages/WorkoutTracker.js  — lógica del tracker y control de modo visual
	- services/LocalStorageService.js — helpers para los keys y get/set en localStorage
	- services/firebase.js, FirestoreService.js — configuración y funciones para persistencia en la nube

Claves de localStorage usadas
---------
- `ui-mode` — modo UI ("default" | "dark" | "tripi" | "vivid")
- `number-{week}-{day}-{index}` — pesos por ejercicio
- `reps-{week}-{day}-{index}-set{n}` — repeticiones por set
- `exercise-{week}-{day}-{index}` — nombre del ejercicio

Cambios realizados durante la auditoría
---------
- Añadí los helpers `getMode()` y `setMode(mode)` a `src/services/LocalStorageService.js` y los integré en el componente `WorkoutTracker` para persistir y sincronizar el modo entre pestañas (escuchando `storage` events).
- Actualicé `src/components/ui/Sidebar.js` para soportar mini-strip y comportamiento de apertura con hamburger.
- Ajustes de `src/styles.css` para paletas dark/tripi y un modo "vivid" (Neo-Brutalismo) así como suavizado de sombras/bordes.
- Añadí pruebas con React Testing Library para Sidebar y WorkoutTracker (tests unitarios/RTL), y realicé pequeños fixes para que pasen en el entorno de pruebas.
- Creé un shim temporal en `node_modules/react-router-dom/dist/index.mjs` para resolver un error de tooling que esperaba `.mjs`.

Calidad / Gate checks (última verificación)
---------
- Tests: PASS (todas las suites añadidas pasan en el entorno de pruebas del agente).
- Build / Dev server: pendiente verificación local; el agente aplicó una mitigación temporal (shim). Se recomienda reinstalar las dependencias y volver a correr `npm start`.

Sugerencias y siguientes pasos (priorizados)
---------
1. Verificar localmente `npm start` tras una limpieza completa de `node_modules` y reinstalación. Si el error persiste, crea un `postinstall` o pinnea la versión de `react-router-dom` que incluya `index.mjs` (o ajusta la herramienta que requiere `.mjs`).
2. Añadir una UI en `Settings` para que el usuario seleccione explícitamente el modo (en lugar de solo ciclo). Añadir test RTL para esa ruta.
3. Extraer variables de color a CSS variables en `styles.css` y usar un pequeño tema/token layer para mantener consistencia.
4. Añadir pruebas unitarias para `LocalStorageService` (mock localStorage) y tests para la sincronización entre pestañas (simular `storage` event).
5. Plan de upgrade: evaluar la actualización de `firebase` y `react-scripts` en una rama separada; correr tests y QA manual.
6. Añadir CI (GitHub Actions) que ejecute `npm ci`, `npm test -- --watchAll=false`, y `npm run lint` en cada PR.

Notas finales
---------
- Evité cambios invasivos y preservé la API pública del proyecto. Los cambios hechos son reversibles si prefieres otra aproximación.
- Si quieres, puedo:
	- Crear automáticamente el `postinstall` shim (temporal) para que no tengas que tocar node_modules manualmente.
	- Implementar la UI de Settings + su test.
	- Abrir un PR con los cambios y separar la refactorización mayor (tokens, upgrades) en otra rama.

Contacto rápido
---------
Si quieres que haga alguno de los siguientes pasos ahora, dime cuál prefieres (por ejemplo: "Crear Settings UI", "Agregar postinstall shim", "Refactor CSS variables", "Abrir PR con los cambios").
