// Debug script para verificar el temario index
// Ejecutar en DevTools console en https://vtc-capacitacion-deploy.vercel.app

(function() {
  console.log("=== VTC INDEX DEBUG ===\n");

  // 1. Verificar si #indice existe
  const indiceSection = document.getElementById('indice');
  console.log("✓ #indice section:", indiceSection ? "FOUND" : "NOT FOUND");

  if (!indiceSection) {
    console.log("❌ ERROR: No se encontró elemento #indice");
    return;
  }

  // 2. Verificar estructura del index
  const moduleGrid = indiceSection.querySelector('.module-grid');
  console.log("✓ .module-grid:", moduleGrid ? "FOUND" : "NOT FOUND");

  if (!moduleGrid) {
    console.log("❌ ERROR: No se encontró .module-grid dentro de #indice");
    return;
  }

  // 3. Contar módulos
  const cards = moduleGrid.querySelectorAll('.module-card');
  console.log("✓ .module-card count:", cards.length);

  if (cards.length === 0) {
    console.log("❌ ERROR: No hay .module-card dentro del grid");
    console.log("HTML del moduleGrid:\n", moduleGrid.innerHTML.substring(0, 500));
    return;
  }

  // 4. Listar primeros 5 módulos
  console.log("\n📚 Primeros 5 módulos:");
  Array.from(cards).slice(0, 5).forEach((card, i) => {
    const num = card.querySelector('.module-num')?.textContent || "N/A";
    const name = card.querySelector('.module-name')?.textContent || "N/A";
    const href = card.getAttribute('href');
    console.log(`  ${i+1}. ${num}: ${name} → ${href}`);
  });

  // 5. Verificar visibilidad
  const gridStyle = window.getComputedStyle(moduleGrid);
  console.log("\n🎨 Grid visibility:");
  console.log(`  display: ${gridStyle.display}`);
  console.log(`  visibility: ${gridStyle.visibility}`);
  console.log(`  opacity: ${gridStyle.opacity}`);
  console.log(`  grid-template-columns: ${gridStyle.gridTemplateColumns}`);

  // 6. Verificar scroll
  const scrollParent = indiceSection.querySelector('.index-inner');
  if (scrollParent) {
    console.log("\n📏 Scroll info:");
    console.log(`  scrollHeight: ${scrollParent.scrollHeight}`);
    console.log(`  clientHeight: ${scrollParent.clientHeight}`);
  }

  console.log("\n✅ DEBUG COMPLETE");
})();
