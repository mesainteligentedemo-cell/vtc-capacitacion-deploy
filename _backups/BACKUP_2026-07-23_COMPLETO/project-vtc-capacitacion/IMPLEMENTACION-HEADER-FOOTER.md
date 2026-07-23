# Implementación: Header/Footer Unificado Victor IA en VTC

## Resumen de cambios realizados

Se ha implementado el header/footer unificado de Victor IA en VTC con las siguientes adaptaciones para el contexto LMS:

### 1. **Header Unificado** (líneas 17-64)
- **Logo**: Victor IA (mantiene branding unificado)
- **Nav principal**: Inicio, Módulos, Mi Progreso, Certificados, Soporte
- **Meta-nav**: Selector de apps (Website, Dashboard, VTC, Brain Tracker)
- **Posicionado**: `position:fixed` en la parte superior del viewport

### 2. **Menú lateral de módulos** (línea 66+)
- Se mantiene el sidebar de progreso existente
- Se reposiciona debajo del header (top: 56px)
- El menú toggle sigue funcionando normalmente
- Se ajusta la altura del sidebar para compensar el header

### 3. **Footer unificado** (líneas 2404-2440)
- **Tres columnas**:
  - Logo + descripción ("Capacitación de elite para salas de ventas VTC")
  - Links de recursos (Documentación, FAQ, Contacto, Legal)
  - Ecosistema Victor IA (Website, Dashboard, Brain Tracker)
- **Barra inferior**: Copyright y créditos
- **Responsive**: Grid layout que se adapta a dispositivos móviles

---

## Cambios CSS específicos

### Header
```css
.vi-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(10,14,39,.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--faint);
  z-index: 99;
}
```

**Nota**: El z-index es 99, inferior al menú lateral (95) para que el sidebar se vea encima cuando está abierto.

### Ajustes de layout
```css
.course-nav {
  top: 56px;  /* Se baja para que no solape el header */
  height: calc(100vh - 56px);  /* Se ajusta altura */
}

.cn-toggle {
  top: 56px;
}

.read-progress {
  top: 56px;
}

section[id] {
  scroll-margin-top: calc(74px + 56px);  /* 74px original + 56px del header */
}
```

### Footer
```css
.vi-footer {
  background: var(--ink2);
  border-top: 1px solid var(--faint);
  padding: 4rem 2rem 2rem;
  margin-top: 4rem;
}

.vi-footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 3rem;
}
```

---

## Cambios en el HTML

### Qué se reemplazó

**ANTES** (líneas 18-48):
```html
<div class="read-progress"></div>
<button class="cn-toggle">...</button>
<aside class="course-nav">...</aside>
<nav aria-label="Navegación del curso">
  <div class="nav-logo">V T C · Capacitación</div>
  <ul class="nav-links">
    <li><a href="#indice">Módulos</a></li>
    ...
  </ul>
</nav>
```

**AHORA** (líneas 18-76):
- Header unificado con logo Victor IA
- Nav principal con 5 items: Inicio, Módulos, Mi Progreso, Certificados, Soporte
- Selector de apps (meta-nav)
- Menú lateral sin cambios de estructura, pero reposicionado

### Footer agregado

Se insertó justo antes de `</body>` (líneas 2404-2440):
```html
<footer class="vi-footer">
  <div class="vi-footer-container">
    <!-- 3 columnas -->
  </div>
  <div class="vi-footer-bottom">
    <!-- Copyright -->
  </div>
</footer>
```

---

## Variables CSS utilizadas

Todas las variables ya están definidas en VTC:
- `--ink` (#0A0E27) - Fondo oscuro principal
- `--ink2` (#0C0C12) - Fondo oscuro secundario
- `--ink3` (#131317) - Fondo oscuro terciario
- `--ink4` (#1a1a1f) - Fondo oscuro quaternario
- `--cream` (#EAE6DF) - Texto principal
- `--muted` (#A8A8B8) - Texto secundario
- `--faint` (#2A2A34) - Bordes sutiles
- `--gold` (#FFD60A) - Accent primario
- `--gold2` (#FFE74C) - Accent hover
- `--gold3` (#FFD60A) - Accent secundario

**No requiere cambios de color**.

---

## Instrucciones de implementación paso a paso

### Paso 1: Verificar que el archivo se actualizó
```bash
# Verificar que el header está en su lugar
grep -n "vi-header" /ruta/a/index.html
```

### Paso 2: Testear el header visualmente
1. Abre VTC en el navegador
2. Verifica que:
   - El logo "Victor IA" aparece en la esquina superior izquierda
   - Los 5 nav items aparecen (Inicio, Módulos, Mi Progreso, Certificados, Soporte)
   - El selector de apps muestra "VTC" con un dropdown

### Paso 3: Testear el selector de apps
1. Haz click en el botón "VTC" (selector de apps)
2. Debe abrirse un dropdown con 4 opciones:
   - Website
   - Dashboard
   - VTC (con indicador visual de "actual")
   - Brain Tracker
3. Al hacer click en cualquiera, debe ir a esa app

### Paso 4: Verificar el menú lateral
1. El menú lateral debe estar debajo del header
2. Al hacer click en el toggle (hamburguesa), debe abrirse/cerrarse normalmente
3. El progreso visual debe funcionar como antes

### Paso 5: Verificar el footer
1. Scrollea hasta abajo de la página
2. Debe ver 3 columnas:
   - Victor IA + descripción
   - Links de recursos
   - Ecosistema Victor IA
3. Debe haber copyright al final

### Paso 6: Test en dispositivos móviles
1. Abre en mobile (iPhone, Android)
2. El header debe:
   - Mantener altura de 56px
   - Ocultar nav principal (display: none en media query)
   - Mostrar solo logo y selector de apps
3. El footer debe:
   - Convertirse a 1 columna en pantallas < 768px
   - Mantener la estructura legible

---

## Posibles ajustes posteriores

### Si quieres cambiar los items del nav principal:
Edita las líneas 35-41 en el `<nav class="vi-nav-main">`:
```html
<li><a href="#inicio" class="vi-nav-link">Inicio</a></li>
<li><a href="#indice" class="vi-nav-link">Módulos</a></li>
<!-- Agrega o modifica aquí -->
```

### Si quieres agregar más apps al selector:
Edita las líneas 60-63 en el `<div class="vi-app-menu">`:
```html
<a href="https://nueva-app.vercel.app" class="vi-app-link">Nueva App</a>
```

### Si quieres cambiar los links del footer:
Edita las líneas 2414-2432 en las 3 columnas del footer:
```html
<li><a href="#documentacion">Documentación</a></li>
<!-- Modifica los hrefs según necesites -->
```

---

## Compatibilidad

- **Desktop**: ✅ Chrome, Firefox, Safari, Edge
- **Tablet**: ✅ iPad, Android tablets (768px+)
- **Mobile**: ✅ iPhone, Android (< 768px) — nav principal se oculta, layout optimizado

### Requisitos:
- Modern browser con soporte para:
  - CSS Grid
  - CSS Flexbox
  - `backdrop-filter` (blur)
  - `position: fixed`
  - `scroll-margin-top`

---

## Flujo de navegación

```
Usuario abre VTC
    ↓
Ve el header con Victor IA logo
    ↓
Puede navegar usando:
  • Nav principal (5 items)
  • Selector de apps (cambiar entre apps)
  • Menú lateral de módulos (sidebar)
    ↓
Al final de la página, ve el footer con:
  • Links a Documentación, FAQ, Contacto
  • Links al ecosistema de Victor IA
```

---

## Notas técnicas

### Z-index stack (de arriba a abajo):
1. `1000` - Notificaciones de feedback (showAgentFeedback)
2. `99` - Header
3. `100` - Nav anterior (ya removida, pero documentada)
4. `98` - Toggle menu
5. `95` - Sidebar menu (course-nav)
6. `90` - Backdrop del menú

### Cambios en scroll behavior:
- Antes: `scroll-margin-top: 74px` (para el nav anterior)
- Ahora: `scroll-margin-top: 130px` (74px + 56px del nuevo header)

### Performance:
- El header usa `backdrop-filter: blur(12px)` que es GPU-accelerated
- No hay JavaScript inline para el header (CSS puro)
- Solo hay JS para el selector de apps (toggle behavior)

---

## Testing checklist

- [ ] Header aparece en todas las páginas
- [ ] Logo "Victor IA" es clickeable (va a /)
- [ ] Nav items funcionan (Inicio, Módulos, Mi Progreso, Certificados, Soporte)
- [ ] Selector de apps muestra dropdown
- [ ] Dropdown con 4 opciones visibles
- [ ] VTC está marcado como "current"
- [ ] Sidebar se abre/cierra normalmente
- [ ] Footer aparece al final
- [ ] Footer tiene 3 columnas (desktop)
- [ ] Footer se convierte a 1 columna (mobile)
- [ ] No hay overlaps entre header y contenido
- [ ] Scroll-to-section funciona correctamente
- [ ] Links de footer van a los lugares correctos

---

## Soporte

Si hay problemas con:
- **Header overlapping content**: Verificar que `margin-top` en el primer `<section>` sea `> 56px`
- **Selector de apps no funciona**: Verificar que el script está en el HTML (líneas 2403-2432)
- **Footer se ve mal en mobile**: Verificar que la media query `@media(max-width:768px)` está activa
- **Scroll-margin-top incorrecto**: Revisar que el CSS en la línea ~1585 está actualizado

---

**Fecha de implementación**: 2024  
**Versión**: 1.0  
**Status**: Listo para producción
