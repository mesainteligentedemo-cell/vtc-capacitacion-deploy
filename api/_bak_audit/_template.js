// Plantilla del reporte VTC — documento único de flujo continuo (email + PDF).
// Editable a mano (ya no es un blob auto-generado). Tokens {{ASI}} se rellenan en api/report.js.
// Paleta: oro #d4af37 · fondo oscuro #1a1a1a · texto claro #f5f5f5 · verde #5cc08a · naranja #b8860b.
// Sin saltos de página forzados: es UNA tabla continua; el PDF (api/_render.js) mide la altura
// real renderizada y genera una sola página de esa altura — crece o se achica con la sesión.
module.exports = `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>Reporte de entrenamiento · Víctor · VTC</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td{ mso-table-lspace:0; mso-table-rspace:0; }
  img{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
  body{ margin:0; padding:0; width:100%!important; background:#1a1a1a; }
  a{ color:#d4af37; text-decoration:none; }
  @media only screen and (max-width:620px){
    .container{ width:100%!important; }
    .px{ padding-left:24px!important; padding-right:24px!important; }
    .stack{ display:block!important; width:100%!important; }
    .stack-pad{ padding:0 0 14px 0!important; }
    .h1{ font-size:26px!important; line-height:32px!important; }
    .score-num{ font-size:64px!important; }
    .metric-num{ font-size:18px!important; }
    .radar-img{ width:280px!important; height:280px!important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#1a1a1a;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#1a1a1a;">
  {{USER_NAME}}, tu sesión con Víctor: {{SCORE}}/10. Análisis completo, competencias, PNL y tu próximo drill.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background:#202020;border:1px solid #2c2c2c;border-radius:18px;overflow:hidden;">

  <!-- ░░ HEADER ░░ -->
  <tr><td class="px" style="padding:38px 44px 26px 44px;border-bottom:1px solid #2c2c2c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:3.5px;color:#d4af37;text-transform:uppercase;font-weight:600;">VICTORIOUS&nbsp;TRAVELERS&nbsp;CLUB&nbsp;&nbsp;|&nbsp;&nbsp;{{FECHA_UPPER}}</td>
    </tr></table>
    <div style="height:18px;font-size:0;">&nbsp;</div>
    <div class="h1" style="font-family:Georgia,serif;font-size:32px;line-height:38px;color:#f5f5f5;letter-spacing:-0.3px;">Reporte de entrenamiento</div>
    <div style="height:8px;font-size:0;">&nbsp;</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:22px;color:#9a9a9a;letter-spacing:0.2px;">{{SESSION_LINE}}</div>
    <div style="height:4px;font-size:0;">&nbsp;</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:18px;color:#7c7c84;letter-spacing:0.3px;">{{FECHA}} · {{HORA_RANGO}}</div>
    <div style="height:12px;font-size:0;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#d4af37;background:#241f14;border:1px solid #3a3020;border-radius:6px;padding:6px 11px;">EMPLEADO&nbsp;Nº&nbsp;{{EMP_NUM}}</td>
      <td style="width:8px;">&nbsp;</td>
      <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#b5b5b5;background:#242424;border:1px solid #303030;border-radius:6px;padding:6px 11px;text-transform:uppercase;">{{DEPARTAMENTO}}</td>
      <td style="width:8px;">&nbsp;</td>
      <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#1a1a1a;background:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:6px 11px;text-transform:uppercase;font-weight:700;">{{CATEGORIA}}</td>
    </tr></table>
  </td></tr>

  <!-- ░░ SCORE HERO — DESEMPEÑO GLOBAL ░░ -->
  <tr><td class="px" style="padding:36px 44px 28px 44px;" align="center">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;">Desempeño global</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div class="score-num" style="font-family:Georgia,serif;font-size:84px;line-height:88px;color:#d4af37;letter-spacing:-2px;">{{SCORE}}<span style="font-size:30px;color:#6a6a6a;letter-spacing:0;">/10</span></div>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="320" cellpadding="0" cellspacing="0" border="0" style="max-width:320px;"><tr>
      <td style="background:#2e2e2e;border-radius:99px;font-size:0;line-height:0;">
        <table role="presentation" width="{{SCORE_PCT}}%" cellpadding="0" cellspacing="0" border="0"><tr><td height="6" style="background:#d4af37;border-radius:99px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
      </td></tr></table>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:21px;color:#b8b8b8;letter-spacing:0.2px;">{{VEREDICTO}}</div>
  </td></tr>

  <!-- ░░ RESUMEN DE LA LLAMADA ░░ -->
  <tr><td class="px" style="padding:8px 44px 6px 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181818;border:1px solid #262626;border-radius:12px;"><tr><td style="padding:22px 24px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;font-weight:600;">Resumen de la llamada</div>
      <div style="height:10px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:24px;color:#cfcfcf;letter-spacing:0.1px;">{{RESUMEN}}</div>
    </td></tr></table>
  </td></tr>

  <!-- ░░ MÉTRICAS: ESCENARIO + MÓDULOS (si aplica) ░░ -->
  {{METRICS_ROW}}

  <!-- ░░ TABLA 4 COLUMNAS: DURACIÓN · IDIOMA · TONO · DIFICULTAD ░░ -->
  {{ANALYTICS_ROW}}

  <!-- ░░ MAPA DE COMPETENCIAS (hexágono) ░░ -->
  <tr><td class="px" style="padding:26px 44px 8px 44px;" align="center">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;">Mapa de competencias</div>
    <div style="height:14px;font-size:0;">&nbsp;</div>
    <div class="radar-img" style="width:360px;height:360px;max-width:100%;margin:0 auto;">{{RADAR_SVG}}</div>
  </td></tr>

  <!-- ░░ PRINCIPIOS NEUROCIENTÍFICOS ACTIVADOS (barras) ░░ -->
  <tr><td class="px" style="padding:18px 44px 6px 44px;">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;">Principios neurocientíficos activados</div>
    <div style="height:16px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      {{NEURO_BARS}}
    </table>
  </td></tr>

  <!-- ░░ LÍNEA DE LA CONVERSACIÓN ░░ -->
  <tr><td class="px" style="padding:24px 44px 6px 44px;">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;">Línea de la conversación</div>
    <div style="height:16px;font-size:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      {{TIMELINE_HTML}}
    </table>
  </td></tr>

  <!-- ░░ LO QUE HICISTE BIEN (oro) ░░ -->
  <tr><td class="px" style="padding:24px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:2px solid #d4af37;"><tr><td style="padding:2px 0 2px 18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2.5px;color:#d4af37;text-transform:uppercase;font-weight:600;">✓ Lo que hiciste bien</div>
      <div style="height:8px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:23px;color:#cfcfcf;letter-spacing:0.1px;">{{FORTALEZAS}}</div>
    </td></tr></table>
  </td></tr>

  <!-- ░░ A MEJORAR (naranja) ░░ -->
  <tr><td class="px" style="padding:22px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:2px solid #b8860b;"><tr><td style="padding:2px 0 2px 18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2.5px;color:#b8860b;text-transform:uppercase;font-weight:600;">△ A mejorar</div>
      <div style="height:8px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:23px;color:#cfcfcf;letter-spacing:0.1px;">{{AREAS_MEJORA}}</div>
    </td></tr></table>
  </td></tr>

  <!-- ░░ OBJECIONES QUE ENFRENTASTE ░░ -->
  <tr><td class="px" style="padding:22px 44px 0 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:2px solid #3a3a3a;"><tr><td style="padding:2px 0 2px 18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2.5px;color:#9a9a9a;text-transform:uppercase;font-weight:600;">Objeciones que enfrentaste</div>
      <div style="height:8px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:23px;color:#cfcfcf;letter-spacing:0.1px;">{{OBJECIONES}}</div>
    </td></tr></table>
  </td></tr>

  <!-- ░░ ANÁLISIS PNL ░░ -->
  <tr><td class="px" style="padding:28px 44px 6px 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181620;border:1px solid #2c2838;border-radius:14px;"><tr><td style="padding:24px 26px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#9b8cff;text-transform:uppercase;font-weight:600;">🧠 Análisis PNL</div>
      <div style="height:10px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:24px;color:#cfcfcf;letter-spacing:0.1px;">{{ANALISIS_PNL}}</div>
    </td></tr></table>
  </td></tr>

  <!-- ░░ TU PRÓXIMO DRILL (CTA) ░░ -->
  <tr><td class="px" style="padding:24px 44px 8px 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#221d10;border:1px solid #3a3020;border-radius:14px;"><tr><td style="padding:24px 26px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#d4af37;text-transform:uppercase;font-weight:600;">🎯 Tu próximo drill</div>
      <div style="height:10px;font-size:0;">&nbsp;</div>
      <div style="font-family:Georgia,serif;font-size:18px;line-height:26px;color:#f5f5f5;letter-spacing:0.1px;">{{RECOMENDACION}}</div>
      <div style="height:18px;font-size:0;">&nbsp;</div>
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{CTA_URL}}" style="height:44px;v-text-anchor:middle;width:230px;" arcsize="50%" fillcolor="#d4af37" stroke="f"><center><![endif]-->
      <a href="{{CTA_URL}}" style="display:inline-block;background:#d4af37;color:#1a1a1a;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:99px;">Entrenar de nuevo</a>
      <!--[if mso]></center></v:roundrect><![endif]-->
    </td></tr></table>
  </td></tr>

  <!-- ░░ EVALUACIÓN DE COMPRENSIÓN — QUIZ ░░ -->
  {{QUIZ_SECTION}}

  <!-- ░░ PLAN DE ACCIÓN: PARA EL GERENTE ░░ -->
  <tr><td class="px" style="padding:28px 44px 6px 44px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#141c17;border:1px solid #22331f;border-radius:14px;"><tr><td style="padding:24px 26px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#5cc08a;text-transform:uppercase;font-weight:600;">📋 Plan de acción · para el gerente</div>
      <div style="height:6px;font-size:0;">&nbsp;</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:18px;color:#7a9483;letter-spacing:0.2px;">Pasos concretos para llevar a este asesor a la excelencia.</div>
      <div style="height:14px;font-size:0;">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{{PLAN_ACCION}}</table>
    </td></tr></table>
  </td></tr>

  <!-- ░░ ANÁLISIS DEL APRENDIZAJE ░░ -->
  {{COURSE_ANALYSIS}}

  <!-- ░░ NOTA PARA ENTRENADOR ░░ -->
  {{TRAINER_NOTE}}

  <!-- ░░ ACTIVIDADES DE LA SESIÓN ░░ -->
  {{SESSION_ACTIVITY}}

  <!-- ░░ TRANSCRIPCIÓN COMPLETA ░░ -->
  <tr><td class="px" style="padding:30px 44px 6px 44px;border-top:1px solid #2c2c2c;">
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;">Transcripción completa</div>
    <div style="height:6px;font-size:0;">&nbsp;</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:18px;color:#6a6a6a;letter-spacing:0.2px;">Conversación palabra por palabra entre Víctor y el asesor.</div>
    <div style="height:18px;font-size:0;">&nbsp;</div>
    {{TRANSCRIPT_CHAT}}
  </td></tr>

  <!-- ░░ FOOTER · CTAs ░░ -->
  <tr><td class="px" style="padding:14px 44px 8px 44px;" align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding:0 6px;">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{AUDIO_URL}}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="#242424" strokecolor="#3a3a3a"><center><![endif]-->
        <a href="{{AUDIO_URL}}" style="display:inline-block;background:#242424;border:1px solid #3a3a3a;color:#d4af37;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:14px 24px;border-radius:99px;">🎧 Escuchar conversación</a>
        <!--[if mso]></center></v:roundrect><![endif]-->
      </td>
      <td style="padding:0 6px;">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{CTA_URL}}" style="height:46px;v-text-anchor:middle;width:210px;" arcsize="50%" fillcolor="#d4af37" stroke="f"><center><![endif]-->
        <a href="{{CTA_URL}}" style="display:inline-block;background:#d4af37;color:#1a1a1a;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:14px 24px;border-radius:99px;">🔁 Volver a entrenar</a>
        <!--[if mso]></center></v:roundrect><![endif]-->
      </td>
    </tr></table>
  </td></tr>

  <tr><td class="px" style="padding:30px 44px 38px 44px;border-top:1px solid #2c2c2c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:18px;color:#6a6a6a;letter-spacing:0.3px;">
        <span style="color:#d4af37;font-weight:600;letter-spacing:1px;">VÍCTOR</span> · Coach de IA del piso<br>Generado por <a href="https://victor-ia.com.mx" style="color:#8a8a8a;">Victor&nbsp;IA</a>
      </td>
      <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#4a4a4a;letter-spacing:0.5px;">Sesión {{CONV_ID}}</td>
    </tr></table>
  </td></tr>

</table>
<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#4a4a4a;letter-spacing:0.5px;padding:18px 0 0 0;">Este reporte es interno del equipo VTC.</div>

</td></tr></table>
</body>
</html>`;