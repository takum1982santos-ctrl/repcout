# RepCount — Arquitectura y Estado Actual

**Versión:** App-40.0  
**Líneas:** 1249  
**Tamaño:** 128KB  
**Última actualización:** Enero 2025  

---

## 1. OVERVIEW

RepCount es una fitness app web que usa IA de detección de poses (TensorFlow.js + MoveNet) para contar repeticiones de ejercicios automáticamente vía cámara del usuario.

**Tech Stack:**
- React/JSX (single-file architecture)
- TensorFlow.js + MoveNet (pose detection)
- Web Audio API (sonidos sintetizados)
- Persistent storage (window.storage API)
- Deploy: Vercel + GitHub auto-deploy

**Repo:** https://github.com/takum1982santos-ctrl/repcout

---

## 2. ARQUITECTURA

### 2.1 Single-File Structure

**Archivo principal:** `src/App.jsx`

**No hay carpetas separadas** (components/, screens/, utils/, data/). Todo está en un solo archivo por decisión deliberada:
- ✅ Más fácil de navegar mientras el proyecto es mediano
- ✅ Menos overhead de imports
- ✅ Refactoring futuro cuando realmente se necesite

### 2.2 Secciones del código (en orden)

```
App.jsx
├── ErrorBoundary (clase React)
├── DATA
│   ├── categories (ejercicios organizados)
│   ├── exercises (flat list)
│   ├── exerciseSteps (labels por paso)
│   ├── exerciseDefaults (duración, sets, rest)
│   └── BLOCK_TYPES (normal/superset/giantset)
├── STORAGE (async functions)
│   ├── History (sesiones completadas)
│   ├── PRs (personal records)
│   ├── Sessions (programas guardados)
│   └── WeekPlan (almanaque semanal)
├── AUDIO (playBeep function)
├── SKELETON POSES (datos estáticos para preview)
├── MOVENET
│   ├── calcAngle
│   ├── REP_DETECTORS (lógica por ejercicio)
│   ├── useMoveNet (hook principal)
│   └── PoseView (componente cámara + overlay)
├── SCREENS
│   ├── HistoryScreen
│   ├── ProgramScreen (almanaque + editor)
│   ├── ExercisePicker (modal reutilizable)
│   ├── InfoModal
│   ├── PauseOverlay
│   └── ProgPrepScreen
└── RepCountApp (componente principal)
```

---

## 3. FEATURES PRINCIPALES

### 3.1 Modo Libre

**Flujo:** libre_select → setup → countdown → libre | counting → rest → finished

- Usuario elige ejercicio
- Configura: tiempo fijo O reps por set
- Entrena sin estructura predefinida
- IA cuenta reps automáticamente (o manual)
- Historial se guarda automáticamente

### 3.2 Mi Programa

**Componentes:**
1. **Almanaque semanal** (7 días, drag & drop de sesiones)
2. **Editor de sesiones** (bloques + ejercicios + configuración)
3. **Auto-ejecución** (la app guía el flujo completo)

**Tipos de bloques:**
- **Serie Normal** (💪): 1 ejercicio, múltiples sets
- **Superserie** (⚡): 2 ejercicios alternados, descanso mínimo
- **Serie Gigante** (🔥): 3-6 ejercicios encadenados sin descanso

**Flujo ejecución:** prog_prep → prog_counting → prog_rest → prog_done

---

## 4. SISTEMA DE DETECCIÓN DE POSES

### 4.1 MoveNet Integration

**Modelo:** SINGLEPOSE_LIGHTNING (TensorFlow.js)  
**Keypoints:** 17 puntos (0=nariz, 5-6=hombros, 7-8=codos, 9-10=muñecas, 11-12=caderas, 13-14=rodillas, 15-16=tobillos)  
**Backend:** WebGL (fallback a CPU si falla)  
**Confianza mínima:** 0.25

### 4.2 Rep Detection Logic

Cada ejercicio tiene su detector en `REP_DETECTORS`:

**Ejemplo: Flexiones**
```javascript
flexiones: (kps) => {
  // 1. Verifica confianza mínima
  // 2. Filtra poses inválidas (ej: cadera muy alta)
  // 3. Calcula ángulo del codo
  // 4. Determina fase: "down" (<90°) | "up" (>140°)
  // 5. Retorna {angle, phase, conf}
}
```

**Sistema de suavizado:**
- Ángulos: promedio móvil de 5 frames
- Fases: requiere 3 frames consecutivos estables
- Rate limiting: 600ms mínimo entre reps

### 4.3 Ejercicios Especiales

**Plancha (hold mode):**
- No cuenta reps, mide desviación de alineación
- Timer corre solo cuando postura es correcta (hd < 0.15)

**Burpees:**
- 6 pasos (sin salto) o 7 pasos (con salto)
- Usa ángulo cadera-hombro-rodilla

---

## 5. STORAGE SYSTEM

**API:** `window.storage` (persistent key-value store)

**Keys:**
- `repcount-history` — últimas 100 sesiones
- `repcount-prs` — personal records por ejercicio
- `repcount-sessions-v2` — programas guardados
- `repcount-weekplan-v2` — almanaque {0..6: sessionId}

**Fake history:** Primera vez seed con 5 sesiones demo

---

## 6. DECISIONES TÉCNICAS CLAVE

### 6.1 React Rules of Hooks

**Problema recurrente:** Llamar hooks dentro de loops/conditionals/IIFEs

**Fixes aplicados:**
- App-39.x: useState dentro de `.map()` en libre_select
- App-40.0: hooks en IIFE dentro de JSX en prog_prep

**Solución:** Extraer a componentes top-level (`ProgPrepScreen`)

### 6.2 Audio Synthesis

**No usa archivos MP3/WAV** — todo sintetizado con Web Audio API

**Tipos de sonidos:**
- `go` — 3 beeps ascendentes
- `whistle` — silbato (modulación LFO)
- `ready` — doble whistle
- `victory` — triple whistle largo
- `warning` — 3 beeps rápidos
- `rep` — triángulo decay
- `alarm` — 4 beeps ascendentes

### 6.3 Mobile Optimization

**Detección dispositivo:**
```javascript
const isMob = /Android|iPhone|iPad/i.test(navigator.userAgent)
```

**Ajustes:**
- Video: 320x240 (mobile) vs 640x480 (desktop)
- Frame skip: cada 2 frames (mobile) vs cada frame (desktop)
- UI: padding/font-size responsivos

---

## 7. EJERCICIOS DISPONIBLES

### 7.1 Por Categoría

**Full Body (🔥):**
- Burpee Sin Salto (6 pasos)
- Burpee Con Salto (7 pasos)
- Jumping Jacks

**Empuje (💪):**
- Flexiones
- Flexiones Diamante
- Pike Pushup
- Dips

**Tirón (🏋️):**
- Dominadas
- Dominada Supina
- Dominada Neutra
- Remo Australiano

**Piernas (🦵):**
- Sentadillas
- Zancadas
- Sissy Squat
- Sentadilla Una Pierna

**Isométrico (🧘):**
- Plancha (hold mode)

### 7.2 Nota sobre Dominadas

**Problema conocido:** Las 3 variantes (ancho/supina/neutra) tienen patrones de detección casi idénticos (mismo ángulo de codo).

**Pendiente:** Evaluar si reemplazar variantes por ejercicios con firmas de movimiento más distintas.

---

## 8. FLUJOS DE PANTALLAS

### 8.1 Modo Libre

```
home
  ↓
libre_select (elige ejercicio)
  ↓
setup (configura sets/tiempo/descanso)
  ↓
countdown (5 segundos)
  ↓
libre | counting (según modo)
  ↓ (después de cada set)
rest
  ↓ (después de último set)
finished
```

### 8.2 Mi Programa

```
home
  ↓
program (vista week)
  ├→ session_list (ver/crear sesiones)
  │   ↓
  │  session_edit (editor de bloques)
  ↓
prog_prep (countdown antes de bloque)
  ↓
prog_counting (ejercicio activo)
  ↓ (entre ejercicios o bloques)
prog_rest
  ↓ (fin de sesión)
prog_done
```

---

## 9. FEATURES PENDIENTES

### 9.1 UI/UX Enhancements

**SVG Custom Icons:**
- Íconos vectoriales por categoría de ejercicio
- Reemplazar emojis actuales

**8-bit Music/Sounds:**
- Música de inicio
- Countdown beeps (más retro)
- Victoria theme
- Rest timer ambience
- Síntesis: Web Audio API o BeepBox integration

### 9.2 Onboarding System

**Tooltips:**
- Setup plancha: "Activá IA para que el timer funcione"

**Pantallas "Cómo posicionarse":**
- Pre-ejercicio para: plancha, pike pushup, pistol squat
- Indicaciones de posición de cámara por ejercicio

**Tutorial first-use:**
- Mini guía primera vez que se usa un ejercicio nuevo

**Fallback hold sin IA:**
- Si IA desactivada en plancha → timer continuo

### 9.3 Ejercicios

**Restructuración:**
- Revisar dominadas (variantes muy similares)
- Considerar agregar ejercicios con patrones distintos

### 9.4 Deferred

**No prioritario ahora:**
- Multi-week periodization
- Progressive overload tracking
- Folder restructuring (components/, screens/, utils/)

---

## 10. HARDWARE COMPATIBILITY

**Confirmado:**
- Samsung Galaxy A26 (Mali-G68 MP5 GPU)
- WebGL backend funciona sin fallback a CPU

**Requerimientos mínimos:**
- Navegador con WebGL support
- Cámara frontal/trasera
- ~4GB RAM recomendado

---

## 11. DESARROLLO WORKFLOW

### 11.1 Pipeline

```
1. Editar src/App.jsx localmente
2. Push a GitHub (main branch)
3. Vercel auto-deploy
4. Test en dispositivo real
```

### 11.2 Trabajo con Claude

**Upload manual:**
- Usuario sube App.jsx cuando hay cambios
- Claude lee y genera nuevas versiones
- Claude entrega archivos descargables (NUNCA inline code)

**Versioning:**
- App-X.Y notation
- Estable: App-39.2
- Actual: App-40.0

**Claude NO tiene:**
- Acceso directo a filesystem
- Claude Code (requiere plan Pro)

---

## 12. PRÓXIMOS PASOS SUGERIDOS

**Prioridad alta:**
1. SVG icons (mejora visual significativa)
2. 8-bit sounds (experiencia más engaging)
3. Onboarding básico (reduce fricción nuevos usuarios)

**Prioridad media:**
4. Tutorial cámara/posicionamiento
5. Restructuración ejercicios dominadas

**Prioridad baja:**
6. Folder restructuring (cuando >2000 líneas o componentes duplicados)

---

## NOTAS FINALES

- **Single-file es OK** hasta que realmente necesitemos separar
- **React hooks violations** son el bug recurrente — extraer a componentes es la solución
- **Storage API** es asíncrono — siempre usar try/catch
- **MoveNet** es determinístico pero puede fallar en luz baja o ropa holgada
- **Mobile-first** — siempre testear en dispositivo real, no solo desktop

---

*Documento actualizado: Enero 2025*  
*Versión: App-40.0*
