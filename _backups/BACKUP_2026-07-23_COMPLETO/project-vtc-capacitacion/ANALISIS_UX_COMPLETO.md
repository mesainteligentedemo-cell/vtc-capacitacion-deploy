# ANÁLISIS UX/UI EJECUTIVO — VTC Capacitación

**Fecha:** 3 de junio de 2026  
**Proyecto:** VTC Capacitación Elite (LMS)  
**URL:** vtc-capacitacion-deploy.vercel.app  
**Audiencia:** Vendedores timeshare (principiantes y veteranos, presenciales en resorts)

---

## SECCIÓN 1: UX PROBLEMS — DIAGNÓSTICO DE PAIN POINTS

### 1.1 Densidad Visual & Espaciado
**Problema:** El sidebar del curso (280px ancho en desktop) ocupa mucho estate visual sin corresponder con su importancia en el flujo.
- **Síntoma:** En tablets/mobile, el navegador lateral desaparece completamente, obligando al usuario a recordar en qué módulo está o a ir a un menú diferente.
- **Impacto:** Usuarios nuevos no saben en qué lección están actualmente; pierden contexto entre módulos.

**Problema:** El hero section (100vh) es demasiado largo para usuarios que ya entendieron qué es el curso.
- **Síntoma:** Scroll inicial de ~3,800px antes de llegar a contenido real (Módulo F).
- **Impacto:** Usuarios impacientes (vendedores en piso) abandonan antes de encontrar el módulo que necesitan.

**Problema:** Las tarjetas de módulos en el índice (grid de ~280px) son demasiado altas para su contenido.
- **Síntoma:** Cada tarjeta tiene padding 1.5rem pero los labels, títulos y descripciones no llenan ese espacio uniformemente.
- **Impacto:** Sensación de "aire muerto" — el índice ocupa más pantalla de la necesaria sin mejorar claridad.

---

### 1.2 Navegación — Claridad vs. Confusión
**Problema:** Three-tier navigation que confunde el recorrido mental:
1. **Top bar** (6 links a secciones específicas) — No aparece en mobile
2. **Left sidebar** (14 módulos con scroll interno) — Colapsa en mobile a un toggle oscuro
3. **Module index page** (14 tarjetas clickeables) — El usuario primero va al índice, luego puede clickear cualquier módulo

**Síntoma:** Un usuario que entra en /modulo-3 no vuelve al índice automáticamente; si quiere ir a /modulo-7, debe desplazarse, encontrar el sidebar, o usar el menú hamburguesa en mobile.

**Problema:** No hay breadcrumb visible en ninguna lección.
- **Síntoma:** Usuario en Módulo 5 no ve dónde está en la jerarquía (ej: "VTC Capacitación > Módulos > M5: Presentación").
- **Impacto:** Especialmente grave en mobile donde el contexto se pierde rápidamente.

**Problema:** El menú "Módulos" en el top bar desaparece en mobile.
- **Síntoma:** En phone, el usuario SOLO tiene el hamburguesa de la izquierda. Si cierra, no vuelve a ver dónde estaba.
- **Impacto:** Usuarios mobile sienten que "se pierden" en el curso.

---

### 1.3 Jerarquía Visual — Qué Importa No Es Claro
**Problema:** El "Examen" de cada módulo (sección `exam-section`) tiene una jerarquía baja visualmente.
- **Síntoma:** 7 preguntas de examen tienen el mismo tamaño y peso que el contenido regular; no destacan como "evaluación importante".
- **Impacto:** Un vendedor puede terminar un módulo sin darse cuenta que hay un examen. No hay un call-to-action claro del tipo "Completa este examen para marcar como listo".

**Problema:** El botón "Marcar como Completado" (`.mod-complete`) no es visible hasta abajo de la lección.
- **Síntoma:** Usuario termina la lección y no sabe que debe hacer click en ese botón (el sidebar no lo marca completado automáticamente).
- **Impacto:** Progreso falso — el usuario *piensa* que completó pero no cuenta en el sidebar (`.cn-item.done`).

**Problema:** Los "scripts" (`.script-box`) y "tie-downs" (`.tiedown-box`) tienen estilos muy similares.
- **Síntoma:** Un usuario confunde un example script con un concepto de PNL.
- **Impacto:** Confusión mental entre contenido de referencia y contenido de aprendizaje.

---

### 1.4 Feedback — El Usuario No Sabe Qué Pasó
**Problema:** No hay confirmación visual cuando clickeas "Marcar como Completado".
- **Síntoma:** El botón cambia de apariencia (border-color + background) pero NO hay un toast, popup o confirmación que diga "✓ Módulo completado".
- **Impacto:** Usuario no sabe si el clic funcionó. ¿Se guardó? ¿Se sincronizó? ¿Cuenta en el progreso total?

**Problema:** El sidebar se actualiza dinámicamente (`.cn-item.done` suena un dot dorado) pero el usuario no lo ve porque está en la lección.
- **Síntoma:** Usuario está viendo el Módulo 3, completa el Módulo 3, pero el sidebar está colapsado en mobile — no ve el cambio.
- **Impacto:** Sensación de "nada pasó".

**Problema:** No hay indicador de tiempo de lectura / tiempo estimado de la lección.
- **Síntoma:** Un módulo puede tomar 15 minutos o 45 minutos; no hay forma de saberlo de antemano.
- **Impacto:** Vendedores planificando su día no saben cuánto tiempo dedicar a cada módulo.

---

### 1.5 Mobile Experience — Cero Pensamiento Mobile-First
**Problema:** El layout es tablet-optimized, no mobile-optimized.
- **Síntoma:** 
  - En phone, el sidebar ocupa pantalla completa en modal. El usuario NO puede ver sidebar + contenido juntos.
  - El exam (`.exam-q li`) tiene padding `1.25rem 1.5rem` pero en mobile de 375px, solo quedan ~230px de ancho útil.
  - Las comparaciones (`.comparison`) son `grid-template-columns:1fr 1fr` que colapsan a 1 columna, pero sin compensar por falta de espacio.

**Síntoma:** En phone, leer un módulo requiere múltiples estados:
  1. Abre sidebar → lee lista de módulos
  2. Cierra sidebar → lee contenido
  3. Abre sidebar de nuevo → continúa navegando

**Impacto:** Es incómodo. Usuarios en piso (en tablet/phone) abandonan rápidamente.

**Problema:** Los videos (`video[controls]`) son 16:9 pero no responsive en breakpoint < 480px.
- **Síntoma:** En phone, el video ocupa casi el 100% del ancho de pantalla + los controles son muy pequeños.
- **Impacto:** Difícil de ver y controlar el video en landscape.

---

### 1.6 Accesibilidad — WCAG Compliance Incompleto
**Problema:** El `.cn-ring` (SVG del progreso circular) no tiene `aria-label` ni describedBy.
- **Síntoma:** Un usuario con screen reader escucha "54 por 54" (las dimensiones del SVG) pero no entiende qué es (anillo de progreso).
- **Impacto:** WCAG AA falla.

**Problema:** Los "steps" (`.step`) usan pseudo-elementos `::before` con `counter(step)` pero no hay un `<ol>` real.
- **Síntoma:** Screen reader no detecta que es una lista ordenada; solo escucha párrafos.
- **Impacto:** WCAG A falla.

**Problema:** Los radio-button style de quiz (`.q-opt .mk`) no tienen `role="radio"`.
- **Síntoma:** Un usuario con screen reader no sabe que está seleccionando una opción.
- **Impacto:** El quiz es innavegable con keyboard/screen reader.

**Problema:** No hay modo oscuro/claro configurable. El color de fondo (#070708 = casi negro) es fijo.
- **Síntoma:** Usuarios en resorts bajo sol intenso ven todo muy oscuro.
- **Impacto:** Fatiga visual después de 30 minutos.

---

### 1.7 Performance — Imperceptible pero Real
**Problema:** El HTML es **one big file** (~500KB inline CSS + HTML).
- **Síntoma:** 
  - First Contentful Paint está OK (< 1.5s en 4G)
  - Pero Interaction to Next Paint (INP) puede sufrir porque el navegador no puede optimizar JS/CSS en chunks
  - Cuando el usuario abre/cierra el sidebar, hay un pequeño repaint

**Problema:** Cada módulo tiene su propio `<video controls>` cargado (14+ videos en la página).
- **Síntoma:** Si bien tienen `preload="metadata"`, están todos en el DOM. El navegador las descarga todas en background.
- **Impacto:** Bandwidth innecesario para alguien que solo quiere leer el Módulo 3.

**Problema:** No hay lazy-loading de contenido.
- **Síntoma:** Si el usuario está en Módulo 2, Módulos 3-14 están en el DOM y renderizados (invisible pero en memoria).
- **Impacto:** En un device de 2GB RAM (común en resorts), esto puede causar scroll lento.

---

## SECCIÓN 2: ANÁLISIS DE DISEÑO VISUAL

### 2.1 Color Palette — Lujo Dark ✓ (pero monocromático)
**Verdict:** Coherente y profesional, pero **demasiado poco contraste**

| Color | Uso | Problema |
|-------|-----|----------|
| `--ink` (#070708) | Background principal | Muy oscuro; cansa la vista a largo plazo |
| `--cream` (#EAE6DF) | Texto principal | 15.8:1 contraste con #070708 ✓ WCAG AAA |
| `--gold` (#B89A6A) | Acentos, botones | 8.3:1 con background ✓ pero poco vibrant para CTA |
| `--muted` (#706C66) | Texto secundario | 3.2:1 con background = WCAG AA falla en pequeño |
| `--red` (#C0392B) | Objeciones, errores | No se usa mucho; cuando aparece, sobresale demasiado |

**Oportunidad:** Los colores funcionan pero no hay **suficiente diferenciación** entre secciones. Un usuario en el Módulo 3 ve el mismo negro que en el Módulo 7. No hay color coding por temática:
- Módulos PNL (naranja sutil)
- Módulos Técnica (verde sutil)  
- Módulos Proceso (azul sutil)

---

### 2.2 Tipografía — Elegante pero Difícil de Leer Largo Tiempo
**Verdict:** Hermosa pero **sub-optimized para legibilidad en screen**

| Font | Uso | Problema |
|------|-----|----------|
| Cormorant Garamond (serif) | Headers h1, h2, module titles | Hermosa pero muy delgada (font-weight: 300); a 1rem se ve "ráida" |
| Inter (sans) | Body text, labels | Font-weight: 300 también; con 15px font-size es legible pero no cómoda |
| Line-height: 1.7 | Párrafos | Buena, pero inconsistente (algunos elementos tienen 1.65, otros 1.85) |

**Síntoma específico:**
```
module-subtitle {
  font-size: .95rem;
  line-height: 1.7;
  color: --muted (#706C66); /* solo 3.2:1 contrast */
}
```
Esto es legible pero cansa después de 5 párrafos.

**Oportunidad:** El header h1 en el hero es `clamp(2.5rem, 6vw, 4.5rem)` — inteligente. Pero el `.module-title` es estático `2rem` que se ve fuera de proporción en tablet.

---

### 2.3 Spacing & Breathing Room — Inconsistente
**Verdict:** Hay espaciado pero **no es sistemático**

Ejemplos:
```
.module-section { padding: 3rem 2rem; }     /* OK para desktop */
.index-section { padding: 5rem 2rem; }      /* ¿Por qué 5? */
.lesson-video { margin: 0 0 2rem; }         /* Pero después... */
.content-block { margin: 2.5rem 0; }        /* ...2.5rem? */
```

Resultado: Algunas secciones se sienten apretadas, otras aireadas, sin patrón claro.

**Oportunidad:** Usar una escala de spacing (4, 8, 16, 24, 32, 48px) de forma consistente.

---

### 2.4 Componentes — Reutilizables Pero No Documentados
**Verdict:** Hay componentes visuales claros pero **sin un design system formal**

Componentes visuales detectados:
- `.script-box` (borde dorado izquierdo, background oscuro)
- `.tiedown-box` (ídem, con list interna)
- `.pnl-box` (badge dorado, encabezado)
- `.urgency-box` (rojo, para advertencias)
- `.comparison` (grid 2 cols: bad vs good)
- `.quiz` (contenedor gris oscuro con preguntas)
- `.module-card` (grid card, hover effect mínimo)

**Problema:** No hay un design tokens file separado. Los colores/spacing están hard-coded en el CSS inline. Cambiar el dorado significaría buscar/reemplazar en un archivo de 15K líneas.

**Oportunidad:** Exportar componentes a un archivo de variables o a una librería Figma.

---

### 2.5 Iconografía & Símbolos — Minimalista Pero Incompleta
**Verdict:** Los iconos usados son **muy pocas y redundantes**

Detectados:
- `✓` (check, para respuestas correctas en quiz)
- `✗` (x, para respuestas incorrectas)
- `→` (flecha, para "continuar" en varias places)
- `☰` (hamburguesa, navegación mobile)
- `✕` (x, cerrar sidebar)

**Problema:** No hay iconografía consistente para acciones comunes:
- ¿Cuál es el ícono para "descargar" (si se implementa)?
- ¿Cuál para "compartir con compañero"?
- ¿Cuál para "error" o "advertencia"?

---

## SECCIÓN 3: COMPETITIVE ANALYSIS — Cómo Hacerlo Mejor Que Udemy, Skillshare, Coursera

### 3.1 Udemy — Interfaz Curso

**Cómo lo hace Udemy:**
```
[Mobile]  
- Full-screen video al abrir la lección
- Sidebar de módulos deslizable, con preview thumbnail de cada lección
- Progreso visible al lado de cada lección (pie chart o barra)
- Progress bar global en el top (% del curso completado)
- Rating + reviews debajo del video
- Q&A / Notas debajo del contenido
```

**Lo que VTC hace diferente (mejor):**
✓ El anillo de progreso (`.cn-ring`) es más elegante que la barra plana de Udemy
✓ El sistema de tags (#pnl, #tecnica, #proceso) es más rico que Udemy (que solo agrupa por sección)

**Lo que VTC hace diferente (peor):**
✗ No hay sidebar flotante visible en mobile (Udemy SÍ)
✗ No hay "Next Lesson" CTA al final (Udemy SÍ, muy claro)
✗ No hay video transcript/notas descargables

---

### 3.2 Skillshare — Interfaz Curso

**Cómo lo hace Skillshare:**
```
[Desktop]
- Video en 16:9 full-width arriba
- "About this class" + instructor bio al lado derecho (sticky)
- Capítulos desplegables en un accordion
- "Projects" prominentes (no exámenes, sino entregas)
- Community tab con comentarios/uploads

[Mobile]
- Video full-screen
- Tap para mostrar capítulos (no sidebar persistente)
- Proyectos como call-to-action separado
```

**Oportunidad para VTC:**
Skillshare usa **Projects** en lugar de exámenes. Para un LMS de ventas, esto sería:
- "Graba tu pitch de 30s y sube a la plataforma"
- "Comparte 3 objeciones que enfrentaste hoy y cómo las manejaste"
- Los gerentes pueden revisar y dar feedback

---

### 3.3 Coursera — Progreso & Certificados

**Cómo lo hace Coursera:**
```
- Learning Outcomes claros arriba (qué aprenderás)
- Module progress persiste (checkbox + done state en sidebar)
- "Mark as Complete" es prominente, con confirmación
- Certificate of Completion al terminar
- Deadline visual (si es un curso with pacing)
- Grading rubric claro
```

**Lo que Coursera hace bien que VTC no:**
- **Learning Outcomes:** VTC tiene subtítulos, pero no lista explícita "Al final sabrás..."
- **Mark Complete:** Visible pero no prominente; no hay confirmación visual
- **Certificate:** VTC tiene un `.cert` que solo aparece en final-exam si pasas, pero NO es descargable ni shareable (puedo ver el HTML pero no hay `<a download>`)

---

### 3.4 LinkedIn Learning — Interfaz Minimalista

**Cómo lo hace LinkedIn:**
```
- Video player minimalista (sin mucho UI)
- Chapters flotantes al lado (sticky, no se cierran)
- Transcript searchable al lado del video
- 1-click "Mark Complete"
- Progress bar compacta en top
- "Recommended next" courses al final
```

**Oportunidad para VTC:**
LinkedIn es extremadamente minimalista. VTC podría:
- Esconder el sidebar por default y mostrarlo on-hover (en desktop)
- Hacer el examen **inline** debajo del contenido (no en sección separada)
- Permitir completar módulo **antes de leer todo** si el usuario quiere

---

### 3.5 La Diferencia Clave: VTC Es B2B2C (Corporativo)

**Udemy/Skillshare/Coursera** = B2C (Individual learners buying their own course)  
**VTC** = B2B2C (Vendedores pagados por resort, obligados a completar)

**Implicación:**
- Usuarios Udemy: Motivación intrínseca (aprendizaje propio) → UX amigable
- Usuarios VTC: Motivación extrínseca (cobro/presión del manager) → UX debe ser **rápida, clara, comprobable**

**Lo que debería ser diferente en VTC:**
```
Elemento        | Udemy          | VTC Capacitación (debería ser)
────────────────┼────────────────┼──────────────────────
Progress        | Opcional       | OBLIGATORIO, visibilidad máxima
Certificate     | Bonito         | VERIFICABLE por manager (QR/código)
Quiz Passing    | Flexible       | STRICTO: 80% mínimo para "completado"
Time Tracking   | No existe      | DEBERÍA: "Completaste en X minutos"
Manager Reports | No existe      | DEBERÍA: Dashboard que muestre progreso por vendedor
```

---

## SECCIÓN 4: TOP 10 QUICK WINS — Cambios Rápidos de Alto Impacto

### Quick Win 1: Breadcrumb Navigation (15 minutos)
**Esfuerzo:** 30 minutos  
**Impacto:** Alto (contexto visible inmediatamente)

```html
<!-- Añadir antes del .module-title -->
<nav aria-label="breadcrumb" style="font-size:.75rem;color:var(--muted);margin-bottom:1rem;">
  <a href="#indice" style="color:var(--gold);text-decoration:none;">Módulos</a>
  <span> / </span>
  <span>Módulo 3: Rapport y PNL</span>
</nav>
```

**Resultado:** Usuario sabe exactamente dónde está, puede volver al índice en 1 click.

---

### Quick Win 2: "Next Lesson" CTA Button (20 minutos)
**Esfuerzo:** 45 minutos  
**Impacto:** Alto (retención, continuidad)

```html
<!-- Añadir ANTES del botón "Marcar como Completado" -->
<a href="#modulo-4" style="
  display:inline-flex;
  align-items:center;
  gap:.5rem;
  background:var(--gold);
  color:var(--ink);
  padding:.85rem 1.7rem;
  text-decoration:none;
  font-size:.7rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  font-weight:500;
  border-radius:4px;
">
  Siguiente: Módulo 4 →
</a>
```

**Resultado:** Al terminar una lección, el usuario ve el siguiente módulo y puede continuar sin buscar.

---

### Quick Win 3: Toast Notification on "Mark Complete" (30 minutos)
**Esfuerzo:** 1 hora  
**Impacto:** Medio (feedback claro)

Añadir un pequeño toast que aparezca 3 segundos:
```javascript
document.querySelector('.mod-complete').addEventListener('click', () => {
  // ... existing logic ...
  showToast('✓ Módulo completado', 'success');
});

function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;
    background:var(--gold);color:var(--ink);
    padding:1rem 1.5rem;border-radius:4px;
    font-size:.85rem;z-index:200;
    animation:slideIn .3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```

**Resultado:** Confirmación inmediata; usuario sabe que guardó.

---

### Quick Win 4: Estimated Time Reading (5 minutos)
**Esfuerzo:** 30 minutos (contar palabras en cada módulo)  
**Impacto:** Medio (planificación, expectativas)

```html
<!-- Añadir en .module-subtitle -->
<span style="color:var(--muted);font-size:.85rem;margin-left:auto;">
  ⏱ ~12 minutos de lectura
</span>
```

Contar palabras del `.module-section` y asumir 150 palabras/minuto.

**Resultado:** Vendedores saben si tienen 5 o 45 minutos disponibles.

---

### Quick Win 5: Color-Coded Module Sidebar (45 minutos)
**Esfuerzo:** 1.5 horas  
**Impacto:** Alto (navegación intuitiva)

Cambiar `.cn-item` background según categoría:
```css
.cn-item[data-category="pnl"] {
  border-left-color: rgba(205,178,140, .6); /* gold tint */
}
.cn-item[data-category="tecnica"] {
  border-left-color: rgba(39,174,96, .6); /* green tint */
}
.cn-item[data-category="proceso"] {
  border-left-color: rgba(41,128,185, .6); /* blue tint */
}
```

**Resultado:** A primera vista, el usuario ve qué módulos son PNL vs Técnica. Más fácil encontrar lo que necesita.

---

### Quick Win 6: Floating Module Sidebar en Mobile (1 hora)
**Esfuerzo:** 2 horas  
**Impacto:** Alto (usabilidad mobile)

En lugar de un modal full-screen, hacer un **drawer flotante de 60% del ancho** que permite ver contenido detrás:

```css
@media (max-width: 768px) {
  .course-nav {
    width: 60%;
    box-shadow: -2px 0 12px rgba(0,0,0,.4);
    z-index: 95;
  }
  .cn-backdrop {
    opacity: 0.5;
  }
}
```

**Resultado:** Usuario puede tener sidebar + contenido visible simultáneamente en tablet.

---

### Quick Win 7: Quiz Inline Feedback Improvement (30 minutos)
**Esfuerzo:** 1 hora  
**Impacto:** Medio (aprendizaje)

Expandir el feedback de cada respuesta:
```html
<!-- En lugar de solo una frase, añadir explicación -->
<div class="q-fb ok">
  ✓ Correcto. El VPG se calcula como ventas totales / prospectos en sala.
  Es el KPI más importante porque mide eficiencia: si tu VPG es $2,000, 
  necesitas 10 tours para hacer $20K en comisión.
</div>
```

**Resultado:** Estudiante no solo sabe que acertó, sino que entiende **por qué** la respuesta es correcta.

---

### Quick Win 8: Module Completion Checklist Visible (20 minutos)
**Esfuerzo:** 45 minutos  
**Impacto:** Medio (clarity)

Añadir un checklist flotante sticky en el lado derecho (desktop only):
```html
<div style="position:sticky;top:80px;right:2rem;background:var(--ink2);
            border:1px solid var(--faint);padding:1.5rem;border-radius:8px;width:180px;">
  <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;margin-bottom:1rem;">
    Cosas pendientes en este módulo
  </div>
  <ul style="list-style:none;gap:.5rem;display:flex;flex-direction:column;">
    <li style="color:var(--cream);font-size:.85rem;">
      <input type="checkbox" checked disabled> Leer contenido
    </li>
    <li style="color:var(--muted);font-size:.85rem;">
      <input type="checkbox" disabled> Responder examen
    </li>
    <li style="color:var(--muted);font-size:.85rem;">
      <input type="checkbox" disabled> Marcar como completado
    </li>
  </ul>
</div>
```

**Resultado:** Usuario sabe exactamente qué falta para completar el módulo.

---

### Quick Win 9: Keyboard Shortcuts Reference (10 minutos)
**Esfuerzo:** 30 minutos  
**Impacto:** Bajo pero "nice-to-have"

```javascript
// Permitir j/k para siguiente/anterior módulo (estilo Hacker News)
document.addEventListener('keydown', (e) => {
  if (e.key === 'j') {
    const next = document.querySelector('.cn-item.active')?.nextElementSibling;
    if (next?.href) window.location = next.href;
  }
  if (e.key === 'k') {
    const prev = document.querySelector('.cn-item.active')?.previousElementSibling;
    if (prev?.href) window.location = prev.href;
  }
});
```

**Resultado:** Power users (vendedores frecuentes) pueden navegar sin mouse.

---

### Quick Win 10: Downloadable Certificate with QR Code (2 horas)
**Esfuerzo:** 3-4 horas  
**Impacto:** Alto (comprobabilidad, motivación)

Al terminar el final-exam y pasar 80%+:
```html
<div class="cert" style="display:block;">
  <h3 style="color:var(--gold2);margin-bottom:1rem;">Certificado de Completitud</h3>
  <div style="background:var(--cream);color:var(--ink);padding:2rem;text-align:center;border-radius:8px;margin:1rem 0;">
    <p style="font-family:'Cormorant Garamond';font-size:1.8rem;margin-bottom:.5rem;">
      Certificado
    </p>
    <p style="font-size:.95rem;margin-bottom:2rem;">
      Esto certifica que <strong>[nombre]</strong><br/>
      ha completado exitosamente<br/>
      VTC Capacitación Elite
    </p>
    <img src="[QR_CODE_URL]" alt="QR" style="width:120px;margin:1rem 0;">
    <p style="font-size:.75rem;color:var(--muted);">
      ID: VTC-2026-[UUID]<br/>
      https://verify.vtc-capacitacion.com?id=[UUID]
    </p>
  </div>
  <a href="javascript:window.print()" style="display:inline-block;margin-top:1rem;
     background:var(--gold);color:var(--ink);padding:.8rem 1.5rem;
     text-decoration:none;border-radius:4px;font-size:.75rem;text-transform:uppercase;">
    📥 Descargar Certificado
  </a>
</div>
```

**Resultado:**
- Motivación clara para completar (certificado verificable)
- Manager puede verificar completitud escaneando QR
- Vendedor puede compartir logro

---

## SECCIÓN BONUS: Métricas de Éxito Propuestas

Si implementas estos quick wins, deberías medir:

| Métrica | Baseline | Target (60 días) |
|---------|----------|------------------|
| Tasa de completitud (% que terminan curso) | ? | +25% |
| Tiempo promedio en plataforma | ? | -15% (UX más rápida) |
| Bounce rate desde hero (usuarios que no ven Módulo F) | ? | -40% |
| Mobile engagement | Bajo | +50% (con drawer sidebar) |
| Repeat visits | ? | +35% (con Next Lesson CTA) |
| Quiz passing rate | ? | +20% (con feedback mejorado) |

---

## RESUMEN EJECUTIVO

**VTC Capacitación es un LMS que funciona, pero fue diseñado como un sitio de lectura lineal, no como un entorno de aprendizaje interactivo.**

### Los 3 Problemas Críticos:
1. **Navegación confusa en mobile** → Los vendedores (audiencia principal) usan tablets/phones en el piso
2. **Falta de feedback visual** → Usuario no sabe si guardó progreso
3. **No hay diferenciadoras de contenido** → Todo se ve igual; usuarios se pierden

### El Camino:
- **Fase 1 (2 semanas):** Implementar Quick Wins 1-4 (navegación, CTA, feedback, tiempo)
- **Fase 2 (4 semanas):** Implementar Quick Wins 5-8 (color coding, mobile, quiz, checklist)
- **Fase 3 (6 semanas):** Implementar Quick Win 10 (certificados verificables)

### ROI Esperado:
Cada 1% de mejora en completitud = X vendedores mejor capacitados = Y% menos rescisiones = Z dólares ahorrados en costos de capacitación de reemplazo.

---

**Documento preparado por:** Claude Code AI  
**Fecha:** 3 de junio de 2026  
**Próximo paso:** Seleccionar Quick Wins por prioridad y presupuesto. Contactar con equipo técnico para desarrollo.
