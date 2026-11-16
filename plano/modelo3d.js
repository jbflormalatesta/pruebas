/*
 * MODELO 3D DEL JARDÍN CON EL SOL REAL DE MARCOS PAZ (Three.js r128 + SunCalc)
 * ---------------------------------------------------------------------------
 * Se carga recién cuando se abre la pestaña «Modelo 3D y sol» del plano.
 * La escena se arma con el mismo relevamiento que dibuja el plano (los polígonos del SVG de la página):
 *   1 unidad del modelo = 1 metro · cada cuadrícula del plano = 2 × 2 m · el norte sale de datos/plano.js («norte»).
 * Lo que el relevamiento no trae (alturas, estanque, sombráculo y coordenadas del Jardín) está en datos/plano.js («modelo3d»).
 * Árboles: altura y copa de datos/arboles.js y del modo relevamiento de este navegador; el resto usa un porte representativo.
 * Nunca muestra la especie de un árbol, y las especies sensibles o amenazadas se dibujan con un porte genérico.
 * Sin WebGL queda una imagen fija y los datos del sol siguen funcionando. No guarda ni envía nada.
 */
window.Modelo3D = (function () {
  'use strict';
  var RAD = Math.PI / 180;
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var RUMBOS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  var COLOR = { verde: 0x456301, profundo: 0x33490A, claro: 0x9CBB32, naranja: 0xEC8004, salvia: 0xE1E5C8, crema: 0xF6F1E1, tinta: 0x2A331A,
    suave: 0x4A5530, cientifico: 0x5C7433, produccion: 0x7A9622, agua: 0x35707F, papel: 0xFFFDF6, linea: 0xCDD4AB, tierra: 0xE9DFC3, ripio: 0xC9BB93 };
  var PORTES = { 'árbol': 'arbol', 'arbol': 'arbol', 'arbusto': 'arbusto', 'palmera': 'palmera', 'conífera': 'conifera', 'conifera': 'conifera' };
  var COLS = 56, FILAS = 68, CENTRO = [28, 34], RADIO = 84;     // centro del predio (en cuadrículas) y radio de la bóveda (en metros)
  var HORIZONTE = -0.833;                                        // altura del centro del sol al salir y al ponerse (con la refracción)
  var VISTAS = {                                                 // cámara y punto al que mira: [x, y, altura] con x, y en cuadrículas del plano
    aerea: { c: [24, 136, 92], t: [28, 37, 19] },
    planta: { c: [28, 34.03, 258], t: [28, 34, 0] },
    ingreso: { c: [-8, 53.5, 10], t: [9, 44, 1] },
    plazoleta: { c: [11.5, 48.5, 5], t: [18.6, 40.6, 1.2] },
    talar: { c: [13, 34, 32], t: [29.5, 17.5, 2] },
    vivero: { c: [35.5, 82, 30], t: [35.5, 56.5, 0] },
    estanque: { c: [40.5, 40.5, 22], t: [40.5, 30.5, 0] }
  };

  var ctx = null, cfg = {}, SITIO = { lat: -34.80, lng: -58.85, utc: -3 }, NORTE = 45, ANIO = new Date().getUTCFullYear();
  var E = { mes: 3, hora: 13 }, capas = { arboles: true, boveda: true, etiquetas: true, recorrido: true };
  var dom = {}, iniciado = false, ok = false, visible = false, vistaActual = 'aerea', reloj = null;
  var geo = {}, arboles = [], reales = 0, versionArboles = 0, cacheDia = {}, prismas = [], muestras = null, censoSucio = false;
  var renderer, scene, camera, controls, sol, hemi, pendiente = false;
  var gArboles, gBoveda, gRuta, mTroncos, mCopas, mConos, arcoDia, bolaSol, rayoSol;
  var etiquetas = [], etqBoveda = [], etqRuta = [], todas = [], ruta = { tramos: [], paradas: [], nombre: '', partida: null };

  // ---------------------------------------------------------------- utilidades
  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function num(v, d) { return v.toFixed(d || 0).replace('.', ','); }
  function hhmm(h) { var a = Math.floor(h + 1e-9), b = Math.round((h - a) * 60); if (b === 60) { a++; b = 0; } return (a < 10 ? '0' : '') + a + ':' + (b < 10 ? '0' : '') + b; }
  function rumbo(az) { return RUMBOS[Math.round((((az % 360) + 360) % 360) / 22.5) % 16]; }
  function azar(i, canal) { var x = Math.sin(i * 127.1 + canal * 311.7) * 43758.5453; return x - Math.floor(x); }
  function area(p) { var a = 0; for (var i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return Math.abs(a / 2); }
  function dentro(q, p) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > q[1]) !== (p[j][1] > q[1]) && q[0] < (p[j][0] - p[i][0]) * (q[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    }
    return c;
  }
  function caja(p) {
    var b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    p.forEach(function (q) { b.x0 = Math.min(b.x0, q[0]); b.x1 = Math.max(b.x1, q[0]); b.y0 = Math.min(b.y0, q[1]); b.y1 = Math.max(b.y1, q[1]); });
    b.cx = (b.x0 + b.x1) / 2; b.cy = (b.y0 + b.y1) / 2;
    return b;
  }
  function px(col) { return col - 0.5; }                 // columna del relevamiento → x del plano
  function py(fila) { return FILAS + 0.5 - fila; }        // fila del relevamiento → y del plano
  function lugar(c) { var l = ctx.porCodigo[c]; return l && typeof l.col === 'number' && typeof l.fila === 'number' ? l : null; }

  // ---------------------------------------------------------------- el sol (SunCalc)
  function fecha(mes, hora, dia) { var h = Math.floor(hora), m = Math.round((hora - h) * 60); return new Date(Date.UTC(ANIO, mes - 1, dia || 21, h - SITIO.utc, m)); }
  function solEn(mes, hora, dia) {
    var p = window.SunCalc.getPosition(fecha(mes, hora, dia), SITIO.lat, SITIO.lng);
    return { alt: p.altitude / RAD, az: ((p.azimuth / RAD + 180) % 360 + 360) % 360 };       // acimut desde el norte, hacia el este
  }
  function horaOficial(d) { var x = new Date(d.getTime() + SITIO.utc * 3600e3); return x.getUTCHours() + x.getUTCMinutes() / 60 + x.getUTCSeconds() / 3600; }
  function horarios(mes) {
    var t = window.SunCalc.getTimes(fecha(mes, 12), SITIO.lat, SITIO.lng);
    return { sale: horaOficial(t.sunrise), pone: horaOficial(t.sunset), mediodia: horaOficial(t.solarNoon) };
  }
  // Hacia dónde está el sol, en los ejes del plano: x hacia la derecha (columnas), y hacia abajo (fila 1), z hacia arriba.
  // El norte del plano está girado NORTE grados en sentido horario respecto de «arriba».
  function vectorSol(alt, az) {
    var ch = Math.cos(alt * RAD), a = (az + NORTE) * RAD;
    return { x: ch * Math.sin(a), y: -ch * Math.cos(a), z: Math.sin(alt * RAD) };
  }

  // ---------------------------------------------------------------- geometría del relevamiento (sale del SVG del plano)
  function leerCapa(clase) {
    var p = ctx.svg.querySelector('path.' + clase);
    if (!p) return [];
    return (p.getAttribute('d') || '').split('M').map(function (s) {
      return s.replace(/Z/g, '').trim().split(/\s+/).filter(Boolean).map(function (q) { var c = q.split(','); return [+c[0], +c[1]]; });
    }).filter(function (pts) { return pts.length > 2; });
  }
  // Agrupa los contornos de una capa: los que quedan adentro de otro son huecos (claros, patios)
  function agrupar(polis) {
    var d = polis.map(function (pts) { return { pts: pts, a: area(pts), huecos: [], prof: 0, padre: null }; });
    d.forEach(function (u, i) {
      d.forEach(function (o, j) {
        if (i === j || o.a <= u.a || !dentro(u.pts[0], o.pts)) return;
        u.prof++;
        if (!u.padre || o.a < u.padre.a) u.padre = o;
      });
    });
    d.forEach(function (u) { if (u.prof % 2 === 1 && u.padre) u.padre.huecos.push(u.pts); });
    return d.filter(function (u) { return u.prof % 2 === 0; });
  }
  function rectDe(sel, def) {
    var r = ctx.svg.querySelector(sel);
    if (!r) return def;
    return { x0: +r.getAttribute('x'), y0: +r.getAttribute('y'), x1: +r.getAttribute('x') + +r.getAttribute('width'), y1: +r.getAttribute('y') + +r.getAttribute('height') };
  }
  function leerGeometria() {
    var A = cfg.alturas || {}, s03 = lugar('S-03'), est = cfg.estanque, som = cfg.sombraculo;
    geo.predio = leerCapa('predio');
    geo.veg = agrupar(leerCapa('veg'));
    geo.huerta = null;
    if (s03) geo.veg = geo.veg.filter(function (v) { if (!geo.huerta && dentro([px(s03.col), py(s03.fila)], v.pts)) { geo.huerta = v; return false; } return true; });
    geo.casas = agrupar(leerCapa('casa')).sort(function (a, b) { return b.a - a.a; });
    geo.inv = agrupar(leerCapa('inv')).sort(function (a, b) { return b.a - a.a; });
    geo.comp = agrupar(leerCapa('comp'));
    geo.asientos = agrupar(leerCapa('asiento'));
    geo.estr = agrupar(leerCapa('estr'));
    geo.sombraculo = null;
    if (som && typeof som.col === 'number') geo.estr = geo.estr.filter(function (e) { if (!geo.sombraculo && dentro([px(som.col), py(som.fila)], e.pts)) { geo.sombraculo = e; return false; } return true; });
    geo.estanque = est && typeof est.col === 'number' ? { x: px(est.col), y: py(est.fila), rx: (est.largo || 6) / 4, ry: (est.ancho || 3) / 4, giro: (est.giro || 0) * RAD } : null;
    geo.edificio = rectDe('#entorno .edificio', { x0: -11.8, y0: 35, x1: -4.6, y1: 46 });
    geo.alto = { edificio: A.edificioPrincipal || 3.6, casas: [A.edificacionGrande || 4.5, A.edificacionChica || 3], inv: [A.invernaderoGrande || 3, A.invernaderoChico || 2.6], sombraculo: A.sombraculo || 2.4 };
    geo.arboles = Array.prototype.map.call(ctx.svg.querySelectorAll('#arboles circle'), function (c) { return { id: c.id, x: +c.getAttribute('cx'), y: +c.getAttribute('cy') }; });
    // Lo que tapa el sol en las lecturas: construcciones (en metros) y, más abajo, los árboles
    prismas = [];
    geo.casas.forEach(function (c, i) { prismas.push({ pts: c.pts.map(function (q) { return [q[0] * 2, q[1] * 2]; }), h: geo.alto.casas[Math.min(i, 1)] }); });
    var e = geo.edificio;
    prismas.push({ pts: [[e.x0 * 2, e.y0 * 2], [e.x1 * 2, e.y0 * 2], [e.x1 * 2, e.y1 * 2], [e.x0 * 2, e.y1 * 2]], h: geo.alto.edificio });
  }

  // ---------------------------------------------------------------- árboles: medidas reales o porte representativo
  function censo() {
    var out = {}, k, f, pub = window.ARBOLES && (window.ARBOLES.arboles || window.ARBOLES), loc = null;
    if (pub && typeof pub === 'object') for (k in pub) if (/^ar\d{3}$/.test(k) && pub[k] && typeof pub[k] === 'object') { out[k] = {}; for (f in pub[k]) out[k][f] = pub[k][f]; }
    try { loc = JSON.parse(localStorage.getItem('jbplano:relevamiento') || 'null'); } catch (err) { loc = null; }
    if (loc && loc.arboles && typeof loc.arboles === 'object') for (k in loc.arboles) if (/^ar\d{3}$/.test(k) && loc.arboles[k]) { out[k] = out[k] || {}; for (f in loc.arboles[k]) out[k][f] = loc.arboles[k][f]; }
    return out;
  }
  function prepararArboles() {
    arboles = geo.arboles.map(function (a) { return { id: a.id, x: a.x, y: a.y, X: a.x * 2, Z: a.y * 2 }; });
    arboles.forEach(function (a, i) {
      var d1 = Infinity, d2 = Infinity;                              // distancia a los dos vecinos más cercanos (m)
      arboles.forEach(function (b, j) {
        if (i === j) return;
        var d = Math.sqrt((a.X - b.X) * (a.X - b.X) + (a.Z - b.Z) * (a.Z - b.Z));
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      });
      var vecinos = (d1 + d2) / 2;
      a.copa0 = clamp(0.75 * vecinos + 1.2, 2.6, 7.5) * (0.85 + 0.3 * azar(i, 1));        // copas más chicas donde están más juntos
      a.h0 = clamp(2.6 + 0.85 * a.copa0 + (azar(i, 2) - 0.4) * 2.2, 3.2, 12);
      a.ft = 0.28 + 0.14 * azar(i, 3);                                                   // parte de la altura que es tronco
      a.giro = azar(i, 4) * Math.PI * 2;
      a.tono = azar(i, 5);
    });
  }
  function medirArboles() {
    var C = censo(), esp = {}, falta = false;
    (window.ESPECIES || []).forEach(function (e) { esp[e.codigo] = e; });
    reales = 0;
    arboles.forEach(function (a) {
      var r = C[a.id] || {}, h = +r.altura > 0 ? +r.altura : 0, c = +r.copa > 0 ? +r.copa : 0, porte = PORTES[String(r.porte || '').toLowerCase()] || 'arbol';
      if (!r.porte && /^A-\d\d$/.test(r.especie || '') && ctx.reservadas.indexOf(r.especie) < 0) {
        if (esp[r.especie]) porte = PORTES[esp[r.especie].porte] || 'arbol'; else if (!window.ESPECIES) falta = true;
      }
      a.real = !!(h || c);
      if (a.real) reales++;
      if (!h && !c) { h = a.h0; c = a.copa0; }
      else if (!c) c = (porte === 'palmera' ? 0.35 : porte === 'conifera' ? 0.4 : porte === 'arbusto' ? 1.1 : 0.65) * h;
      else if (!h) h = porte === 'arbusto' ? 0.9 * c : 2.2 + 0.95 * c;
      h = clamp(h, 0.8, 45); c = clamp(c, 0.6, 30);
      a.h = h; a.copa = c; a.porte = porte; a.rh = c / 2;
      a.tronco = porte === 'arbusto' ? 0.12 * h : porte === 'palmera' ? Math.max(h - 0.3 * c, 0.35 * h) : porte === 'conifera' ? 0.14 * h : h * a.ft;
      a.radio = +r.dap > 0 ? clamp(r.dap / 200, 0.04, 1.2) : clamp(0.035 * h, 0.07, 0.4);
      a.rv = (h - a.tronco) / 2;
      a.yc = a.tronco + a.rv;
    });
    versionArboles++; cacheDia = {};
    if (falta && ctx.conEspecies) ctx.conEspecies(function () { if (window.ESPECIES) { medirArboles(); pintarArboles(); refrescar(); } });
  }

  // ---------------------------------------------------------------- lecturas de asoleamiento (sin WebGL: geometría pura)
  // ¿Algo tapa el sol visto desde el punto (X, Y, Z) en metros (Y = altura)? s = vector hacia el sol, en los mismos ejes.
  function tapado(X, Y, Z, s) {
    var i, a, rh, ox, oy, oz, dx, dy, dz, A, B, C, k, p, n, j, ex, ez, den, t, u;
    for (i = 0; i < arboles.length; i++) {
      a = arboles[i]; rh = a.porte === 'conifera' ? a.rh * 0.7 : a.rh;
      ox = (X - a.X) / rh; oy = (Y - a.yc) / a.rv; oz = (Z - a.Z) / rh;
      dx = s.x / rh; dy = s.y / a.rv; dz = s.z / rh;
      C = ox * ox + oy * oy + oz * oz - 1;
      if (C < 0) return true;
      B = 2 * (ox * dx + oy * dy + oz * dz);
      if (B >= 0) continue;
      A = dx * dx + dy * dy + dz * dz;
      if (B * B - 4 * A * C >= 0) return true;
    }
    for (k = 0; k < prismas.length; k++) {
      p = prismas[k].pts; n = p.length;
      for (i = 0, j = n - 1; i < n; j = i++) {
        ex = p[i][0] - p[j][0]; ez = p[i][1] - p[j][1];
        den = s.x * ez - s.z * ex;
        if (Math.abs(den) < 1e-9) continue;
        t = ((p[j][0] - X) * ez - (p[j][1] - Z) * ex) / den;
        if (t <= 0) continue;
        u = ((p[j][0] - X) * s.z - (p[j][1] - Z) * s.x) / den;
        if (u >= 0 && u <= 1 && Y + t * s.y < prismas[k].h) return true;
      }
    }
    return false;
  }
  function grilla(b, nx, ny, margen, alto) {
    var out = [], i, j;
    for (i = 0; i < nx; i++) for (j = 0; j < ny; j++) {
      out.push([(b.x0 + (b.x1 - b.x0) * (margen + (1 - 2 * margen) * (nx > 1 ? i / (nx - 1) : 0.5))) * 2, alto,
        (b.y0 + (b.y1 - b.y0) * (margen + (1 - 2 * margen) * (ny > 1 ? j / (ny - 1) : 0.5))) * 2]);
    }
    return out;
  }
  function armarMuestras() {
    var m = { huerta: [], inv: [], bancos: [], plazoleta: [] }, mayor = null;
    if (geo.huerta) m.huerta = grilla(caja(geo.huerta.pts), 5, 3, 0.1, 0.4);
    geo.inv.forEach(function (v) { var b = caja(v.pts), largoX = (b.x1 - b.x0) > (b.y1 - b.y0); m.inv.push(grilla(b, largoX ? 4 : 2, largoX ? 2 : 4, 0.18, 2.2)); });
    geo.asientos.forEach(function (s) {
      var b = caja(s.pts);
      m.bancos.push([b.cx * 2, 0.6, b.cy * 2]);
      if (!mayor || s.a > mayor.a) mayor = s;
    });
    if (mayor && mayor.a > 4) m.plazoleta = grilla(caja(mayor.pts), 3, 2, 0.1, 0.6);
    muestras = m;
  }
  function alSol(pts, s) { var n = 0; pts.forEach(function (p) { if (!tapado(p[0], p[1], p[2], s)) n++; }); return n; }
  // Horas de sol directo del día (pasos de 10 minutos entre la salida y la puesta)
  function asoleamientoDia(mes) {
    var c = cacheDia[mes];
    if (c && c.v === versionArboles) return c;
    var t = horarios(mes), paso = 1 / 6, h, p, v, s, r = { v: versionArboles, huerta: 0, inv: muestras.inv.map(function () { return 0; }) };
    for (h = t.sale + paso / 2; h < t.pone; h += paso) {
      p = solEn(mes, h);
      if (p.alt < 1) continue;
      v = vectorSol(p.alt, p.az); s = { x: v.x, y: v.z, z: v.y };
      r.huerta += alSol(muestras.huerta, s);
      muestras.inv.forEach(function (pts, i) { r.inv[i] += alSol(pts, s); });
    }
    r.huerta = muestras.huerta.length ? r.huerta * paso / muestras.huerta.length : null;
    r.inv = r.inv.map(function (x, i) { return muestras.inv[i].length ? x * paso / muestras.inv[i].length : null; });
    cacheDia[mes] = r;
    return r;
  }
  function asoleamientoAhora(p) {
    if (p.alt < 1) return null;
    var v = vectorSol(p.alt, p.az), s = { x: v.x, y: v.z, z: v.y }, f = function (pts) { return pts.length ? alSol(pts, s) / pts.length : null; };
    return { huerta: f(muestras.huerta), inv: muestras.inv.map(f), bancosSombra: muestras.bancos.length - alSol(muestras.bancos, s), bancos: muestras.bancos.length, plazoleta: f(muestras.plazoleta) };
  }
  function estadoSol(f) { return f === null ? '' : f >= 0.7 ? 'al sol' : f <= 0.3 ? 'a la sombra' : 'a media sombra'; }
  function horasTexto(h) { if (h === null) return 'sin dato'; var r = Math.round(h * 2) / 2; return r < 0.5 ? 'casi nada de sol directo' : 'unas ' + num(r, r % 1 ? 1 : 0) + ' h de sol directo'; }

  // ---------------------------------------------------------------- lecturas en pantalla
  function leer() {
    var p = solEn(E.mes, E.hora), t = horarios(E.mes), arriba = p.alt > HORIZONTE, dur = t.pone - t.sale;
    var titulo = '21 de ' + MESES[E.mes - 1] + ' · <b>' + hhmm(E.hora) + ' h</b>';
    var txtSol = arriba ? num(Math.max(p.alt, 0)) + '° de altura · acimut ' + num(p.az) + '° (' + rumbo(p.az) + ')'
      : (E.hora < t.mediodia ? 'Bajo el horizonte: sale a las ' + hhmm(t.sale) : 'Bajo el horizonte: se puso a las ' + hhmm(t.pone));
    dom.hud.innerHTML = titulo + '<br>' + (arriba ? 'Sol a ' + num(Math.max(p.alt, 0)) + '° de altura · acimut ' + num(p.az) + '° (' + rumbo(p.az) + ')' : txtSol);
    dom.rdSol.textContent = txtSol;
    dom.rdHoras.textContent = 'Sale ' + hhmm(t.sale) + ' · se pone ' + hhmm(t.pone) + ' · ' + Math.floor(dur) + ' h ' + Math.round((dur - Math.floor(dur)) * 60) + ' min de sol · mediodía solar ' + hhmm(t.mediodia);
    dom.rdPoste.textContent = p.alt > 0.6 ? num(Math.min(1 / Math.tan(p.alt * RAD), 99), 2) + ' m, hacia el ' + rumbo(p.az + 180) : 'Sin sombra: el sol está bajo el horizonte';
    var dia = asoleamientoDia(E.mes), ya = asoleamientoAhora(p), sinSol = 'Ahora: sin sol.';
    dom.rdHuerta.textContent = muestras.huerta.length ? cap(horasTexto(dia.huerta)) + ' en el día. ' + (ya ? 'Ahora: ' + estadoSol(ya.huerta) + '.' : sinSol) : 'Sin dato.';
    var nombres = ['Grande', 'chico'];
    dom.rdInv.textContent = dia.inv.length ? dia.inv.map(function (h, i) { return (nombres[i] || 'otro') + ': ' + horasTexto(h).replace(' de sol directo', ''); }).join(' · ') + ' de sol directo. ' +
      (ya ? 'Ahora: ' + ya.inv.map(function (f, i) { return (i ? 'el chico, ' : 'el grande, ') + estadoSol(f); }).join('; ') + '.' : sinSol) : 'Sin dato.';
    dom.rdBancos.textContent = ya ? 'Ahora, ' + ya.bancosSombra + ' de ' + ya.bancos + ' a la sombra.' + (ya.plazoleta !== null ? ' La plazoleta: ' + estadoSol(ya.plazoleta) + '.' : '') : 'Sin sol a esta hora.';
    dom.mesTxt.textContent = MESES[E.mes - 1];
    dom.horaTxt.textContent = hhmm(E.hora) + ' h';
    dom.mes.value = E.mes; dom.hora.value = E.hora;
    dom.mes.setAttribute('aria-valuetext', '21 de ' + MESES[E.mes - 1]);
    dom.hora.setAttribute('aria-valuetext', hhmm(E.hora) + ' horas');
    Array.prototype.forEach.call(dom.fechas.querySelectorAll('[data-m]'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-m') === E.mes ? 'true' : 'false'); });
    if (dom.notaArboles) {
      dom.notaArboles.textContent = 'Las horas de sol y las sombras son estimadas. ' + (reales ? reales + ' de ' + arboles.length + ' árboles tienen altura o copa medidas en el relevamiento; el resto usa'
        : 'Todavía ningún árbol tiene altura o copa medidas en el relevamiento: todos usan') + ' un porte representativo. La sombra real cambia con cada especie y con la época: los de hoja caduca dan menos sombra en invierno.';
    }
    return p;
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  // ---------------------------------------------------------------- escena 3D
  function V(x, y, h) { return new THREE.Vector3(x * 2, h || 0, y * 2); }
  function dirSol(alt, az) { var v = vectorSol(alt, az); return new THREE.Vector3(v.x, v.z, v.y); }
  var mats = {};
  function mat(nombre, color, extra) {
    if (mats[nombre]) return mats[nombre];
    var o = { color: color }, k;
    for (k in (extra || {})) o[k] = extra[k];
    return (mats[nombre] = new THREE.MeshLambertMaterial(o));
  }
  function malla(g, m, proyecta, recibe, padre) { var o = new THREE.Mesh(g, m); o.castShadow = !!proyecta; o.receiveShadow = recibe !== false; (padre || scene).add(o); return o; }
  function forma(pts, huecos) {
    var s = new THREE.Shape(pts.map(function (p) { return new THREE.Vector2(p[0] * 2, -p[1] * 2); }));
    (huecos || []).forEach(function (h) { s.holes.push(new THREE.Path(h.map(function (p) { return new THREE.Vector2(p[0] * 2, -p[1] * 2); }))); });
    return s;
  }
  // Polígonos del plano levantados entre dos alturas (o planos, si casi no hay diferencia)
  function prisma(lista, y0, y1, m, proyecta, padre) {
    if (!lista.length) return null;
    var formas = lista.map(function (u) { return forma(u.pts, u.huecos); });
    var g = y1 - y0 < 0.011 ? new THREE.ShapeGeometry(formas) : new THREE.ExtrudeGeometry(formas, { depth: y1 - y0, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
    return malla(g, m, proyecta, true, padre);
  }
  function losa(x0, y0, x1, y1, h, m) {
    var g = new THREE.PlaneGeometry((x1 - x0) * 2, (y1 - y0) * 2);
    g.rotateX(-Math.PI / 2);
    var o = malla(g, m, false, true);
    o.position.set((x0 + x1), h, (y0 + y1));
    return o;
  }
  function bloque(x, y, ancho, alto, fondo, base, m, giro, proyecta, padre) {
    var o = malla(new THREE.BoxGeometry(ancho, alto, fondo), m, proyecta !== false, true, padre);
    o.position.set(x * 2, base + alto / 2, y * 2);
    if (giro) o.rotation.y = giro;
    return o;
  }
  // cerca: solo se ve si la cámara está a menos de esos metros · lejos: solo en las vistas generales (cámara a más de esos metros del centro)
  function etiqueta(texto, x, y, h, clase, prio, cerca, corto, lejos) { etiquetas.push({ t: texto, p: V(x, y, h), c: clase || '', prio: prio || 5, cerca: cerca || 0, corto: corto || '', lejos: lejos || 0 }); }

  function armarEntorno() {
    var ruta40 = rectDe('#entorno .ruta', { x0: -16, y0: -12.6, x1: 64, y1: -5.8 }), bosch = rectDe('#entorno .calle', { x0: 57.2, y0: -12.6, x1: 60.8, y1: 71.8 });
    var interna = rectDe('#entorno .interna', { x0: -4, y0: -5.8, x1: -0.6, y1: 71.8 }), vereda = rectDe('#entorno .vereda', { x0: -16, y0: -4.9, x1: 57.2, y1: -0.4 });
    var cemento = rectDe('#entorno .cemento', { x0: -16, y0: -5.8, x1: 57.2, y1: -4.9 }), e = geo.edificio;
    var base = malla(new THREE.PlaneGeometry(4200, 4200), mat('campo', 0xDDDDBD), false, true);
    base.rotation.x = -Math.PI / 2; base.position.set(CENTRO[0] * 2, -0.08, CENTRO[1] * 2);
    losa(-900, ruta40.y0, 900, ruta40.y1, -0.03, mat('ruta', COLOR.suave));
    losa(bosch.x0, ruta40.y1, bosch.x1, 600, -0.04, mat('calle', COLOR.salvia));
    losa(interna.x0, cemento.y0, interna.x1, 150, -0.04, mat('interna', 0xDDCFA6));
    losa(-900, vereda.y0, bosch.x0, vereda.y1, -0.05, mat('vereda', COLOR.crema));
    losa(-900, cemento.y0, bosch.x0, cemento.y1, -0.02, mat('cemento', COLOR.papel));
    var eje = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-900, (ruta40.y0 + ruta40.y1) / 2, 0.02), V(900, (ruta40.y0 + ruta40.y1) / 2, 0.02)]),
      new THREE.LineDashedMaterial({ color: COLOR.crema, dashSize: 3.2, gapSize: 2.4 }));
    eje.computeLineDistances(); scene.add(eje);
    // plantas jóvenes de la vereda forestada (las del plano)
    var pl = ctx.svg.querySelectorAll('#entorno .plantas circle');
    if (pl.length) {
      var im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat('vereda-planta', COLOR.claro), pl.length), m4 = new THREE.Matrix4();
      Array.prototype.forEach.call(pl, function (c, i) {
        var r = 0.5 + 0.25 * azar(i, 7);
        m4.compose(V(+c.getAttribute('cx'), +c.getAttribute('cy'), r * 0.8), new THREE.Quaternion(), new THREE.Vector3(r, r * 0.9, r));
        im.setMatrixAt(i, m4);
      });
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
    }
    // edificio principal (afuera del alambrado, aproximado como en el plano)
    bloque((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, (e.x1 - e.x0) * 2, geo.alto.edificio, (e.y1 - e.y0) * 2, 0, mat('edificio', COLOR.suave));
    bloque((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, (e.x1 - e.x0) * 2 + 0.6, 0.18, (e.y1 - e.y0) * 2 + 0.6, geo.alto.edificio, mat('techo', 0x3A4326));
    etiqueta('Edificio principal · oficina, aula y baños', (e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2, geo.alto.edificio + 2.2, 'obj', 2);
    etiqueta('Ruta Provincial 40', 24, (ruta40.y0 + ruta40.y1) / 2, 0.5, 'via', 3, 0, '', 120);
    etiqueta('Calle Gral. Bosch', (bosch.x0 + bosch.x1) / 2, 34, 0.5, 'via', 3, 0, '', 120);
    etiqueta('Calle interna', (interna.x0 + interna.x1) / 2, 60, 0.5, 'via', 4, 0, '', 120);
  }

  function armarPredio() {
    var s;
    prisma(geo.predio.map(function (p) { return { pts: p, huecos: [] }; }), 0, 0, mat('suelo', COLOR.crema), false);
    prisma(geo.veg, 0, 0.12, mat('veg', 0xC7D0A2), false);
    if (geo.huerta) {                                              // huerta: tierra trabajada y canteros
      var b = caja(geo.huerta.pts);
      losa(b.x0 - 0.15, b.y0 - 0.15, b.x1 + 0.15, b.y1 + 0.15, 0.02, mat('huerta-suelo', 0xD3C296));
      prisma([geo.huerta], 0.02, 0.32, mat('huerta', 0x8FAA3C), true);
    }
    if (geo.estanque) {                                            // espejo de agua (aproximado: no figura en el relevamiento)
      var q = geo.estanque, orilla = new THREE.Shape(new THREE.EllipseCurve(0, 0, q.rx * 2 + 0.45, q.ry * 2 + 0.45, 0, Math.PI * 2, false, 0).getPoints(40));
      var agua = new THREE.Shape(new THREE.EllipseCurve(0, 0, q.rx * 2, q.ry * 2, 0, Math.PI * 2, false, 0).getPoints(40));
      [[orilla, 0.03, mat('orilla', 0x8C9A6B)], [agua, 0.05, new THREE.MeshPhongMaterial({ color: COLOR.agua, shininess: 90, specular: 0x9FC4C8 })]].forEach(function (o) {
        var g = new THREE.ShapeGeometry(o[0]); g.rotateX(-Math.PI / 2);
        var m = malla(g, o[2], false, true); m.position.set(q.x * 2, o[1], q.y * 2); m.rotation.y = -q.giro;
      });
    }
    geo.casas.forEach(function (c, i) { prisma([c], 0, geo.alto.casas[Math.min(i, 1)], mat('casa', COLOR.suave), true); });
    prisma(geo.comp, 0, 0.8, mat('comp', 0x9DAE62), true);
    prisma(geo.asientos, 0, 0.45, mat('asiento', COLOR.naranja), true);
    prisma(geo.estr, 0, 0.35, mat('estr', 0xB5A77E), true);
    // invernaderos: túneles sobre la planta relevada (no proyectan sombra: el nailon deja pasar la luz)
    geo.inv.forEach(function (v, i) {
      var c = caja(v.pts), largoX = (c.x1 - c.x0) >= (c.y1 - c.y0), L = (largoX ? c.x1 - c.x0 : c.y1 - c.y0) * 2, W = (largoX ? c.y1 - c.y0 : c.x1 - c.x0) * 2, H = geo.alto.inv[Math.min(i, 1)];
      var g = new THREE.CylinderGeometry(1, 1, 1, 18, 1, false, 0, Math.PI);
      g.rotateZ(Math.PI / 2);                                       // eje acostado; la media caña queda hacia arriba
      var t = malla(g, mat('inv', 0xEDF1DC, { transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false }), false, true);
      t.scale.set(L, H, W / 2); t.position.set(c.cx * 2, 0.02, c.cy * 2);
      if (!largoX) t.rotation.y = Math.PI / 2;
      prisma([v], 0, 0.04, mat('inv-piso', 0xD9DFBF), false);
      var arcos = [], n = Math.max(3, Math.round(L / 2.4)), k, a, u;
      for (k = 0; k <= n; k++) for (a = 0; a < 12; a++) {
        [a, a + 1].forEach(function (q) { u = q / 12 * Math.PI; var lado = -Math.cos(u) * W / 2, alto = Math.sin(u) * H + 0.03, lon = -L / 2 + k * L / n; arcos.push(largoX ? new THREE.Vector3(c.cx * 2 + lon, alto, c.cy * 2 + lado) : new THREE.Vector3(c.cx * 2 + lado, alto, c.cy * 2 + lon)); });
      }
      scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(arcos), new THREE.LineBasicMaterial({ color: COLOR.produccion })));
    });
    if (geo.sombraculo) {                                          // sombráculo: postes y media sombra
      s = caja(geo.sombraculo.pts);
      var hs = geo.alto.sombraculo;
      [[s.x0, s.y0], [s.x1, s.y0], [s.x0, s.y1], [s.x1, s.y1], [s.x0, s.cy], [s.x1, s.cy]].forEach(function (p) { bloque(p[0], p[1], 0.1, hs, 0.1, 0, mat('poste', COLOR.suave), 0, false); });
      bloque(s.cx, s.cy, (s.x1 - s.x0) * 2 + 0.3, 0.06, (s.y1 - s.y0) * 2 + 0.3, hs, mat('media-sombra', COLOR.tinta, { transparent: true, opacity: 0.55, depthWrite: false }), 0, true);
      etiqueta('Sombráculo', s.cx, s.cy, hs + 1.6, 'obj', 5, 170);
    }
    // alambrado y puertas
    var linea = [], postes = [], borde = geo.predio[0] || [];
    borde.forEach(function (p, i) {
      var q = borde[(i + 1) % borde.length], d = Math.sqrt(Math.pow(q[0] - p[0], 2) + Math.pow(q[1] - p[1], 2)) * 2, n = Math.max(1, Math.round(d / 3)), k, x, y;
      linea.push(V(p[0], p[1], 1.5), V(q[0], q[1], 1.5), V(p[0], p[1], 0.8), V(q[0], q[1], 0.8));
      for (k = 0; k < n; k++) { x = p[0] + (q[0] - p[0]) * k / n; y = p[1] + (q[1] - p[1]) * k / n; postes.push(V(x, y, 0), V(x, y, 1.6)); }
    });
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linea.concat(postes)), new THREE.LineBasicMaterial({ color: COLOR.profundo, transparent: true, opacity: 0.5 })));
    ['porton-1', 'puerta', 'porton-2', 'bosch'].forEach(function (c) {
      var l = lugar(c); if (!l) return;
      var x = px(l.col), y = py(l.fila), medio = c === 'puerta' ? 0.5 : 1.1, m = mat('porton', COLOR.tinta);
      bloque(x, y - medio, 0.14, 2.1, 0.14, 0, m, 0, false); bloque(x, y + medio, 0.14, 2.1, 0.14, 0, m, 0, false); bloque(x, y, 0.14, 0.12, medio * 4 + 0.14, 2.1, m, 0, false);
    });
  }

  // Carteles a escala real: placa sobre postes. giro en grados (0 = mira hacia la Ruta 40; 90 = mira hacia la calle interna)
  function cartel(codigo, ancho, alto, centro, giro, texto, prio) {
    var l = lugar(codigo); if (!l) return;
    var x = px(l.col), y = py(l.fila), g = new THREE.Group(), pr = !!l.proyectado;
    var mp = pr ? mat('placa-pro', COLOR.verde, { transparent: true, opacity: 0.45 }) : mat('placa', COLOR.verde), mo = pr ? mat('poste-pro', COLOR.suave, { transparent: true, opacity: 0.45 }) : mat('poste', COLOR.suave);
    var placa = malla(new THREE.BoxGeometry(ancho, alto, 0.05), mp, !pr, true, g); placa.position.y = centro;
    var cara = malla(new THREE.BoxGeometry(ancho - 0.1, alto - 0.1, 0.06), pr ? mat('cara-pro', COLOR.crema, { transparent: true, opacity: 0.5 }) : mat('cara', COLOR.crema), false, true, g); cara.position.y = centro;
    (ancho > 0.9 ? [-ancho / 2 + 0.08, ancho / 2 - 0.08] : [0]).forEach(function (dx) {
      var p = malla(new THREE.BoxGeometry(0.07, centro + alto / 2, 0.07), mo, !pr, true, g); p.position.set(dx, (centro + alto / 2) / 2, -0.06);
    });
    g.position.set(x * 2, 0, y * 2); g.rotation.y = giro * RAD; scene.add(g);
    etiqueta(texto, x, y, centro + alto / 2 + 1.1, pr ? 'pro' : 'car', prio || 4, prio === 6 ? 70 : 130);
  }
  function armarCarteleria() {
    cartel('A1', 1.2, 0.8, 1.5, 0, 'A1', 4);
    cartel('cartel-plano', 1.2, 0.8, 1.5, 90, 'A2', 4);
    cartel('T-01', 0.6, 0.7, 1.55, 90, 'T-01', 4);
    cartel('T-02', 0.6, 0.7, 1.55, 90, 'T-02', 4);
    cartel('L-01', 0.6, 0.13, 1.5, 90, 'Lamas', 6);
    cartel('L-02', 0.6, 0.13, 1.5, 90, 'Lamas', 6);
    cartel('P-01', 0.7, 0.5, 1.15, 180, 'P-01 · proyectado', 4);
    cartel('P-02', 0.7, 0.5, 1.15, 90, 'P-02 · proyectado', 4);
    ctx.lugares.forEach(function (l) {
      if (typeof l.col !== 'number') return;
      if (l.tipo === 'sector') etiqueta(parseInt(l.codigo.slice(2), 10) + ' · ' + l.nombre, px(l.col), py(l.fila), l.codigo === 'S-01' ? 11 : 6.5, 'sec', 1, 0, String(parseInt(l.codigo.slice(2), 10)));
      else if (l.tipo === 'referencia') etiqueta((l.letra ? l.letra + ' · ' : '') + l.nombre.replace(/ \(.*\)$/, ''), px(l.col), py(l.fila), 4, 'obj', 5, 150);
      else if (l.codigo === 'ingreso') etiqueta('Ingreso principal', px(l.col), py(l.fila) - 1.2, 3, 'obj', 3, 0, '', 120);
      else if (l.codigo === 'parada') etiqueta('Parada 322 y 136', px(l.col), py(l.fila), 3, 'obj', 4, 0, '', 120);
    });
    var mayor = null;
    geo.asientos.forEach(function (s) { if (!mayor || s.a > mayor.a) mayor = s; });
    if (mayor && mayor.a > 4) { var b = caja(mayor.pts); etiqueta('Plazoleta', b.cx, b.cy, 2.6, 'obj', 3, 200); }
  }

  // Árboles: tres mallas con instancias (troncos, copas redondeadas y conos para las coníferas)
  function armarArboles() {
    gArboles = new THREE.Group(); scene.add(gArboles);
    var n = arboles.length, gt = new THREE.CylinderGeometry(0.8, 1.15, 1, 7); gt.translate(0, 0.5, 0);
    var gc = new THREE.ConeGeometry(1, 1, 10); gc.translate(0, 0.5, 0);
    mTroncos = new THREE.InstancedMesh(gt, mat('tronco', 0x7A6C4E), n);
    mCopas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat('copa', 0xFFFFFF), n);
    mConos = new THREE.InstancedMesh(gc, mat('cono', 0xFFFFFF), n);
    [mTroncos, mCopas, mConos].forEach(function (m) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; gArboles.add(m); });
    pintarArboles();
  }
  function pintarArboles() {
    if (!mCopas) return;
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eje = new THREE.Vector3(0, 1, 0), nada = new THREE.Vector3(0, 0, 0), c = new THREE.Color(), base = new THREE.Color(0x6E8C3D), claro = new THREE.Color(0x8FAB4C), oscuro = new THREE.Color(0x56712F);
    arboles.forEach(function (a, i) {
      q.setFromAxisAngle(eje, a.giro);
      m4.compose(new THREE.Vector3(a.X, 0, a.Z), q, new THREE.Vector3(a.radio, a.tronco + (a.porte === 'conifera' ? 0 : a.rv * 0.5), a.radio)); mTroncos.setMatrixAt(i, m4);
      var cono = a.porte === 'conifera', achate = 0.9 + 0.2 * azar(i, 6);
      m4.compose(new THREE.Vector3(a.X, a.yc, a.Z), q, cono ? nada : new THREE.Vector3(a.rh * achate, a.rv, a.rh / achate)); mCopas.setMatrixAt(i, m4);
      m4.compose(new THREE.Vector3(a.X, a.tronco, a.Z), q, cono ? new THREE.Vector3(a.rh, a.h - a.tronco, a.rh) : nada); mConos.setMatrixAt(i, m4);
      c.copy(base).lerp(a.tono < 0.5 ? oscuro : claro, Math.abs(a.tono - 0.5) * 1.1);
      mCopas.setColorAt(i, c); mConos.setColorAt(i, c);
    });
    [mTroncos, mCopas, mConos].forEach(function (m) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    gArboles.visible = capas.arboles;
  }

  // Bóveda solar: horizonte con rumbos, arcos de solsticios y equinoccios, analemas de cada hora y el sol del momento
  function armarBoveda() {
    gBoveda = new THREE.Group(); gBoveda.position.copy(V(CENTRO[0], CENTRO[1], 0)); scene.add(gBoveda); etqBoveda = [];
    var O = gBoveda.position;
    function linea(pts, color, op) { var l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: color, transparent: op < 1, opacity: op })); gBoveda.add(l); return l; }
    function rb(b, r, h) { return dirSol(0, b).multiplyScalar(r).setY(h); }
    var aro = [], i, b, h;
    for (i = 0; i <= 144; i++) aro.push(rb(i * 2.5, RADIO, 0.3));
    linea(aro, COLOR.suave, 0.85);
    for (b = 0; b < 360; b += 15) linea([rb(b, RADIO, 0.3), rb(b, RADIO + (b % 90 ? 1.6 : 4), 0.3)], COLOR.suave, 0.85);
    [['N', 0], ['E', 90], ['S', 180], ['O', 270]].forEach(function (r) { etqBoveda.push({ t: r[0], p: rb(r[1], RADIO + 8, 1.2).add(O), c: 'dom', prio: 2, cerca: 0, lejos: 130 }); });
    [[12, COLOR.naranja, '21 dic'], [3, COLOR.verde, '21 mar · 21 sep'], [6, COLOR.agua, '21 jun']].forEach(function (a) {
      var t = horarios(a[0]), pts = [], s, p;
      for (h = t.sale; h <= t.pone + 0.001; h += 0.1) { s = solEn(a[0], h); if (s.alt >= 0) pts.push(dirSol(s.alt, s.az).multiplyScalar(RADIO)); }
      linea(pts, a[1], 1);
      for (h = Math.ceil(t.sale + 0.2); h <= Math.floor(t.pone - 0.2); h++) {
        s = solEn(a[0], h); p = dirSol(s.alt, s.az).multiplyScalar(RADIO);
        var d = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), new THREE.MeshBasicMaterial({ color: a[1] })); d.position.copy(p); gBoveda.add(d);
        if (a[0] === 12 && h % 2 === 0) etqBoveda.push({ t: h + ' h', p: p.clone().multiplyScalar(1.05).add(O), c: 'hor', prio: 6, cerca: 0, lejos: 130 });
      }
      s = solEn(a[0], t.mediodia);
      etqBoveda.push({ t: a[2], p: dirSol(s.alt, s.az).multiplyScalar(RADIO).add(new THREE.Vector3(0, a[0] === 6 ? -5 : 5, 0)).add(O), c: 'arc', prio: 4, cerca: 0, lejos: 130 });
    });
    for (h = 7; h <= 20; h++) {                                     // analemas: el sol a la misma hora oficial a lo largo del año
      var tramo = [], m, dia, s2;
      for (m = 1; m <= 13; m++) for (dia = 1; dia <= 21; dia += 10) {
        if (m === 13 && dia > 1) break;
        s2 = solEn((m - 1) % 12 + 1, h, dia);
        if (s2.alt > 0) tramo.push(dirSol(s2.alt, s2.az).multiplyScalar(RADIO)); else if (tramo.length > 1) { linea(tramo.splice(0), COLOR.suave, 0.3); } else tramo.length = 0;
      }
      if (tramo.length > 1) linea(tramo, COLOR.suave, 0.3);
    }
    arcoDia = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xF2A318 })); gBoveda.add(arcoDia);
    bolaSol = new THREE.Mesh(new THREE.SphereGeometry(2.8, 20, 14), new THREE.MeshBasicMaterial({ color: 0xF9B62E })); gBoveda.add(bolaSol);
    rayoSol = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xF2A318, transparent: true, opacity: 0.7 })); gBoveda.add(rayoSol);
  }

  // Recorrido que está dibujado en la pestaña «Plano y recorridos»
  function armarRuta() {
    if (!ok) return;
    if (gRuta) { scene.remove(gRuta); gRuta.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
    gRuta = new THREE.Group(); scene.add(gRuta); etqRuta = [];
    var mr = new THREE.MeshBasicMaterial({ color: COLOR.naranja }), mf = new THREE.MeshBasicMaterial({ color: 0xF4B66A });
    (ruta.tramos || []).forEach(function (t) {
      var pts = [];
      (t.puntos || []).forEach(function (p) { var v = V(p[0], p[1], 0.3); if (!pts.length || pts[pts.length - 1].distanceTo(v) > 0.05) pts.push(v); });
      if (pts.length < 2) return;
      var curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      gRuta.add(new THREE.Mesh(new THREE.TubeGeometry(curva, clamp(pts.length * 8, 16, 500), 0.45, 6, false), t.afuera ? mf : mr));
    });
    (ruta.paradas || []).forEach(function (p) {
      var d = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.16, 20), mr); d.position.copy(V(p.x, p.y, 0.2)); gRuta.add(d);
      etqRuta.push({ t: p.n ? String(p.n) : '', p: V(p.x, p.y, 3.2), c: p.n ? 'par' : 'par fin', prio: 0, cerca: 0 });
    });
    if (ruta.partida) {
      var b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 10), mr); b.position.copy(V(ruta.partida[0], ruta.partida[1], 0.8)); gRuta.add(b);
      etqRuta.push({ t: 'Estás acá', p: V(ruta.partida[0], ruta.partida[1], 3.4), c: 'aca', prio: 0, cerca: 0 });
    }
    gRuta.visible = capas.recorrido;
    armarEtiquetas();
  }
  function notaRuta() {
    if (!dom.notaRuta) return;
    var hay = (ruta.tramos || []).length > 0;
    dom.notaRuta.textContent = hay ? 'Recorrido activo: ' + (ruta.nombre || 'el que está dibujado en el plano') + '.'
      : (ruta.partida ? 'Está marcado dónde estás. ' : '') + 'Para ver un recorrido acá, elegilo antes en «Plano y recorridos».';
  }

  // ---------------------------------------------------------------- etiquetas (HTML sobre el modelo, como en el plano)
  function armarEtiquetas() {
    if (!dom.lbls) return;
    todas = etiquetas.concat(etqBoveda.map(function (l) { l.grupo = 'boveda'; return l; }), etqRuta.map(function (l) { l.grupo = 'ruta'; return l; }));
    todas.sort(function (a, b) { return a.prio - b.prio; });
    while (dom.lbls.firstChild) dom.lbls.removeChild(dom.lbls.firstChild);
    todas.forEach(function (l) { l.el = document.createElement('div'); l.el.className = 'lb ' + l.c; l.el.textContent = l.t; l.w = 0; l.wc = 0; l.breve = false; dom.lbls.appendChild(l.el); });
    invalidar();
  }
  function colocarEtiquetas() {
    var w = dom.stage.clientWidth, h = dom.stage.clientHeight, v = new THREE.Vector3(), puestos = [], centro = V(CENTRO[0], CENTRO[1], 0), lejos = camera.position.distanceTo(centro), i, l, r, breve;
    function caja2(l, ancho) { var cx = clamp(l.x, ancho / 2 + 4, w - ancho / 2 - 4), cy = clamp(l.y, l.h / 2 + 3, h - l.h / 2 - 3); return [cx - ancho / 2 - 2, cy - l.h / 2 - 1, cx + ancho / 2 + 2, cy + l.h / 2 + 1, cx, cy]; }
    function choca(r, propio) { for (var j = 0; j < puestos.length; j++) if (puestos[j] !== propio && r[0] < puestos[j][2] && r[2] > puestos[j][0] && r[1] < puestos[j][3] && r[3] > puestos[j][1]) return true; return false; }
    if (dom.hud && !dom.hud.hidden) { var hr = dom.hud.getBoundingClientRect(), sr = dom.stage.getBoundingClientRect(); puestos.push([hr.left - sr.left - 4, hr.top - sr.top - 4, hr.right - sr.left + 4, hr.bottom - sr.top + 4]); }
    for (i = 0; i < todas.length; i++) {                             // 1) qué etiquetas entran en cuadro
      l = todas[i];
      l.ver = l.grupo === 'ruta' ? capas.recorrido : l.grupo === 'boveda' ? capas.boveda && capas.etiquetas : capas.etiquetas;
      if (l.ver && l.cerca) l.ver = camera.position.distanceTo(l.p) < l.cerca;
      if (l.ver && l.lejos) l.ver = lejos > l.lejos;
      if (l.ver) { v.copy(l.p).project(camera); l.ver = v.z < 1 && v.z > -1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1; }
      if (!l.ver) continue;
      if (!l.w) { l.el.textContent = l.t; l.el.classList.remove('breve'); l.el.style.display = ''; l.w = l.el.offsetWidth || 40; l.h = l.el.offsetHeight || 16; l.breve = false; }
      l.x = (v.x + 1) / 2 * w; l.y = (1 - v.y) / 2 * h; l.reserva = null;
    }
    todas.forEach(function (l) {                                    // 2) los sectores reservan primero el lugar de su número
      if (!l.ver || !l.corto) return;
      r = caja2(l, l.h);
      if (choca(r)) return;
      l.reserva = r; puestos.push(r);
    });
    for (i = 0; i < todas.length; i++) {                             // 3) por prioridad: nombre completo si entra
      l = todas[i]; breve = false;
      if (l.ver) {
        r = caja2(l, l.w);
        if (l.corto) {
          if (!l.reserva) l.ver = false;
          else if (choca(r, l.reserva)) { breve = true; r = l.reserva; }
          else { puestos[puestos.indexOf(l.reserva)] = r; }
        } else if (choca(r) && l.prio > 0) l.ver = false; else puestos.push(r);
      }
      l.vis = l.ver;
      l.el.style.display = l.ver ? '' : 'none';
      if (!l.ver) continue;
      if (breve !== l.breve) { l.breve = breve; l.el.textContent = breve ? l.corto : l.t; l.el.classList.toggle('breve', breve); }
      l.sx = r[4]; l.sy = r[5]; l.ancho = breve ? l.h : l.w;
      l.el.style.transform = 'translate(-50%,-50%) translate(' + r[4].toFixed(1) + 'px,' + r[5].toFixed(1) + 'px)';
    }
  }

  // ---------------------------------------------------------------- sol, luz y sombras
  function ponerSol(p) {
    if (!ok) return;
    var v = dirSol(p.alt, p.az), arriba = p.alt > HORIZONTE, O = V(CENTRO[0], CENTRO[1], 0), sen = Math.sin(Math.max(p.alt, 0.5) * RAD);
    // «directa» es la parte de la luz que llega del sol al suelo: baja con el sol, pero sin dejar la escena a oscuras
    var amanecer = clamp((p.alt - HORIZONTE) / 3, 0, 1), directa = 0.45 * Math.sqrt(sen), fuerza = Math.min(0.68, directa / sen) * amanecer;
    sol.target.position.copy(O); sol.position.copy(O.clone().add(v.clone().multiplyScalar(300)));
    sol.visible = arriba; sol.intensity = fuerza; hemi.intensity = arriba ? 0.3 + (0.67 - fuerza * sen) * (0.35 + 0.65 * amanecer) : 0.22;
    var dia = new THREE.Color(0xE3EEEA), bajo = new THREE.Color(0xF3E2C2), noche = new THREE.Color(0x1C2515);
    scene.background = arriba ? bajo.clone().lerp(dia, clamp(p.alt / 14, 0, 1)) : noche;
    scene.fog.color.copy(scene.background);
    dom.stage.style.background = '#' + scene.background.getHexString();
    dom.stage.classList.toggle('noche', !arriba);
    bolaSol.visible = rayoSol.visible = arriba;
    if (arriba) { var q = v.clone().multiplyScalar(RADIO); bolaSol.position.copy(q); rayoSol.geometry.setFromPoints([q, new THREE.Vector3(0, 0.4, 0)]); }
    var t = horarios(E.mes), pts = [], h, s;
    for (h = t.sale; h <= t.pone + 0.001; h += 0.1) { s = solEn(E.mes, h); if (s.alt >= 0) pts.push(dirSol(s.alt, s.az).multiplyScalar(RADIO * 1.003)); }
    arcoDia.geometry.setFromPoints(pts);
    gBoveda.visible = capas.boveda;
    renderer.shadowMap.needsUpdate = true;
    invalidar();
  }
  function refrescar() { if (!iniciado) return; var p = leer(); ponerSol(p); }

  // ---------------------------------------------------------------- cámara, dibujo y captura
  function dibujar() { pendiente = false; if (!ok || !visible) return; controls.update(); renderer.render(scene, camera); colocarEtiquetas(); }
  function invalidar() { if (ok && !pendiente) { pendiente = true; requestAnimationFrame(dibujar); } }
  function medir() {
    if (!ok) return;
    var w = dom.stage.clientWidth, h = dom.stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    todas.forEach(function (l) { l.w = 0; });
    invalidar();
  }
  function vista(nombre) {
    if (!ok || !VISTAS[nombre]) return;
    var d = VISTAS[nombre], t = V(d.t[0], d.t[1], d.t[2]), c = V(d.c[0], d.c[1], d.c[2]), k = clamp(1.16 / (camera.aspect || 1.5), 1, 1.8);
    if (nombre === 'aerea' || nombre === 'planta') c.sub(t).multiplyScalar(k).add(t);      // en pantallas más altas que anchas, la cámara se aleja
    camera.position.copy(c); controls.target.copy(t); controls.update();
    vistaActual = nombre;
    Array.prototype.forEach.call(dom.vistas.querySelectorAll('[data-vista]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-vista') === nombre ? 'true' : 'false'); });
    invalidar();
  }
  // Imagen fija con las etiquetas, para imprimir
  function captura() {
    if (!ok) return null;
    controls.update(); renderer.render(scene, camera); colocarEtiquetas();
    var cv = dom.canvas, c = document.createElement('canvas'), g, k;
    c.width = cv.width; c.height = cv.height; g = c.getContext('2d'); g.drawImage(cv, 0, 0);
    k = cv.width / dom.stage.clientWidth; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    todas.forEach(function (l) {
      if (!l.vis) return;
      var cs = window.getComputedStyle(l.el), fs = parseFloat(cs.fontSize) || 12, w = (l.ancho || l.w) * k, h = l.h * k, x = l.sx * k, y = l.sy * k, fondo = cs.backgroundColor, txt = l.breve ? l.corto : l.t;
      g.font = (cs.fontWeight || 800) + ' ' + Math.round(fs * k) + 'px ' + (cs.fontFamily || 'sans-serif');
      if (fondo && fondo !== 'rgba(0, 0, 0, 0)' && fondo !== 'transparent') {
        g.fillStyle = fondo; var r = Math.min(h / 2, 10 * k);
        g.beginPath(); g.moveTo(x - w / 2 + r, y - h / 2); g.arcTo(x + w / 2, y - h / 2, x + w / 2, y + h / 2, r); g.arcTo(x + w / 2, y + h / 2, x - w / 2, y + h / 2, r);
        g.arcTo(x - w / 2, y + h / 2, x - w / 2, y - h / 2, r); g.arcTo(x - w / 2, y - h / 2, x + w / 2, y - h / 2, r); g.closePath(); g.fill();
      } else { g.lineWidth = 3 * k; g.strokeStyle = 'rgba(255,253,246,.92)'; g.strokeText(txt, x, y); }
      g.fillStyle = cs.color; g.fillText(txt, x, y + 0.5 * k);
    });
    try { return c.toDataURL('image/jpeg', 0.9); } catch (err) { return null; }
  }
  function prepararImpresion() {
    if (!ok || !visible) return;
    var d = captura();
    if (!d) return;
    if (!dom.snap) {                                                // la imagen para imprimir se crea recién cuando hace falta
      dom.snap = document.createElement('img'); dom.snap.id = 'v3-snap'; dom.snap.className = 'snap'; dom.snap.alt = 'Vista del modelo 3D del Jardín con sombras';
      dom.stage.appendChild(dom.snap);
    }
    dom.snap.src = d;
  }

  function armarEscena() {
    if (typeof THREE === 'undefined' || !THREE.OrbitControls) return false;
    try { renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true }); } catch (err) { renderer = null; }
    if (!renderer) return false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(38, 1.5, 0.5, 2600);
    controls = new THREE.OrbitControls(camera, dom.canvas);
    controls.maxPolarAngle = Math.PI / 2 - 0.02; controls.minDistance = 6; controls.maxDistance = 460; controls.screenSpacePanning = false;
    controls.addEventListener('change', invalidar);
    // si el teléfono le saca la memoria gráfica a la pestaña y después la devuelve, se vuelve a dibujar todo
    dom.canvas.addEventListener('webglcontextrestored', function () { renderer.shadowMap.needsUpdate = true; invalidar(); });
    scene.fog = new THREE.Fog(0xE3EEEA, 560, 1700);                 // el campo se funde con el cielo a lo lejos
    hemi = new THREE.HemisphereLight(0xFFFFFF, 0xE2D9BE, 0.54); scene.add(hemi);
    sol = new THREE.DirectionalLight(0xFFF8EA, 0.5); sol.castShadow = true;
    var sc = sol.shadow.camera, chico = Math.min(window.innerWidth, window.innerHeight) < 700;
    sc.left = -120; sc.right = 120; sc.top = 120; sc.bottom = -120; sc.near = 40; sc.far = 620;
    sol.shadow.mapSize.set(chico ? 2048 : 4096, chico ? 2048 : 4096); sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.07;
    scene.add(sol, sol.target);
    etiquetas = [];
    armarEntorno(); armarPredio(); armarCarteleria(); armarArboles(); armarBoveda();
    ok = true;
    armarRuta();
    return true;
  }

  // ---------------------------------------------------------------- controles
  function parar() { if (reloj) { clearInterval(reloj); reloj = null; } if (dom.recorrer) { dom.recorrer.setAttribute('aria-pressed', 'false'); dom.recorrer.textContent = 'Recorrer el día'; } }
  function recorrerDia() {
    if (reloj) { parar(); return; }
    var t = horarios(E.mes), desde = clamp(Math.ceil(t.sale * 4) / 4, 7, 20), hasta = clamp(Math.floor(t.pone * 4) / 4, 7, 20);
    if (E.hora >= hasta || E.hora < desde) E.hora = desde;
    dom.recorrer.setAttribute('aria-pressed', 'true'); dom.recorrer.textContent = 'Detener';
    refrescar();
    reloj = setInterval(function () { if (E.hora >= hasta) { parar(); return; } E.hora = Math.min(hasta, E.hora + 0.25); refrescar(); }, 130);
  }
  function conectar() {
    dom.mes.addEventListener('input', function () { parar(); E.mes = clamp(parseInt(dom.mes.value, 10) || 1, 1, 12); refrescar(); });
    dom.hora.addEventListener('input', function () { parar(); E.hora = clamp(parseFloat(dom.hora.value) || 12, 7, 20); refrescar(); });
    dom.fechas.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('[data-m]'); if (!b) return; parar(); E.mes = +b.getAttribute('data-m'); refrescar(); });
    dom.recorrer.addEventListener('click', recorrerDia);
    dom.vistas.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('[data-vista]'); if (b) vista(b.getAttribute('data-vista')); });
    dom.capas.addEventListener('change', function (ev) {
      var k = ev.target.getAttribute && ev.target.getAttribute('data-capa3d');
      if (!k) return;
      capas[k] = ev.target.checked;
      if (ctx.guardado) ctx.guardado.set('capas3d', capas);
      if (!ok) return;
      if (k === 'arboles') { gArboles.visible = capas.arboles; renderer.shadowMap.needsUpdate = true; }
      if (k === 'boveda') gBoveda.visible = capas.boveda;
      if (k === 'recorrido' && gRuta) gRuta.visible = capas.recorrido;
      invalidar();
    });
    document.addEventListener('jb:relevamiento', function () { censoSucio = true; });
    window.addEventListener('storage', function (ev) { if (ev.key === 'jbplano:relevamiento') { censoSucio = true; if (visible) mostrar(); } });
    window.addEventListener('beforeprint', prepararImpresion);
    if (window.matchMedia) { var mq = window.matchMedia('print'), fn = function (e) { if (e.matches) prepararImpresion(); }; if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
    if (window.ResizeObserver) new ResizeObserver(medir).observe(dom.stage); else window.addEventListener('resize', medir);
  }

  // ---------------------------------------------------------------- arranque
  function iniciar(contexto) {
    if (iniciado) return true;
    ctx = contexto; cfg = ctx.config || {};
    if (cfg.sitio && typeof cfg.sitio.lat === 'number' && typeof cfg.sitio.lng === 'number') SITIO = { lat: cfg.sitio.lat, lng: cfg.sitio.lng, utc: typeof cfg.sitio.utc === 'number' ? cfg.sitio.utc : -3 };
    if (typeof ctx.norte === 'number') NORTE = ctx.norte;
    ['stage', 'canvas', 'hud', 'snap', 'nogl', 'panel', 'read', 'poster'].forEach(function (k) { dom[k] = $('v3-' + k); });
    dom.lbls = $('v3-labels'); dom.mes = $('v3-mes'); dom.hora = $('v3-hora'); dom.mesTxt = $('v3-mes-txt'); dom.horaTxt = $('v3-hora-txt'); dom.fechas = $('v3-fechas');
    dom.recorrer = $('v3-recorrer'); dom.vistas = $('v3-vistas'); dom.capas = $('v3-capas'); dom.notaArboles = $('v3-nota-arboles'); dom.notaRuta = $('v3-nota-recorrido');
    dom.rdSol = $('rd-sol'); dom.rdHoras = $('rd-horas'); dom.rdPoste = $('rd-poste'); dom.rdHuerta = $('rd-huerta'); dom.rdInv = $('rd-inv'); dom.rdBancos = $('rd-bancos');
    if (!dom.stage || !dom.mes || !window.SunCalc) return false;
    var g = ctx.guardado ? ctx.guardado.get('capas3d', null) : null, k;
    if (g) for (k in capas) if (typeof g[k] === 'boolean') capas[k] = g[k];
    Array.prototype.forEach.call(dom.capas.querySelectorAll('[data-capa3d]'), function (i) { i.checked = !!capas[i.getAttribute('data-capa3d')]; });
    // fecha y hora de arranque: el mes de hoy y, si a esta hora hay sol, la hora de ahora (en hora argentina)
    var hoy = new Date(Date.now() + SITIO.utc * 3600e3), h = Math.round((hoy.getUTCHours() + hoy.getUTCMinutes() / 60) * 4) / 4, t;
    E.mes = hoy.getUTCMonth() + 1; t = horarios(E.mes);
    E.hora = h > t.sale + 0.5 && h < t.pone - 0.5 && h >= 7 && h <= 20 ? h : 13;
    leerGeometria(); prepararArboles(); medirArboles(); armarMuestras();
    if (ctx.recorrido) ruta = ctx.recorrido();
    iniciado = true;
    var hayGL = false;
    try { hayGL = armarEscena(); } catch (err) { hayGL = false; ok = false; if (window.console) console.warn('Modelo 3D: no se pudo armar la escena', err); }
    dom.panel.hidden = false; dom.read.hidden = false; dom.hud.hidden = false;
    if ($('v3')) $('v3').classList.add('listo');
    if (hayGL) { dom.canvas.hidden = false; if (dom.poster) dom.poster.hidden = true; }
    else { dom.nogl.hidden = false; dom.stage.classList.add('sin-gl'); $('v3-fs-vistas').hidden = true; $('v3-fs-capas').hidden = true; }
    conectar(); notaRuta();
    return true;
  }
  function mostrar() {
    if (!iniciado) return;
    visible = true;
    if (censoSucio) { censoSucio = false; medirArboles(); pintarArboles(); }
    if (ok) { medir(); if (!camera.userData.lista) { camera.userData.lista = true; vista('aerea'); } }
    refrescar();
  }
  function ocultar() { visible = false; parar(); }
  function recorrido(d) { ruta = d || { tramos: [], paradas: [] }; notaRuta(); if (ok) armarRuta(); }

  return {
    iniciar: iniciar, mostrar: mostrar, ocultar: ocultar, recorrido: recorrido, vista: vista, captura: captura,
    fijar: function (mes, hora) { parar(); E.mes = clamp(Math.round(mes), 1, 12); E.hora = clamp(hora, 7, 20); refrescar(); },
    sol: function (mes, hora) { var p = solEn(mes, hora), v = vectorSol(p.alt, p.az), t = horarios(mes); return { alt: p.alt, az: p.az, x: v.x, y: v.y, z: v.z, sale: t.sale, pone: t.pone, mediodia: t.mediodia }; },
    // dónde cae en pantalla un punto del plano (x, y en cuadrículas; h en metros): para pruebas y verificaciones
    proyectar: function (x, y, h) { if (!ok) return null; var v = V(x, y, h || 0).project(camera); return [(v.x + 1) / 2 * dom.stage.clientWidth, (1 - v.y) / 2 * dom.stage.clientHeight]; },
    arbol: function (id) { var a = arboles.filter(function (x) { return x.id === id; })[0]; return a ? { altura: a.h, copa: a.copa, porte: a.porte, real: a.real, tronco: a.tronco } : null; },
    estado: function () {
      return { iniciado: iniciado, webgl: ok, mes: E.mes, hora: E.hora, norte: NORTE, sitio: SITIO, arboles: arboles.length, reales: reales, capas: capas, vista: vistaActual, recorriendo: !!reloj,
        ruta: { tramos: (ruta.tramos || []).length, paradas: (ruta.paradas || []).length, mallas: gRuta ? gRuta.children.length : 0 },
        camara: ok ? [camera.position.x, camera.position.y, camera.position.z] : null, etiquetas: todas.filter(function (l) { return l.vis; }).map(function (l) { return l.t; }),
        dia: iniciado ? asoleamientoDia(E.mes) : null, muestras: muestras ? { huerta: muestras.huerta.length, inv: muestras.inv.map(function (m) { return m.length; }), bancos: muestras.bancos.length } : null,
        sombras: ok ? sol.shadow.mapSize.x : 0 };
    }
  };
})();
