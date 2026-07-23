// api/_naming.js — nombres de archivo dinamicos + zona horaria Cancun (UTC-5, sin horario de verano).
// Usado por api/report.js (PDF) y api/audio.js (MP3) para que el nombre de archivo entregado
// al asesor/gerente sea siempre: {nombre-slug}_{YYYYMMDD}_{HHMM}.ext  en hora de Cancun,
// sin importar en que zona horaria corre el servidor (Vercel corre en UTC).
'use strict';

const TZ = 'America/Cancun';

// Quita acentos/diacriticos: "López" -> "Lopez".
function stripDiacritics(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// "Carlos López" -> "carlos-lopez". Solo [a-z0-9-], sin espacios, sin duplicar guiones.
function slugName(name) {
  const base = stripDiacritics(name).toLowerCase().trim();
  const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'asesor';
}

// Devuelve {y,mo,d,h,mi} (strings, 2 digitos) de un Date (instante absoluto) en hora de Cancun.
function cancunParts(date) {
  const d = (date instanceof Date && !isNaN(date)) ? date : new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = {};
  fmt.formatToParts(d).forEach((p) => { parts[p.type] = p.value; });
  // Algunos motores ICU devuelven "24" para medianoche con hour12:false -> normalizar a "00".
  const hh = parts.hour === '24' ? '00' : parts.hour;
  return { y: parts.year, mo: parts.month, d: parts.day, h: hh, mi: parts.minute };
}

// "20260723" (fecha en Cancun).
function cancunYYYYMMDD(date) { const p = cancunParts(date); return `${p.y}${p.mo}${p.d}`; }
// "14:35" (hora en Cancun, para mostrar).
function cancunHHMM(date) { const p = cancunParts(date); return `${p.h}:${p.mi}`; }
// "1435" (hora en Cancun, compacta, para nombres de archivo).
function cancunHHMMCompact(date) { const p = cancunParts(date); return `${p.h}${p.mi}`; }
// "23 jul 2026" ya lo arma report.js con MESES[]; aqui solo exponemos las partes crudas.

// Base de nombre de archivo: {nombre-slug}_{YYYYMMDD}_{HHMM} (sin extension).
function buildFileBase(name, date) {
  return `${slugName(name)}_${cancunYYYYMMDD(date)}_${cancunHHMMCompact(date)}`;
}

// Sanitiza un nombre de archivo arbitrario que llegue por query/param externo (ej. n8n
// pasando ?name=carlos-lopez_20260723_1435): solo letras/numeros/guion/guion-bajo, sin
// puntos (evita path traversal / doble extension), longitud acotada.
function sanitizeFileBase(raw) {
  const s = String(raw == null ? '' : raw).replace(/\.[a-z0-9]+$/i, ''); // por si llega con extension
  const clean = s.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 120);
  return clean || '';
}

// Elige el nombre final: si viene ?name= valido lo usa (sanitizado), si no, genera el default.
function resolveFileBase(rawName, fallbackName, fallbackDate) {
  const fromParam = sanitizeFileBase(rawName);
  return fromParam || buildFileBase(fallbackName, fallbackDate);
}

module.exports = {
  TZ, slugName, cancunParts, cancunYYYYMMDD, cancunHHMM, cancunHHMMCompact,
  buildFileBase, sanitizeFileBase, resolveFileBase,
};