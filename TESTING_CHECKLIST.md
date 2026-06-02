# VTC Capacitación — Testing Checklist Final

**URL:** https://vtc-capacitacion-deploy.vercel.app  
**Deployment ID:** dpl_CMT8o4nFS5ViKEyG758qMsSHiDty  
**Status:** ✅ LIVE  
**Date:** 2026-06-02

---

## ✅ FUNCIONALIDAD CRÍTICA

### 1. Chatbot Victor (ElevenLabs)
- [ ] Abrir página principal
- [ ] Navegar a cualquier módulo
- [ ] Ver sidebar derecho con "Víctor"
- [ ] Escribir mensaje en input "Pregúntale a Victor..."
- [ ] Click botón 📤 (send)
- [ ] Esperar respuesta (debe tomar 5-10 seg)
- [ ] Ver respuesta en chat
- [ ] Ver toast notification (arriba-derecha, 4s)

**Expected:** ✅ Chat funcional, respuestas reales del agente

---

### 2. Temario / Índice
- [ ] Scroll down → sección "Todos los Módulos"
- [ ] Verificar que se ven 16+ módulos en grid
- [ ] Click en "Módulo F" → scroll automático a módulo-f
- [ ] Click en otro módulo → scroll funciona
- [ ] Verificar módulos: Fundamentos, Psicología, Calificación, OPC, Rapport, Tour, Presentación, Cierre, Objeciones, TOC, Manager, PNL Avanzado, Nacionalidades, Legal, Proceso VTC, VTC 19

**Expected:** ✅ 18 items visibles, navegación funcional

---

### 3. Videos
- [ ] Módulo F → ver video con poster (image visible antes de play)
- [ ] Click play → video reproduce
- [ ] Módulo 0 → otro video, otro poster
- [ ] Verificar que TODOS los módulos tienen video
- [ ] Volume control funciona
- [ ] Fullscreen funciona
- [ ] Progress bar funciona

**Expected:** ✅ 38 videos + posters, reproducción OK

---

### 4. Menú Lateral (Toggle)
- [ ] Mobile: Click hamburguesa (☰) → menú abre
- [ ] Desktop: Menú visible de entrada
- [ ] Ver "Tu progreso" con ring %
- [ ] Ver lista de módulos
- [ ] Click en módulo de lista → scroll automático
- [ ] Desktop: Click módulo en lista → navega
- [ ] Mobile: Click módulo → menú cierra, scroll ejecuta

**Expected:** ✅ Navegación funcional en ambos layouts

---

## ✅ ACCESIBILIDAD (WCAG 2.1 AA)

### 5. Keyboard Navigation
- [ ] Tab → navega por botones (send, play, etc.)
- [ ] Enter → activa botones
- [ ] Shift+Tab → navega hacia atrás
- [ ] Tab ring visible (outline 2px dorado)

**Expected:** ✅ Navegable solo con teclado

---

### 6. Screen Reader
- [ ] NVDA/JAWS detecta:
  - [ ] "Navegación del curso" (nav aria-label)
  - [ ] "Abrir menú de módulos" (button aria-label)
  - [ ] "Enviar mensaje a Victor" (button aria-label)
  - [ ] Módulos linkables
  - [ ] Videos con poster

**Expected:** ✅ Screen reader friendly

---

### 7. Focus Visible
- [ ] Tab en enlaces → rectángulo dorado aparece
- [ ] Tab en botones → rectángulo dorado aparece
- [ ] outline-offset 2px (separado del borde)

**Expected:** ✅ Focus claramente visible

---

## ✅ RESPONSIVE DESIGN

### 8. Desktop (1920px)
- [ ] Logo VTC arriba
- [ ] Menú con links visibles (Módulos, Fundamentos, PNL, etc.)
- [ ] Sidebar izquierdo (progreso + módulos)
- [ ] Contenido principal centrado
- [ ] Sidebar derecho (Victor chat)
- [ ] Video fullscreen
- [ ] Quiz visible

**Expected:** ✅ Layout 3-column, todo visible

---

### 9. Tablet (768px)
- [ ] Menú colapsa (☰ visible)
- [ ] Sidebar izquierdo → drawer/colapsible
- [ ] Contenido principal ancho
- [ ] Sidebar derecho → debajo
- [ ] Videos responsive

**Expected:** ✅ 2-column a 1-column gracefully

---

### 10. Mobile (375px)
- [ ] ☰ hamburguesa en top
- [ ] Todo en vertical
- [ ] Videos fullwidth
- [ ] Chat sidebar visible (scroll)
- [ ] Botones clickeables (44px+ targets)
- [ ] Texto legible (no zoom requerido)

**Expected:** ✅ Mobile-first responsive

---

### 11. Landscape (812px)
- [ ] Contenido visible sin horizontal scroll
- [ ] No overflow en videos
- [ ] Botones accesibles

**Expected:** ✅ No horizontal scroll

---

## ✅ PERFORMANCE

### 12. Lighthouse Audit
Open DevTools → Lighthouse → Run audit (Mobile + Desktop)

**Targets:**
- [ ] Performance: ≥85
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

**Current (estimated):**
- Performance: 76 → 85+ (meta desc, og-image, cache)
- Accessibility: 82 → 92+ (aria-labels, focus-visible)
- Best Practices: 88 → 90+ (security headers)
- SEO: 90 → 95+ (og tags, meta desc)

---

### 13. Network / Console
- [ ] Open DevTools → Network
- [ ] Reload page
- [ ] Filter by Status
  - [ ] ✅ All 200/304 (no 404s except og-image handling)
  - [ ] ❌ No 500 errors
- [ ] Console tab
  - [ ] ✅ No errors (red X)
  - [ ] ✅ No warnings (yellow !)
  - [ ] ✅ Info messages OK (blue ℹ)

---

### 14. Core Web Vitals (CWV)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] INP (Interaction to Next Paint) < 200ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

DevTools → Lighthouse → check "Real-world data from Page Experience report"

---

## ✅ SEO & SHARING

### 15. Meta Tags
- [ ] View source: `<meta name="description" content="..."`
- [ ] View source: `<meta property="og:title"`
- [ ] View source: `<meta property="og:description"`
- [ ] View source: `<meta property="og:image"`

---

### 16. Open Graph Preview
- [ ] Twitter: https://twitter.com/home
- [ ] Paste URL → preview con imagen
- [ ] LinkedIn: https://www.linkedin.com/feed
- [ ] Paste URL → preview con imagen + description

---

## 📊 SUMMARY CHECKLIST

| Category | Items | Status |
|----------|-------|--------|
| **Critical** | Chatbot, Videos, Temario | 🔄 Testing |
| **A11y** | Keyboard, Screen Reader, Focus | 🔄 Testing |
| **Responsive** | Desktop, Tablet, Mobile | 🔄 Testing |
| **Performance** | Lighthouse, Network, CWV | 🔄 Testing |
| **SEO** | Meta tags, OG, Share preview | 🔄 Testing |

---

## 🚀 SIGN-OFF

**Tested by:** [Your Name]  
**Date:** ____/____/____  
**Result:** ✅ PASS | ❌ FAIL

**Notes:**
```
[Space for notes/issues found]
```

---

## 📌 ENVIRONMENT VARIABLES (VERIFIED)

✅ ELEVENLABS_API_KEY: sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67  
✅ ELEVENLABS_AGENT_ID: agent_5701kr0h5gg6eetb69tv6c5hwfj1  
✅ OPENROUTER_API_KEY: [configured in Vercel]

---

**Ready to go live!** 🎉
