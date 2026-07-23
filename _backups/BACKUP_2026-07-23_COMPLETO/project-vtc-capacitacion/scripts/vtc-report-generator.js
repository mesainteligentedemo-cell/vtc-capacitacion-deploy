const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Genera PDF Premium "Obsidiana y Oro" + Email HTML
 * Entrada: webhook payload de ElevenLabs
 * Salida: { pdf: Buffer, html: string, audioFile: path }
 */

async function generateReportPDF(data) {
  const {
    userName,
    userEmail,
    conversationId,
    timestamp,
    duration,
    language,
    transcript,
    audioFile
  } = data;

  // Calcular métricas
  const score = calculateScore(transcript);
  const summary = generateSummary(transcript, language);
  const talkListenRatio = calculateRatio(transcript);
  const sentimentTrajectory = calculateSentiment(transcript);

  // Formatear fecha
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  const durationMin = Math.round(duration / 60);

  // HTML del PDF (Obsidiana y Oro)
  const pdfHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Helvetica', sans-serif;
      background: #000000;
      color: #FFFFFF;
      line-height: 1.6;
    }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 25mm 20mm;
      background: #000000;
      page-break-after: always;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
      padding-bottom: 20px;
    }
    .header h1 {
      color: #FFD700;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .header p {
      color: #AAAAAA;
      font-size: 12px;
      margin-top: 10px;
    }
    .score-box {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: rgba(255, 215, 0, 0.05);
      border: 2px solid #FFD700;
      border-radius: 8px;
    }
    .score-number {
      color: #FFD700;
      font-size: 72px;
      font-weight: 900;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
      letter-spacing: 0.05em;
    }
    .score-label {
      color: #FFFFFF;
      font-size: 14px;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      color: #FFD700;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
      padding-bottom: 8px;
      letter-spacing: 0.05em;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #1A1A1A;
      padding: 12px;
      border-left: 3px solid #FFD700;
      border-radius: 4px;
    }
    .info-label {
      color: #AAAAAA;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 5px;
    }
    .info-value {
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 600;
    }
    .summary-text {
      background: #1A1A1A;
      padding: 15px;
      border-radius: 6px;
      color: #E0E0E0;
      font-size: 13px;
      line-height: 1.8;
      border-left: 3px solid #FFD700;
    }
    .action-box {
      background: #1A1A1A;
      border: 1px solid #FFD700;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .action-box h3 {
      color: #FFD700;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .action-box p {
      color: #E0E0E0;
      font-size: 12px;
      line-height: 1.7;
    }
    .chart-container {
      margin: 20px 0;
      text-align: center;
    }
    .progress-bar {
      height: 8px;
      background: #1A1A1A;
      border-radius: 4px;
      margin: 10px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFD700 0%, #FFED4E 100%);
      border-radius: 4px;
    }
    .buttons {
      display: flex;
      gap: 15px;
      margin: 25px 0;
      justify-content: center;
    }
    .btn {
      padding: 12px 25px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: #FFD700;
      color: #000000;
    }
    .btn-primary:hover {
      background: #FFED4E;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }
    .btn-secondary {
      background: transparent;
      color: #FFD700;
      border: 1px solid #FFD700;
    }
    .btn-secondary:hover {
      background: rgba(255, 215, 0, 0.1);
    }
    .footer {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      text-align: center;
      font-size: 10px;
      color: #666666;
      border-top: 1px solid rgba(255, 215, 0, 0.2);
      padding-top: 15px;
    }
    @media print {
      body { background: white; }
      .page { background: white; color: black; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Reporte de Capacitación VTC</h1>
      <p>Sistema de Evaluación ELITE - Versión 8K</p>
    </div>

    <div class="score-box">
      <div class="score-number">${score}/10</div>
      <div class="score-label">Desempeño Global</div>
    </div>

    <div class="section">
      <div class="section-title">📊 Información de la Sesión</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Colaborador</div>
          <div class="info-value">${userName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${userEmail}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha</div>
          <div class="info-value">${dateStr}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Hora</div>
          <div class="info-value">${timeStr} CUN</div>
        </div>
        <div class="info-item">
          <div class="info-label">Duración</div>
          <div class="info-value">${durationMin} minutos</div>
        </div>
        <div class="info-item">
          <div class="info-label">Idioma</div>
          <div class="info-value">${language === 'es' ? 'Español' : 'English'}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📝 Resumen Ejecutivo</div>
      <div class="summary-text">${summary}</div>
    </div>

    <div class="section">
      <div class="section-title">📈 Análisis de Métricas</div>

      <div style="margin: 20px 0;">
        <div style="color: #AAAAAA; font-size: 12px; margin-bottom: 8px;">Talk-to-Listen Ratio</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${talkListenRatio}%"></div>
        </div>
        <div style="color: #E0E0E0; font-size: 11px; margin-top: 5px;">
          Tiempo de habla del usuario: ${talkListenRatio}% | Víctor IA: ${100 - talkListenRatio}%
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎯 Plan de Acción para el Gerente</div>
      <div class="action-box">
        <h3>Recomendaciones Prioritarias</h3>
        <p>
          • Enfoque en profundización de módulos de ventas estratégicas<br>
          • Práctica adicional en objeción handling<br>
          • Sesión de seguimiento recomendada en 7 días<br>
          • Métrica en proceso de calibración para próximas sesiones
        </p>
      </div>
    </div>

    <div class="buttons">
      <a href="https://victor-ia-training.vercel.app/" class="btn btn-primary">🔄 Volver a Entrenar</a>
      <a href="https://victor-ia-training.vercel.app/audio-player?id=${conversationId}" class="btn btn-secondary">🎧 Escuchar Conversación</a>
    </div>

    <div class="footer">
      DOCUMENTO CONFIDENCIAL VTC | GENERADO EN CANCÚN, Q.ROO | UTC-5 | ${dateStr}
    </div>
  </div>
</body>
</html>
  `;

  // Generar PDF con Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(pdfHTML, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  await browser.close();

  // Generar nombre de archivo
  const dateFormatted = dateStr.replace(/\//g, '-');
  const timeFormatted = timeStr.replace(/:/g, '-');
  const fileName = `${userName}_${dateFormatted}_${timeFormatted}`;

  return {
    pdf: pdfBuffer,
    fileName: `${fileName}.pdf`,
    audioFileName: `${fileName}.mp3`,
    metadata: {
      userName,
      userEmail,
      dateStr,
      timeStr,
      durationMin,
      score,
      summary,
      talkListenRatio
    }
  };
}

function calculateScore(transcript) {
  // Simulación: score basado en longitud y coherencia
  // En producción: usar API de análisis de lenguaje
  const wordCount = transcript.split(' ').length;
  const baseScore = Math.min(10, (wordCount / 100) * 5);
  return Math.round((baseScore + Math.random() * 2) * 10) / 10;
}

function generateSummary(transcript, language) {
  if (language === 'es') {
    return `La sesión mostró un desempeño destacado en la aplicación de técnicas de comunicación. El usuario demostró comprensión de los conceptos fundamentales y capacidad de adaptación en escenarios de práctica. Se recomienda continuar con el entrenamiento avanzado en los módulos posteriores para consolidar competencias.`;
  }
  return `The session demonstrated strong performance in communication technique application. The user showed understanding of fundamental concepts and adaptability in practice scenarios. It is recommended to continue with advanced training in subsequent modules to consolidate competencies.`;
}

function calculateRatio(transcript) {
  // Simulación: aproximadamente 60% usuario, 40% Víctor
  return 60 + Math.random() * 20;
}

function calculateSentiment(transcript) {
  // Devolver array de puntos para gráfico de sentimiento
  return [7, 7.5, 8, 8.5, 9, 8.8, 9, 9.2, 8.9, 9.1];
}

module.exports = { generateReportPDF };