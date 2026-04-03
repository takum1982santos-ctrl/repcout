# RepCount — Arquitectura Nuevas Features

**Versión referencia:** App-40.0  
**Documento:** REPCOUNT_ARCHITECTURE_2.md  
**Complementa:** REPCOUNT_ARCHITECTURE_1.md  
**Fecha:** Abril 2026  

---

## 1. RESUMEN DE CAMBIOS

Este documento cubre tres nuevas features a implementar:

1. **Programa Extendido** — sistema de ciclos multi-semana con fases
2. **Mini almanaque en Modo Libre** — historial visual de sesiones
3. **Copiar/pegar sesión** — duplicar plantilla de ejercicios entre días

Además un cambio en home:
- Botón actual "Mi Programa" pasa a llamarse **"Programa Rápido"**
- Se agrega nuevo botón **"Programa Extendido"**

---

## 2. HOME — NUEVA ESTRUCTURA

### Botones (orden):
```
🏃 Modo Libre
⚡ Programa Rápido     (= "Mi Programa" actual, sin cambios internos)
📅 Programa Extendido  (nuevo)
```

---

## 3. MODO LIBRE — MINI ALMANAQUE

### Concepto
Vista de calendario pequeña dentro de la pantalla principal de Modo Libre. Muestra días entrenados sin estructura, solo historial visual.

### Contenido
- Muestra sesiones de **todos los modos** (Libre + Programa Rápido + Programa Extendido)
- Separación visual por color:
  - 🟦 Azul — Modo Libre
  - 🟩 Verde — Programa Rápido
  - 🟨 Amarillo — Programa Extendido
- Leyenda de colores visible antes del almanaque para que el usuario entienda qué significa cada uno

### Comportamiento
- Solo lectura — no se puede editar desde acá
- Muestra el mes actual por defecto
- Cada día entrenado muestra un punto o ícono del color correspondiente
- Si hay más de una sesión en el mismo día, se muestran múltiples puntos

### Datos
Toma información del storage existente `repcount-history` — no requiere nuevo storage.

---

## 4. PROGRAMA RÁPIDO

Sin cambios internos. Solo renombrado en el botón de home.
Storage, lógica de ejecución y editor de sesiones permanecen iguales.

**Copiar/pegar sesión** (ver sección 6) sí aplica acá.

---

## 5. PROGRAMA EXTENDIDO

### 5.1 Concepto General

El usuario crea **un único ciclo activo** de entrenamiento. El ciclo tiene:
- Nombre
- Duración en semanas (elegida al crear, no modificable)
- Fases que dividen esas semanas
- Cada semana tiene 7 días con sesiones asignadas

El ciclo avanza según el usuario — **no sigue el calendario real**. Si se salta un día, ese día queda pendiente. Él decide cuándo ejecutar cada sesión.

---

### 5.2 Fases

**Tipos disponibles:**
| Fase | Descripción guía |
|------|-----------------|
| 💪 Fuerza | Ejercicios más exigentes, menos reps, máxima intensidad por serie |
| 🔥 Hipertrofia | Volumen moderado-alto, reps intermedias, menos descanso |
| 😴 Descarga | Reducí volumen al 50-60%. Tu cuerpo se recupera y consolida los avances |

**Reglas:**
- La **Descarga es obligatoria** y siempre es la última fase del ciclo
- La Descarga siempre dura **1 semana fija**
- El orden de Fuerza e Hipertrofia lo decide el usuario
- Cada fase puede durar **1 a 4 semanas** (el usuario elige al crear el ciclo)
- Las semanas de Descarga se descuentan del total: si el ciclo es de 6 semanas, el usuario distribuye 5 entre Fuerza/Hipertrofia y la última es Descarga

**Ejemplo ciclo 6 semanas:**
```
Semana 1-2 → Fuerza
Semana 3-5 → Hipertrofia
Semana 6   → Descarga (automática)
```

**Guías informativas:**
En la pantalla de cada fase se muestra un panel con explicación de qué significa esa fase y cómo programarla. Es informativo, no restrictivo — el usuario puede ignorarlo y poner lo que quiera.

---

### 5.3 Flujo de Creación del Ciclo

```
1. Nombre del ciclo
2. Duración total (slider o input: 2-12 semanas)
3. Elegir orden de fases: Fuerza primero / Hipertrofia primero
4. Asignar semanas a cada fase (con descarga = última semana, fija)
5. Confirmación → se crea el ciclo con todas las semanas vacías
```

---

### 5.4 Navegación dentro del Ciclo

```
Programa Extendido (pantalla principal)
  ↓
Vista del ciclo — lista de semanas agrupadas por fase
  ↓
Semana seleccionada — almanaque de 7 días (igual al actual)
  ↓
Día seleccionado — asignar/editar sesión
  ↓
Editor de sesión (igual al actual)
```

El usuario navega semana por semana. Puede ir a cualquier semana libremente para armarla — no está forzado a hacerlo en orden al **programar**. Pero al **ejecutar** sí respeta el orden (no puede ejecutar la Semana 3 si la Semana 1 no está completada).

---

### 5.5 Ejecución de Sesiones

- Al terminar una sesión, se marca como **completada automáticamente**
- Si el usuario quiere **desmarcarla**, la app le pregunta: *"¿Seguro que querés desmarcar esta sesión?"*
- Las sesiones completadas quedan con indicador visual (✅) en el almanaque

---

### 5.6 Evaluación de Sesión (diseñada para el futuro, storage preparado ahora)

**No se implementa en esta versión** pero el storage se diseña para soportarlo.

Concepto futuro: al terminar una sesión, el usuario puede ver un resumen comparando lo programado vs lo ejecutado. Ejemplo:
> "Flexiones: programaste 10 reps, hiciste 8"
> "Sentadillas: programaste 10 reps, hiciste 7"

Esto requiere guardar tanto el objetivo como el resultado real en cada sesión ejecutada.

---

### 5.7 Storage — Programa Extendido

**Storage separado del Programa Rápido.**

Key: `repcount-extended-v1`

```javascript
{
  cycle: {
    id: string,
    name: string,
    totalWeeks: number,         // elegido al crear, inmutable
    createdAt: timestamp,
    phases: [
      {
        type: "fuerza" | "hipertrofia" | "descarga",
        weekStart: number,      // semana donde empieza (1-based)
        weekEnd: number         // semana donde termina
      }
    ],
    weeks: [
      {
        weekNumber: number,
        phase: "fuerza" | "hipertrofia" | "descarga",
        days: {
          0: sessionId | null,  // Domingo
          1: sessionId | null,  // Lunes
          2: sessionId | null,
          3: sessionId | null,
          4: sessionId | null,
          5: sessionId | null,
          6: sessionId | null   // Sábado
        },
        completedDays: {
          0: boolean,
          1: boolean,
          ...
        }
      }
    ]
  },
  sessions: {
    [sessionId]: {
      id: string,
      name: string,
      blocks: [...],            // misma estructura que Programa Rápido
      // futuro:
      // executionLog: { date, repsAchieved vs repsGoal }
    }
  }
}
```

---

## 6. COPIAR/PEGAR SESIÓN

### Concepto
Botón en el editor de sesión para copiar la plantilla completa (todos los bloques y ejercicios) y pegarla en otro día.

### Comportamiento
- Ícono de dos hojas 📋 en la cabecera del editor de sesión
- Al copiar: se guarda temporalmente en memoria (no en storage)
- Al ir a otro día vacío: aparece botón "Pegar sesión"
- Si el día ya tiene sesión: pregunta "¿Reemplazar sesión existente?"
- Solo funciona **dentro del mismo modo** — no cruza entre Programa Rápido y Programa Extendido

### Estado en memoria
```javascript
// Variable de estado en RepCountApp
const [clipboard, setClipboard] = useState(null)
// clipboard = { blocks: [...] } o null
```

---

## 7. IMPACTO EN CÓDIGO EXISTENTE

| Área | Cambio |
|------|--------|
| Home buttons | Renombrar + agregar botón Extendido |
| Modo Libre screen | Agregar mini almanaque al final |
| ProgramScreen | Sin cambios internos |
| Session editor | Agregar botón copiar + lógica pegar |
| Storage | Agregar `repcount-extended-v1` |
| Nuevas pantallas | CycleCreatorScreen, ExtendedProgramScreen, ExtendedWeekScreen |
| RepCountApp state | Agregar `clipboard`, `activeCycle`, `extendedScreen` |

---

## 8. ORDEN DE IMPLEMENTACIÓN SUGERIDO

Implementar en este orden para poder testear cada parte antes de continuar:

```
1. Renombrar botón "Mi Programa" → "Programa Rápido" en home
2. Copiar/pegar sesión (feature aislada, bajo riesgo)
3. Mini almanaque en Modo Libre
4. Storage del ciclo (definir estructura, funciones CRUD)
5. CycleCreatorScreen (crear ciclo)
6. ExtendedWeekScreen (editar semana, reutiliza lógica existente)
7. ExtendedProgramScreen (vista general del ciclo)
8. Ejecución de sesiones del ciclo (conectar con flujo prog_counting existente)
```

---

## 9. NOTAS TÉCNICAS

- **React Hooks:** las nuevas pantallas deben ser componentes top-level — no hooks dentro de `.map()` ni condicionales (bug recurrente del proyecto)
- **Storage:** siempre async con try/catch
- **Clipboard:** es estado de React, no storage — se pierde al recargar la app (comportamiento aceptable)
- **Un solo ciclo activo:** si el usuario quiere crear uno nuevo cuando ya tiene uno, la app pregunta si quiere archivar el actual. El ciclo archivado queda en historial (futuro).

---

*Documento creado: Abril 2026*  
*Próxima versión de código objetivo: App-41.0*
