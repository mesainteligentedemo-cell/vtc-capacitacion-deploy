# Quick Start — Header/Footer Unificado Victor IA en VTC

## ⚡ 30 segundos: Qué cambió

```diff
- Antigua nav: <nav aria-label="Navegación del curso">
+ Nueva header: <header class="vi-header"> con Victor IA, 5 nav items y selector de apps

- Nada de sidebar (está igual)
+ El sidebar se reposiciona debajo del header (top: 56px)

- Nada de footer (era solo <footer> genérico)
+ Nuevo footer: 3 columnas con links + copyright
```

## 🎯 Lo que verá el usuario

### Desktop
- Header fijo arriba (56px) con logo Victor IA, nav items y selector de apps
- Sidebar del lado izquierdo con progreso de módulos
- Contenido principal con todos los módulos y lecciones
- Footer al final con 3 columnas

### Mobile
- Header simplificado (logo + selector de apps, sin nav items)
- Sidebar funciona igual (con toggle)
- Footer en 1 columna

## ✅ Verificación rápida (2 minutos)

### 1. Abre VTC en el navegador
```
https://vtc-capacitacion-deploy.vercel.app
```

### 2. Busca estos elementos (debería verlos):
- [ ] Logo "Victor IA" en la esquina superior izquierda
- [ ] 5 nav items en la parte superior (Inicio, Módulos, Mi Progreso, Certificados, Soporte)
- [ ] Botón "VTC" (con ⋯) en la esquina superior derecha
- [ ] Sidebar con progreso en el lado izquierdo
- [ ] Footer con 3 columnas al final

### 3. Prueba la interactividad:
- [ ] Haz click en "VTC" → debe abrir dropdown con 4 apps
- [ ] Haz click en "Website" → debe ir a victor-ia-website.vercel.app
- [ ] Haz click en "Módulos" → debe ir a #indice
- [ ] Click fuera del dropdown → debe cerrarse
- [ ] Abre en mobile → nav principal desaparece

## 📝 Archivos creados para referencia

```
vtc-capacitacion-deploy/
├── index.html                                  (MODIFICADO — ya contiene los cambios)
├── IMPLEMENTACION-HEADER-FOOTER.md             (guía detallada)
├── REFERENCIA-CODIGO-HEADER-FOOTER.html        (código HTML/CSS/JS puro)
├── RESUMEN-IMPLEMENTACION.txt                  (overview ejecutivo)
├── MAPA-CAMBIOS.txt                            (dónde está cada cosa)
└── QUICK-START.md                              (este archivo)
```

## 🔧 Si necesitas cambiar algo

### Cambiar nav items
Edita líneas 35-41 en `index.html`:
```html
<nav class="vi-nav-main" aria-label="Navegación principal">
  <ul class="vi-nav-links">
    <li><a href="#inicio" class="vi-nav-link">Inicio</a></li>
    <li><a href="#indice" class="vi-nav-link">Módulos</a></li>
    <!-- Modifica aquí -->
  </ul>
</nav>
```

### Agregar más apps al selector
Edita líneas 60-63 en `index.html`:
```html
<div class="vi-app-menu" id="viAppMenu" hidden>
  <a href="https://victor-ia-website.vercel.app" class="vi-app-link">Website</a>
  <!-- Agrega tu app aquí -->
</div>
```

### Cambiar descripción del footer
Edita línea 2410 en `index.html`:
```html
<p class="vi-footer-desc">Tu nueva descripción aquí</p>
```

### Cambiar links del footer
Edita líneas 2414-2432 en `index.html`:
```html
<li><a href="#documentacion">Documentación</a></li>
<!-- Cambia los hrefs -->
```

## 🎨 Notas sobre colores y estilos

- **NO necesitas cambiar nada de colores** — usan las variables CSS de VTC (--gold, --ink2, etc)
- **Fuentes**: Cormorant Garamond (serif) y Inter (sans-serif) — ya están en VTC
- **Responsive**: Funciona en desktop, tablet y mobile sin código adicional
- **Dark mode**: Ya está activo (todo usa var(--ink), var(--cream), etc)

## 🚀 Deployment

El archivo `index.html` ya está actualizado y listo para producción.

```bash
# Si está en un repo de git
git add index.html
git commit -m "feat: header/footer unificado Victor IA para VTC"
git push

# El cambio debe deployarse automáticamente en Vercel
```

## ⚠️ Posibles problemas y soluciones

| Problema | Solución |
|----------|----------|
| Header cubre contenido | El CSS ya agrega `scroll-margin-top: 130px` — debe funcionar |
| Selector de apps no abre | Verifica que el script en líneas 2403-2432 está presente |
| Footer se ve roto en mobile | Abre con responsive design (F12 > Device Emulation) |
| Nav items no alineados | El layout es flexbox — debe alinearse automáticamente |
| Colores se ven raros | Verifica que usas las variables CSS de VTC sin cambios |

## 📞 Soporte

Si algo no funciona:
1. Abre `IMPLEMENTACION-HEADER-FOOTER.md` (guía detallada)
2. Revisa `MAPA-CAMBIOS.txt` (ubicación exacta de cada elemento)
3. Compara con `REFERENCIA-CODIGO-HEADER-FOOTER.html` (código de referencia)

## ✨ Lo que no cambió

- Todos los módulos funcionan igual
- Sidebar con progreso funciona igual
- Videos y contenido intacto
- Exámenes y quizzes sin cambios
- Scripts de JavaScript originales sin cambios
- Variables CSS de VTC sin cambios

## 🎁 Lo que ganaste

- Header unificado con branding Victor IA
- 5 nav items principales
- Selector de apps para navegar entre aplicaciones
- Footer profesional con links y copyright
- Responsive en todos los devices
- Accesibilidad mejorada (aria-labels, semantic HTML)
- Cero dependencias externas (CSS + vanilla JS)

---

**Status**: ✅ Listo para producción  
**Versión**: 1.0  
**Última actualización**: 2024
