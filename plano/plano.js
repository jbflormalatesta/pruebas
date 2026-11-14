/*
 * Plano del Jardín
 * ----------------
 * Capas, referencias que se tocan en el plano o en la lista, orientación (norte arriba o vista desde el
 * ingreso), «Estás acá», caminos a pie por los senderos, recorridos sugeridos, «El Jardín mes a mes» y la
 * ficha de indicadores. Datos que edita el Jardín: datos/plano.js (lugares), datos/recorridos.js y
 * datos/mes-a-mes.js. La red de senderos (plano/senderos.js) sale del relevamiento y no se edita a mano.
 * Privacidad: solo se guardan en este navegador las preferencias de vista (capas, orientación y pestaña)
 * y, mientras dura la visita, el punto de partida. No se envía nada a ningún lado.
 */
(function () {
  'use strict';
  var P = window.PLANO || {};
  var lugares = P.lugares || [];
  var ejemplares = P.ejemplares || {};
  var RECORRIDOS = window.RECORRIDOS || [];
  var MES = window.MES_A_MES || {};
  var svg = document.getElementById('plano');
  var marco = document.getElementById('plano-marco');
  var estado = document.getElementById('plano-estado');
  var ficha = document.getElementById('plano-ficha');
  if (!svg || !marco) return;
  var lienzo = svg.querySelector('#lienzo') || svg;
  var marcas = svg.querySelector('#marcas');
  var NS = 'http://www.w3.org/2000/svg';
  var COLS = 56, FILAS = 68;
  var CALIBRE = 1.017;            // ajuste fino para coincidir con las distancias impresas en los tótems
  var VB = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
  var red = null;
  try { if (window.SENDEROS && window.Ruteo) red = new window.Ruteo.Red(window.SENDEROS); } catch (e) { red = null; }

  // Especies que nunca se marcan con ubicación exacta (sensibles, amenazadas o con decisión de ubicación pendiente)
  var RESERVADAS = ['H-57', 'H-58', 'H-07', 'A-46', 'A-73', 'H-28', 'A-10', 'A-37', 'A-56', 'A-75'];
  var SIN_SECTOR = ['H-57', 'H-58', 'H-07', 'A-46', 'A-73', 'H-28'];

  // ---------- utilidades ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function nodo(tag, attrs, padre) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function texto(t, attrs, padre) { var e = nodo('text', attrs, padre); e.textContent = t; return e; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ubicado(l) { return !!l && typeof l.col === 'number' && typeof l.fila === 'number'; }
  function cx(col) { return col - 0.5; }
  function cy(fila) { return FILAS + 0.5 - fila; }
  function decir(t) { if (estado) estado.textContent = t; }
  function detalle(html) {
    var d = $('#plano-detalle');
    if (!d) { d = document.createElement('div'); d.id = 'plano-detalle'; d.className = 'plano-detalle'; if (ficha) ficha.appendChild(d); }
    d.innerHTML = html || '';
  }
  function normalizar(c) {
    var m = String(c).trim().match(/^([a-z])\s*-?\s*(\d{1,2})$/i);
    return m ? m[1].toUpperCase() + '-' + (m[2].length < 2 ? '0' + m[2] : m[2]) : String(c).trim();
  }
  function almacen(tipo) {
    return {
      get: function (k, d) { try { var v = window[tipo].getItem('jbplano:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
      set: function (k, v) { try { if (v == null) window[tipo].removeItem('jbplano:' + k); else window[tipo].setItem('jbplano:' + k, JSON.stringify(v)); } catch (e) {} }
    };
  }
  var guardado = almacen('localStorage'), sesion = almacen('sessionStorage');
  var porCodigo = {};
  lugares.forEach(function (l) { porCodigo[l.codigo] = l; });

  function numSector(l) { return parseInt(l.codigo.slice(2), 10); }
  function nombreCorto(l) {
    if (!l) return '';
    if (l.tipo === 'sector') return l.nombre + ' (sector ' + numSector(l) + ')';
    if (l.tipo === 'servicio' && l.icono === 'agua') return 'Agua potable';
    return l.nombre;
  }
  function descripcion(l) { var n = nombreCorto(l); return l.nota ? n + ' · ' + l.nota : n; }
  function etiqueta(l) {
    if (l.codigo === 'cartel-plano') return 'A2';
    if (l.tipo === 'totem') return 'T' + parseInt(l.codigo.slice(2), 10);
    return l.pieza || l.codigo;
  }

  // ---------- capas ----------
  var CAPAS = [
    { k: 'sectores', t: 'Sectores', on: true },
    { k: 'servicios', t: 'Servicios', on: true },
    { k: 'accesos', t: 'Accesos y transporte', on: true },
    { k: 'carteles', t: 'Cartelería y QR', on: false },
    { k: 'arboles', t: 'Árboles', on: true },
    { k: 'recorridos', t: 'Recorridos', on: true },
    { k: 'cuadricula', t: 'Cuadrícula técnica', on: false }
  ];
  var CAPA_DE = { sector: 'sectores', referencia: 'sectores', servicio: 'servicios', acceso: 'accesos', puerta: 'accesos',
    parada: 'accesos', cruce: 'accesos', totem: 'carteles', cartel: 'carteles', lama: 'carteles', panel: 'carteles' };
  var grupos = {};
  ['recorridos', 'sectores', 'servicios', 'accesos', 'carteles'].forEach(function (k) {
    grupos[k] = nodo('g', { id: 'capa-' + k, 'class': 'capa' }, marcas);
  });
  var capasOn = guardado.get('capas', null) || {};
  function capaVisible(k) { return capasOn[k] !== undefined ? capasOn[k] : CAPAS.filter(function (c) { return c.k === k; })[0].on; }
  function aplicarCapa(k, on, guardar) {
    capasOn[k] = on;
    if (k === 'cuadricula') {
      marco.classList.toggle('con-cuadricula', on);
      decir(on ? 'Tocá un lugar del plano para ver su columna y su fila.' : '');
    } else {
      marco.classList.toggle('sin-' + k, !on);
    }
    var i = $('input[data-capa="' + k + '"]');
    if (i) i.checked = on;
    if (guardar) { var g = {}; CAPAS.forEach(function (c) { if (c.k !== 'cuadricula') g[c.k] = capaVisible(c.k); }); guardado.set('capas', g); }
  }
  var cajaCapas = $('#capas');
  if (cajaCapas) {
    cajaCapas.innerHTML = CAPAS.map(function (c) {
      return '<label class="capa capa-' + c.k + '"><input type="checkbox" data-capa="' + c.k + '"' +
        (c.k === 'cuadricula' ? ' id="ver-cuadricula"' : '') + '> ' + c.t + '</label>';
    }).join('');
    var cajaDet = $('#capas-caja');
    if (cajaDet) { cajaDet.hidden = false; cajaDet.open = !(window.matchMedia && window.matchMedia('(max-width: 639px)').matches); }
    $$('input[data-capa]', cajaCapas).forEach(function (i) {
      i.addEventListener('change', function () { aplicarCapa(i.getAttribute('data-capa'), i.checked, true); });
    });
    var viejo = document.querySelector('button#ver-cuadricula');
    if (viejo) viejo.parentNode.removeChild(viejo);
  }
  CAPAS.forEach(function (c) { aplicarCapa(c.k, c.k === 'cuadricula' ? false : capaVisible(c.k), false); });
  function asegurarCapa(k) { if (k && !capaVisible(k)) aplicarCapa(k, true, true); }

  // ---------- marcas de los lugares ----------
  var GOTA = 'c.62.72.6 1.2.6 1.44a.6.6 0 0 1-1.2 0c0-.24-.02-.72.6-1.44z';
  lugares.forEach(function (l) {
    if (!ubicado(l) || l.en) return;
    var x = cx(l.col), y = cy(l.fila), capa = grupos[CAPA_DE[l.tipo] || 'sectores'];
    var g = nodo('g', { 'class': 'marca ' + l.tipo, id: 'm-' + l.codigo, 'data-codigo': l.codigo, tabindex: '0',
      role: 'button', 'aria-label': descripcion(l) }, capa);
    nodo('title', {}, g).textContent = descripcion(l);
    var t = nodo('g', { 'data-recto': x + ' ' + y }, null);
    if (l.tipo === 'sector') {
      nodo('circle', { cx: x, cy: y, r: 1.5 }, g);
      texto(String(numSector(l)), { x: x, y: y + 0.56, 'class': 'num' }, t);
    } else if (l.tipo === 'referencia') {
      nodo('rect', { x: x - 1.05, y: y - 1.05, width: 2.1, height: 2.1, rx: 0.4 }, g);
      texto(l.letra || '·', { x: x, y: y + 0.42, 'class': 'num' }, t);
    } else if (l.tipo === 'servicio') {
      nodo('circle', { cx: x, cy: y, r: l.icono === 'agua' ? 1.05 : 1.35 }, g);
      if (l.icono === 'agua') nodo('path', { 'class': 'gota', d: 'M' + x + ',' + (y - 0.8) + GOTA }, t);
      else texto(l.icono === 'banos' ? 'WC' : 'i', { x: x, y: y + 0.42, 'class': 'num' }, t);
    } else if (l.tipo === 'parada') {
      nodo('circle', { cx: x, cy: y, r: 1.35 }, g);
      nodo('path', { 'class': 'bus', 'fill-rule': 'evenodd', d: 'M' + (x - 0.75) + ',' + (y - 0.85) +
        'h1.5a.25.25 0 0 1 .25.25v1.15a.2.2 0 0 1-.2.2h-.1v.3h-.38v-.3h-.64v.3h-.38v-.3h-.1a.2.2 0 0 1-.2-.2v-1.15a.25.25 0 0 1 .25-.25z' +
        'M' + (x - 0.6) + ',' + (y - 0.6) + 'h1.2v.55h-1.2z' }, t);
    } else if (l.tipo === 'cruce') {
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.4 }, g);
      nodo('path', { 'class': 'cruz', d: 'M' + (x - 0.6) + ',' + (y - 0.6) + 'L' + (x + 0.6) + ',' + (y + 0.6) +
        'M' + (x + 0.6) + ',' + (y - 0.6) + 'L' + (x - 0.6) + ',' + (y + 0.6) }, g);
    } else if (l.tipo === 'puerta') {
      nodo('rect', { x: x - 0.55, y: y - 0.9, width: 1.1, height: 1.8, rx: 0.3 }, g);
    } else if (l.tipo === 'acceso') {
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.45 }, g);
      var giro = l.col >= COLS ? 180 : 90;   // desde la izquierda o de arriba, hacia adentro
      nodo('path', { 'class': 'flecha', d: 'M-.65,0H.45M.05-.45L.55,0L.05.45', transform: 'translate(' + x + ' ' + y + ') rotate(' + giro + ')' }, g);
    } else if (l.tipo === 'totem' || l.tipo === 'cartel') {
      nodo('rect', { x: x - 1.5, y: y - 1, width: 3, height: 2, rx: 0.5 }, g);
      texto(etiqueta(l), { x: x, y: y + 0.45, 'class': 'num' }, t);
    } else if (l.tipo === 'lama') {
      nodo('path', { d: 'M' + x + ',' + (y - 1.15) + 'L' + (x + 1.15) + ',' + y + 'L' + x + ',' + (y + 1.15) + 'L' + (x - 1.15) + ',' + y + 'Z' }, g);
      texto('L', { x: x, y: y + 0.42, 'class': 'num' }, t);
    } else { // panel
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.45 }, g);
      texto('P', { x: x, y: y + 0.52, 'class': 'num' }, t);
    }
    if (t.childNodes.length) g.appendChild(t);
    if (l.rotulo) {
      var lineas = [].concat(l.rotulo), izq = l.rotuloLado ? l.rotuloLado === 'izq' : l.col <= 0;
      var gr = nodo('g', { 'data-recto': x + ' ' + y }, g);
      lineas.forEach(function (tx, k) {
        texto(tx, { x: izq ? x - 1.7 : x + 1.7, y: y + 0.45 + (k - (lineas.length - 1) / 2) * 1.35,
          'class': 'rotulo' + (izq ? ' izq' : '') + (l.tipo === 'cruce' ? ' claro' : '') }, gr);
      });
    }
  });
  // Bancos y asientos del relevamiento (capa Servicios)
  var BANCOS = (window.SENDEROS && window.SENDEROS.bancos) || [];
  BANCOS.forEach(function (b, i) {
    var g = nodo('g', { 'class': 'banco', id: 'banco-' + (i + 1), 'data-codigo': 'banco-' + (i + 1) }, grupos.servicios);
    nodo('title', {}, g).textContent = 'Banco o asiento';
    nodo('circle', { cx: b[0], cy: b[1], r: 0.62 }, g);
  });

  // ---------- orientación: norte arriba o vista desde el ingreso (como el cartel A2) ----------
  var orientacion = 'norte';
  function enderezar(raiz) {
    if (!raiz || !raiz.querySelectorAll) return;
    var lista = $$('[data-recto],[data-volteo]', raiz);
    if (raiz.hasAttribute && (raiz.hasAttribute('data-recto') || raiz.hasAttribute('data-volteo'))) lista.push(raiz);
    var a2 = orientacion === 'ingreso';
    lista.forEach(function (el) {
      if (!el.hasAttribute('data-t0')) el.setAttribute('data-t0', el.getAttribute('transform') || '');
      var t0 = el.getAttribute('data-t0'), r = el.getAttribute('data-recto'), v = el.getAttribute('data-volteo');
      var extra = !a2 ? '' : (r ? 'rotate(90 ' + r + ')' : 'rotate(180 ' + v + ')');
      var t = (extra + ' ' + t0).trim();
      if (t) el.setAttribute('transform', t); else el.removeAttribute('transform');
    });
  }
  function orientar(o, guardar) {
    orientacion = o === 'ingreso' ? 'ingreso' : 'norte';
    var a2 = orientacion === 'ingreso';
    if (a2) lienzo.setAttribute('transform', 'rotate(-90)'); else lienzo.removeAttribute('transform');
    svg.setAttribute('viewBox', (a2 ? [VB[1], -(VB[0] + VB[2]), VB[3], VB[2]] : VB).join(' '));
    marco.classList.toggle('girado', a2);
    enderezar(svg);
    $$('#orientacion [data-orientacion]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-orientacion') === orientacion ? 'true' : 'false');
    });
    if (guardar) guardado.set('orientacion', orientacion);
  }
  var cajaOri = $('#orientacion');
  if (cajaOri) {
    cajaOri.hidden = false;
    $$('[data-orientacion]', cajaOri).forEach(function (b) {
      b.addEventListener('click', function () {
        orientar(b.getAttribute('data-orientacion'), true);
        decir(orientacion === 'ingreso' ? 'Vista desde el ingreso: como en el cartel con el plano, lo que tenés adelante queda arriba y la Ruta 40, a la izquierda.' : 'Norte arriba: la orientación general del plano.');
      });
    });
  }

  // ---------- puntos y lugares ----------
  function arbolPos(id) { var c = svg.querySelector('#' + id); return c ? [+c.getAttribute('cx'), +c.getAttribute('cy')] : null; }
  function puntoDe(ref) {
    if (!ref) return null;
    if (typeof ref === 'object') return [ref.x, ref.y];
    var l = porCodigo[ref];
    if (l) { if (l.en && porCodigo[l.en]) l = porCodigo[l.en]; return ubicado(l) ? [cx(l.col), cy(l.fila)] : null; }
    var mb = /^banco-(\d+)$/.exec(ref);
    if (mb && BANCOS[mb[1] - 1]) return BANCOS[mb[1] - 1].slice(0, 2);
    if (/^ar\d{3}$/.test(ref)) return arbolPos(ref);
    return null;
  }
  function nombreDe(ref) {
    if (!ref) return '';
    if (typeof ref === 'object') return 'el punto que marcaste';
    if (porCodigo[ref]) return nombreCorto(porCodigo[ref]);
    if (/^banco-/.test(ref)) return 'el banco';
    if (/^ar\d{3}$/.test(ref)) return 'el árbol n.º ' + parseInt(ref.slice(2), 10);
    if (ref === 'agua-cercana') return 'la canilla más cercana';
    if (ref === 'banco-cercano') return 'el banco más cercano';
    return ref;
  }

  // Dónde «se llega» a un lugar: celdas de la red y, si queda afuera del alambrado, el tramo exterior
  function terminal(ref) {
    if (!red) return null;
    var S = red.S;
    if (ref === 'agua-cercana' || ref === 'banco-cercano') {
      var celdas = [];
      (ref === 'agua-cercana' ? lugares.filter(function (l) { return l.icono === 'agua' && ubicado(l); }).map(function (l) { return [cx(l.col), cy(l.fila)]; }) : BANCOS)
        .forEach(function (p) { celdas = celdas.concat(red.cerca(p[0], p[1], 1.2, 4)); });
      return celdas.length ? { opciones: [{ celdas: celdas, extra: null }] } : null;
    }
    if (typeof ref === 'string') {
      var l = porCodigo[ref], clave = (l && l.ruta) || ref;
      if (S.exteriores && S.exteriores[clave]) {
        return { opciones: S.exteriores[clave].map(function (t) { return { celdas: red.llegadas[t.por] || [], extra: t.puntos }; }) };
      }
      if (red.llegadas[ref]) return { opciones: [{ celdas: red.llegadas[ref], extra: null }] };
    }
    var p = puntoDe(ref);
    if (!p) return null;
    var c = red.cerca(p[0], p[1], typeof ref === 'object' ? 0.6 : 1.2, 4);
    return c.length ? { opciones: [{ celdas: c, extra: null }] } : null;
  }
  function largo(pts) {
    var s = 0;
    for (var i = 1; pts && i < pts.length; i++) s += Math.sqrt(Math.pow(pts[i][0] - pts[i - 1][0], 2) + Math.pow(pts[i][1] - pts[i - 1][1], 2));
    return s * 2;
  }
  function calcularRuta(desde, hasta, modo) {
    var A = terminal(desde), B = terminal(hasta), mejor = null;
    if (!A || !B) return null;
    A.opciones.forEach(function (oa) {
      B.opciones.forEach(function (ob) {
        if (!oa.celdas.length || !ob.celdas.length) return;
        var c = red.camino(oa.celdas, ob.celdas, modo || 'normal');
        if (!c) return;
        var m = c.metrosGrilla * CALIBRE + largo(oa.extra) + largo(ob.extra);
        if (!mejor || m < mejor.metros) {
          mejor = { metros: m, puntos: c.puntos, antes: oa.extra ? oa.extra.slice().reverse() : null, despues: ob.extra, exterior: !!(oa.extra || ob.extra) };
        }
      });
    });
    return mejor;
  }
  function redondeo(m) { return Math.max(5, 5 * Math.round(m / 5)); }
  function minutos(m) { var n = Math.max(1, Math.round(m / 60)); return n === 1 ? '1 minuto' : n + ' minutos'; }

  // ---------- dibujo de caminos ----------
  function limpiarRutas() { while (grupos.recorridos.firstChild) grupos.recorridos.removeChild(grupos.recorridos.firstChild); }
  function trazo(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(''); }
  function dibujarRuta(r, clase) {
    var g = nodo('g', { 'class': 'ruta ' + (clase || '') }, grupos.recorridos);
    var tramos = [];
    if (r.antes) tramos.push(['afuera', r.antes.concat([r.puntos[0]])]);
    tramos.push(['adentro', r.puntos]);
    if (r.despues) tramos.push(['afuera', [r.puntos[r.puntos.length - 1]].concat(r.despues)]);
    tramos.forEach(function (t) { nodo('path', { 'class': 'casco ' + t[0], d: trazo(t[1]) }, g); });
    tramos.forEach(function (t) { nodo('path', { 'class': 'linea ' + t[0], d: trazo(t[1]) }, g); });
    return g;
  }
  function finRuta(r) { return r.despues ? r.despues[r.despues.length - 1] : r.puntos[r.puntos.length - 1]; }

  // ---------- «Estás acá» y lugar destacado ----------
  function limpiarDestacado() {
    var viejo = svg.querySelector('#aqui');
    if (viejo) viejo.parentNode.removeChild(viejo);
    $$('.ejemplar', svg).forEach(function (c) { c.classList.remove('ejemplar'); c.setAttribute('r', c.getAttribute('data-r') || '0.42'); });
  }
  function grupoAqui() { return svg.querySelector('#aqui') || nodo('g', { id: 'aqui', 'class': 'aqui' }, marcas); }
  function anillo(g, x, y) { nodo('circle', { cx: x, cy: y, r: 2.7, 'class': 'anillo' }, g); }
  function dibujarPartida() {
    var v = svg.querySelector('#partida-aqui');
    if (v) v.parentNode.removeChild(v);
    if (!partida) return;
    var p = puntoDe(partida.ref);
    if (!p) return;
    var g = nodo('g', { id: 'partida-aqui', 'class': 'aqui partida' }, marcas);
    nodo('circle', { cx: p[0], cy: p[1], r: 0.9, 'class': 'punto' }, g);
    var w = 8.2, pg = nodo('g', { 'class': 'pastilla', 'data-recto': p[0] + ' ' + p[1] }, g);
    var px = p[0] - w / 2, py = p[1] - 4.6;
    if (orientacion === 'norte') { px = Math.min(Math.max(px, 0.5), COLS - w - 0.5); if (py < 0.5) py = p[1] + 2.4; }
    nodo('rect', { x: px, y: py, width: w, height: 2.3, rx: 1.15 }, pg);
    texto('Estás acá', { x: px + w / 2, y: py + 1.62 }, pg);
    enderezar(g);
  }
  function destacar(codigo, desplazar) {
    limpiarDestacado();
    var p = puntoDe(codigo);
    if (!p) return false;
    var g = grupoAqui();
    anillo(g, p[0], p[1]);
    if (desplazar) mostrarPlano(p);
    return true;
  }
  function mostrarPlano(p) {
    var r = marco.getBoundingClientRect();
    if (r.top < 0 || r.bottom > (window.innerHeight || 800)) marco.scrollIntoView({ block: 'center' });
    if (p) centrar(p[0], p[1]);
  }
  function centrar(x, y) {
    if (!marco.classList.contains('ampliado') || !lienzo.getScreenCTM) return;
    var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    var s = pt.matrixTransform(lienzo.getScreenCTM()), r = marco.getBoundingClientRect();
    marco.scrollLeft += s.x - (r.left + r.width / 2);
    marco.scrollTop += s.y - (r.top + r.height / 2);
  }

  // ---------- selección (plano ↔ lista) ----------
  var seleccion = null, partida = null, circuito = null;
  function marcarSeleccion(codigo) {
    $$('.marca.on, .banco.on', svg).forEach(function (e) { e.classList.remove('on'); });
    $$('[data-ref].on').forEach(function (e) { e.classList.remove('on'); });
    if (!codigo || typeof codigo !== 'string') return;
    var g = svg.querySelector('[data-codigo="' + codigo + '"]');
    if (g) g.classList.add('on');
    var clave = /^banco-/.test(codigo) ? 'bancos' : codigo;
    var b = $('#referencias [data-ref="' + clave + '"]');
    if (b) {
      b.classList.add('on');
      var aside = $('#referencias');
      if (aside && window.matchMedia && window.matchMedia('(min-width: 900px)').matches && b.scrollIntoView) b.scrollIntoView({ block: 'nearest' });
    }
  }
  function infoLugar(ref) {
    var l = porCodigo[ref], partes = [];
    if (l && l.tipo === 'sector') partes.push('Cartel de sector (C1). Su QR abre el plano y marca «Estás acá» en el sector.');
    if (l && l.qr) partes.push('Cartel ' + esc(l.pieza || '') + ' · su QR: <span class="nw">jbflormalatesta.github.io/?' + esc(l.qr) + '</span>');
    if (l && l.tipo === 'lama') partes.push('Lamas direccionales (' + esc(l.pieza) + '), sin QR' + (l.en ? '.' : '.'));
    if (l && !ubicado(l) && !l.en) partes.push(l.tipo === 'panel' ? 'El panel todavía no está ubicado en el plano.' : 'Todavía no está ubicado en el plano.');
    return partes.length ? '<p class="info">' + partes.join(' ') + '</p>' : '';
  }
  function botonPartida(ref) {
    if (!red || typeof ref !== 'string' || !terminal(ref) || (partida && partida.ref === ref)) return '';
    return '<button type="button" class="boton sec chico" data-salir="' + esc(ref) + '">Estoy acá: salir desde este lugar</button>';
  }
  // Tocar un lugar: se destaca en el plano y en la lista; si ya sabemos dónde estás, se dibuja el camino.
  function tocar(ref, desdeLista) {
    var l = porCodigo[ref];
    seleccion = ref;
    marcarSeleccion(ref);
    if (desdeLista && l) asegurarCapa(CAPA_DE[l.tipo]);
    var p = puntoDe(ref), nombre = l ? descripcion(l) : (/^banco-/.test(ref) ? 'Banco o asiento' : nombreDe(ref));
    if (l && l.en && porCodigo[l.en]) nombre += ' (' + nombreCorto(porCodigo[l.en]) + ')';
    var cercano = ref === 'agua-cercana' || ref === 'banco-cercano';
    if (cercano) {
      nombre = ref === 'agua-cercana' ? 'La canilla más cercana' : 'El banco más cercano';
      if (!partida) { limpiarDestacado(); decir('Para buscar ' + nombreDe(ref) + ', primero elegí dónde estás, en «Estoy en».'); detalle(''); return; }
      p = puntoDe(partida.ref);
    }
    if (!p) {
      limpiarDestacado();
      decir(nombre + '.');
      detalle(infoLugar(ref));
      return;
    }
    if (partida && circuito) quitarCircuito();
    if (partida && red && !mismoLugar(partida.ref, ref)) {
      var r = calcularRuta(partida.ref, ref, 'normal');
      limpiarDestacado();
      if (r) {
        limpiarRutas(); asegurarCapa('recorridos');
        dibujarRuta(r, 'simple');
        var f = finRuta(r); anillo(grupoAqui(), f[0], f[1]);
        if (ref === 'agua-cercana') {
          var ag = lugares.filter(function (x) { return x.icono === 'agua' && ubicado(x); }).sort(function (a, b) {
            return Math.hypot(cx(a.col) - f[0], cy(a.fila) - f[1]) - Math.hypot(cx(b.col) - f[0], cy(b.fila) - f[1]); })[0];
          if (ag) nombre += ' · ' + ag.nota;
        }
        decir(nombre + '.');
        detalle('<p class="ruta-texto"><b>Desde ' + esc(nombreDe(partida.ref)) + ': unos ' + redondeo(r.metros) + ' m por los senderos, ' +
          minutos(r.metros) + ' a pie.</b>' + (r.exterior ? ' El tramo de afuera del alambrado es aproximado.' : '') + '</p>' + infoLugar(ref));
        if (desdeLista) mostrarPlano(p);
        sincronizarDestino(ref);
        return;
      }
    }
    destacar(ref, !!desdeLista);
    decir(nombre + '.');
    detalle(infoLugar(ref) + (partida ? '' : (red ? '<p class="pista">Para ver cómo llegar, elegí abajo dónde estás o tocá «Estoy acá» en el lugar donde estés.</p>' : '')) + botonPartida(ref));
    sincronizarDestino(ref);
  }
  function mismoLugar(a, b) {
    if (a === b) return true;
    var pa = puntoDe(a), pb = puntoDe(b);
    return !!(pa && pb && Math.abs(pa[0] - pb[0]) < 0.01 && Math.abs(pa[1] - pb[1]) < 0.01);
  }

  // ---------- punto de partida ----------
  function fijarPartida(ref, motivo) {
    if (!ref) { partida = null; sesion.set('partida', null); dibujarPartida(); sincronizarPartida(); return false; }
    var l = typeof ref === 'string' ? porCodigo[ref] : null;
    if (!red && !(l && ubicado(l))) return false;
    if (red && !terminal(ref) && !(l && ubicado(l))) { decir('Ese lugar todavía no está ubicado en el plano.'); return false; }
    partida = { ref: ref };
    sesion.set('partida', ref);
    dibujarPartida();
    sincronizarPartida();
    if (motivo !== 'silencio') {
      decir('Estás acá: ' + (l ? nombreCorto(l) : nombreDe(ref)) + '.');
      detalle(red ? '<p class="pista">Tocá un lugar del plano o de la lista, o elegí un destino abajo, y te mostramos el camino por los senderos.</p>' : '');
    }
    return true;
  }

  // ---------- controles «Cómo llegar» ----------
  var selPartida = $('#partida'), selDestino = $('#destino'), selCircuito = $('#circuito'), cajaRuteo = $('#ruteo');
  function opciones(lista) {
    return lista.map(function (o) {
      if (o.grupo) return '<optgroup label="' + esc(o.grupo) + '">' + opciones(o.items) + '</optgroup>';
      return '<option value="' + esc(o.v) + '"' + (o.off ? ' disabled' : '') + '>' + esc(o.t) + '</option>';
    }).join('');
  }
  function itemsTipo(f, sinUbicar) {
    return lugares.filter(f).map(function (l) {
      var u = ubicado(l) || (l.en && ubicado(porCodigo[l.en]));
      return { v: l.codigo, t: nombreCorto(l) + (l.tipo === 'servicio' && l.icono === 'agua' && l.nota ? ' · ' + l.nota : '') + (u ? '' : ' (todavía sin ubicar)'), off: !u && !sinUbicar };
    });
  }
  if (cajaRuteo && red) {
    selPartida.innerHTML = opciones([{ v: '', t: 'Elegí dónde estás…' },
      { grupo: 'Carteles con QR', items: itemsTipo(function (l) { return l.tipo === 'totem' || l.tipo === 'cartel' || l.tipo === 'panel'; }) },
      { grupo: 'Sectores', items: itemsTipo(function (l) { return l.tipo === 'sector'; }) },
      { grupo: 'Accesos', items: itemsTipo(function (l) { return l.tipo === 'puerta' || l.tipo === 'acceso'; }) },
      { grupo: 'Servicios', items: itemsTipo(function (l) { return l.tipo === 'servicio'; }) },
      { grupo: 'Otro lugar', items: [{ v: 'marcar', t: 'Lo marco tocando el plano' }] }]);
    selDestino.innerHTML = opciones([{ v: '', t: 'Elegí un destino…' },
      { grupo: 'Sectores', items: itemsTipo(function (l) { return l.tipo === 'sector' || l.tipo === 'referencia'; }) },
      { grupo: 'Servicios', items: [{ v: 'banos', t: 'Baños' }, { v: 'agua-cercana', t: 'La canilla más cercana' }, { v: 'banco-cercano', t: 'El banco más cercano' }]
        .concat(itemsTipo(function (l) { return l.icono === 'agua'; })) },
      { grupo: 'Cartelería', items: itemsTipo(function (l) { return CAPA_DE[l.tipo] === 'carteles'; }) },
      { grupo: 'Accesos y transporte', items: itemsTipo(function (l) { return CAPA_DE[l.tipo] === 'accesos'; }) }]);
    selCircuito.innerHTML = opciones([{ v: '', t: 'Ninguno' }].concat(RECORRIDOS.map(function (r) { return { v: r.codigo, t: r.nombre }; })));
    cajaRuteo.hidden = false;
    selPartida.addEventListener('change', function () {
      var v = selPartida.value;
      if (v === 'punto') return;
      modoMarcar = v === 'marcar';
      if (modoMarcar) { marco.classList.add('marcando'); decir('Tocá en el plano el lugar donde estás.'); detalle(''); return; }
      marco.classList.remove('marcando');
      fijarPartida(v || null);
      if (!v) { decir(''); detalle(''); limpiarRutas(); }
      else if (seleccion && seleccion !== v) tocar(seleccion);
    });
    selDestino.addEventListener('change', function () { if (selDestino.value) { if (circuito) quitarCircuito(); tocar(selDestino.value, true); } });
    selCircuito.addEventListener('change', function () { if (selCircuito.value) elegirCircuito(selCircuito.value, false); else quitarCircuito(true); });
    $('#borrar-ruta').addEventListener('click', function () {
      quitarCircuito(true); limpiarRutas(); limpiarDestacado(); marcarSeleccion(null); seleccion = null;
      selDestino.value = ''; decir(partida ? 'Estás acá: ' + nombreDe(partida.ref) + '.' : ''); detalle('');
    });
  }
  function sincronizarPartida() {
    if (!selPartida) return;
    var v = partida && typeof partida.ref === 'string' ? partida.ref : '';
    if (partida && typeof partida.ref === 'object') {
      var o = selPartida.querySelector('option[value="punto"]');
      if (!o) { o = document.createElement('option'); o.value = 'punto'; o.textContent = 'El punto que marqué en el plano'; selPartida.appendChild(o); }
      v = 'punto';
    }
    selPartida.value = selPartida.querySelector('option[value="' + v + '"]') ? v : '';
  }
  function sincronizarDestino(ref) {
    if (selDestino) selDestino.value = selDestino.querySelector('option[value="' + ref + '"]') ? ref : '';
  }
  var modoMarcar = false;
  if (ficha) ficha.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-salir]');
    if (b) { fijarPartida(b.getAttribute('data-salir')); return; }
    var q = ev.target.closest && ev.target.closest('[data-parada]');
    if (q) { var ref = q.getAttribute('data-parada'), p = puntoDe(ref); marcarSeleccion(ref); limpiarDestacado(); if (p) { anillo(grupoAqui(), p[0], p[1]); mostrarPlano(p); } decir(nombreDe(ref) + '.'); }
  });

  // ---------- recorridos sugeridos ----------
  function quitarCircuito(limpiar) {
    circuito = null;
    if (selCircuito) selCircuito.value = '';
    $$('.recorrido-tarjeta.on').forEach(function (t) { t.classList.remove('on'); });
    if (limpiar) { limpiarRutas(); detalle(''); }
    sesion.set('circuito', null);
  }
  function elegirCircuito(codigo, desplazar) {
    var R = RECORRIDOS.filter(function (r) { return r.codigo === codigo; })[0];
    if (!R || !red) return;
    circuito = codigo;
    sesion.set('circuito', codigo);
    if (selCircuito) selCircuito.value = codigo;
    $$('.recorrido-tarjeta').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-circuito') === codigo); });
    limpiarRutas(); limpiarDestacado(); marcarSeleccion(null);
    asegurarCapa('recorridos');
    var total = 0, ant = null, items = [], sinUbicar = [], n = 0;
    var gNum = nodo('g', { 'class': 'paradas' }, null);
    (R.paradas || []).forEach(function (pa) {
      var p = puntoDe(pa.lugar), t = terminal(pa.lugar), l = porCodigo[pa.lugar];
      var nombre = l ? nombreCorto(l) : nombreDe(pa.lugar);
      if (!p || !t) { sinUbicar.push(nombre); items.push('<li class="sin-ubicar"><span class="n">·</span><div><b>' + esc(nombre) + '</b> <small>(todavía no está ubicado en el plano)</small>' + (pa.texto ? '<p>' + esc(pa.texto) + '</p>' : '') + '</div></li>'); return; }
      n++;
      var tramo = '';
      if (ant) {
        var r = calcularRuta(ant, pa.lugar, R.modo);
        if (r) { dibujarRuta(r, 'circuito'); total += r.metros; tramo = '<span class="tramo">' + redondeo(r.metros) + ' m</span>'; }
      }
      ant = pa.lugar;
      var g = nodo('g', { 'class': 'parada', 'data-recto': p[0] + ' ' + p[1] }, gNum);
      nodo('circle', { cx: p[0] + 1.6, cy: p[1] - 1.6, r: 1.15 }, g);      // al costado: no tapa el número del sector
      texto(String(n), { x: p[0] + 1.6, y: p[1] - 1.6 + 0.46 }, g);
      items.push('<li><span class="n">' + n + '</span><div><button type="button" class="enlace" data-parada="' + esc(pa.lugar) + '">' + esc(nombre) + '</button>' + tramo +
        (pa.texto ? '<p>' + esc(pa.texto) + '</p>' : '') + '</div></li>');
    });
    grupos.recorridos.appendChild(gNum);
    enderezar(gNum);
    decir(R.nombre + ': unos ' + redondeo(total) + ' m a pie' + (R.minutos ? ', unos ' + R.minutos + ' minutos con las paradas' : '') + '.');
    detalle('<div class="circuito-detalle">' + (R.descripcion ? '<p>' + esc(R.descripcion) + '</p>' : '') +
      '<ol class="paradas-lista">' + items.join('') + '</ol>' +
      (sinUbicar.length ? '<p class="nota">' + esc(sinUbicar.join(' y ')) + ': cuando el equipo lo ubique en el plano, el recorrido lo va a incluir solo.</p>' : '') + '</div>');
    if (desplazar) mostrarPlano();
  }
  var listaRec = $('#recorridos-lista');
  if (listaRec && RECORRIDOS.length && red) {
    listaRec.innerHTML = RECORRIDOS.map(function (r) {
      var nombres = (r.paradas || []).map(function (p) { var l = porCodigo[p.lugar]; return l ? (l.tipo === 'sector' ? l.nombre : nombreCorto(l)) : p.lugar; });
      return '<div class="tarjeta recorrido-tarjeta" data-circuito="' + esc(r.codigo) + '"><p class="codigo">' + (r.minutos ? 'Unos ' + r.minutos + ' minutos' : 'Recorrido') + '</p>' +
        '<h3 class="titulo">' + esc(r.nombre) + '</h3><p>' + esc(r.descripcion || '') + '</p><p class="paradas-resumen">' + esc(nombres.join(' → ')) + '</p>' +
        '<div class="botones"><button type="button" class="boton sec" data-ver-circuito="' + esc(r.codigo) + '">Ver en el plano</button></div></div>';
    }).join('');
    listaRec.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-ver-circuito]');
      if (b) elegirCircuito(b.getAttribute('data-ver-circuito'), true);
    });
  }

  // ---------- lista de referencias (se genera de datos/plano.js) ----------
  var lista = $('#lista-referencias');
  function swatch(l) {
    switch (l.tipo) {
      case 'sector': return '<span class="sw sector" aria-hidden="true">' + numSector(l) + '</span>';
      case 'referencia': return '<span class="sw ref" aria-hidden="true">' + esc(l.letra || '·') + '</span>';
      case 'servicio': return l.icono === 'agua'
        ? '<span class="sw agua" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M6 1.4c2.4 2.7 2.3 4.5 2.3 5.4a2.3 2.3 0 0 1-4.6 0c0-.9-.1-2.7 2.3-5.4z"/></svg></span>'
        : '<span class="sw servicio" aria-hidden="true">WC</span>';
      case 'puerta': return '<span class="sw puerta" aria-hidden="true"></span>';
      case 'acceso': return '<span class="sw acceso2" aria-hidden="true"><svg viewBox="0 0 14 14"><path d="' + (l.col >= COLS ? 'M11.5 7H3M6.5 3.5 3 7l3.5 3.5' : 'M7 2.5v8.5M3.5 7.5 7 11l3.5-3.5') + '"/></svg></span>';
      case 'parada': return '<span class="sw parada" aria-hidden="true"><svg viewBox="0 0 14 14"><path fill-rule="evenodd" d="M3.2 2.2h7.6a1.2 1.2 0 0 1 1.2 1.2v6.2a1 1 0 0 1-1 1h-.5V12H8.7v-1.4H5.3V12H3.5v-1.4H3a1 1 0 0 1-1-1V3.4a1.2 1.2 0 0 1 1.2-1.2zM3.6 3.6h6.8v2.8H3.6z"/></svg></span>';
      case 'cruce': return '<span class="sw cruce" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></span>';
      case 'totem': case 'cartel': return '<span class="sw cartel" aria-hidden="true">' + esc(etiqueta(l)) + '</span>';
      case 'lama': return '<span class="sw lama" aria-hidden="true">L</span>';
      default: return '<span class="sw panel" aria-hidden="true">P</span>';
    }
  }
  function item(l) {
    var u = ubicado(l) || (l.en && ubicado(porCodigo[l.en]));
    var sub = l.tipo === 'servicio' && l.icono === 'agua' ? l.nota : (l.nota || '');
    if (l.qr) sub = (sub ? sub + ' · ' : '') + 'QR ?' + l.qr;
    if (!u) sub = (sub ? sub + ' · ' : '') + 'todavía sin ubicar';
    return '<li><button type="button" class="ref-boton" data-ref="' + esc(l.codigo) + '">' + swatch(l) + '<span>' + esc(l.tipo === 'servicio' && l.icono === 'agua' ? 'Agua potable' : l.nombre) +
      (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></button></li>';
  }
  if (lista) {
    var bloques = [
      ['Sectores', function (l) { return l.tipo === 'sector'; }],
      ['En el vivero', function (l) { return l.tipo === 'referencia'; }],
      ['Servicios', function (l) { return l.tipo === 'servicio'; }, BANCOS.length ? '<li><button type="button" class="ref-boton" data-ref="bancos"><span class="sw banco" aria-hidden="true"></span><span>Bancos y asientos<small>' + BANCOS.length + ' en el Jardín</small></span></button></li>' : ''],
      ['Accesos y transporte', function (l) { return CAPA_DE[l.tipo] === 'accesos'; }],
      ['Cartelería y QR', function (l) { return CAPA_DE[l.tipo] === 'carteles'; }, '<li class="sin-boton"><span class="sw sector" aria-hidden="true">1</span><span>Carteles de sector (C1)<small>Uno por sector, con QR ?S-01 a ?S-06</small></span></li>'],
      ['Árboles', function () { return false; }, '<li class="sin-boton"><span class="sw arbol" aria-hidden="true"></span><span>' + $$('#arboles circle', svg).length + ' árboles relevados<small>Tocá uno en el plano para ver su número</small></span></li>']
    ];
    lista.innerHTML = bloques.map(function (b) {
      var h = lugares.filter(b[1]).map(item).join('') + (b[2] || '');
      return h ? '<h3>' + b[0] + '</h3><ul>' + h + '</ul>' : '';
    }).join('');
    lista.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-ref]');
      if (!b) return;
      var ref = b.getAttribute('data-ref');
      if (ref === 'bancos') {
        asegurarCapa('servicios'); limpiarDestacado(); marcarSeleccion(null); b.classList.add('on');
        $$('.banco', svg).forEach(function (g) { g.classList.add('on'); });
        decir('Bancos y asientos: ' + BANCOS.length + ' en el Jardín.');
        detalle(partida && red ? '<p class="pista">¿Querés descansar? En «Quiero ir a», elegí «El banco más cercano».</p>' : '');
        mostrarPlano();
        return;
      }
      tocar(ref, true);
    });
  }

  // ---------- tarjetas de sectores: «Ver en el plano» ----------
  $$('[data-lugar]').forEach(function (tarjeta) {
    var c = tarjeta.getAttribute('data-lugar');
    var p = document.createElement('p');
    p.className = 'en-plano';
    if (ubicado(porCodigo[c])) {
      var a = document.createElement('a');
      a.href = '#' + c;
      a.textContent = 'Ver en el plano';
      a.addEventListener('click', function (ev) { ev.preventDefault(); abrirPestana('plano'); tocar(c, true); mostrarPlano(puntoDe(c)); });
      p.appendChild(a);
    } else {
      p.textContent = porCodigo[c] && porCodigo[c].tipo === 'panel' ? 'Panel en preparación.' : 'Muy pronto, en el plano.';
    }
    tarjeta.insertBefore(p, tarjeta.querySelector('.botones'));
  });

  // ---------- toques en el plano ----------
  function puntoToque(ev) {
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(lienzo.getScreenCTM().inverse());
  }
  function arbolCercano(q, lim) {
    var mejor = null, dmin = lim;
    $$('#arboles circle', svg).forEach(function (c) {
      var d = Math.sqrt(Math.pow(+c.getAttribute('cx') - q.x, 2) + Math.pow(+c.getAttribute('cy') - q.y, 2));
      if (d < dmin) { dmin = d; mejor = c.id; }
    });
    return mejor;
  }
  svg.addEventListener('click', function (ev) {
    var q = puntoToque(ev);
    if (modoMarcar) {
      modoMarcar = false; marco.classList.remove('marcando');
      if (!fijarPartida({ x: +q.x.toFixed(2), y: +q.y.toFixed(2) })) { decir('Ahí no hay un sendero cerca: tocá un punto de los senderos.'); }
      else if (seleccion) tocar(seleccion);
      return;
    }
    var m = ev.target.closest && ev.target.closest('.marca, .banco');
    var dentro = q.x >= 0 && q.x <= COLS && q.y >= 0 && q.y <= FILAS;
    if (m && !(marco.classList.contains('con-cuadricula') && dentro)) { tocar(m.getAttribute('data-codigo')); return; }
    if (marco.classList.contains('con-cuadricula') && dentro) {      // herramienta técnica: columna y fila de cualquier punto
      var col = Math.floor(q.x) + 1, fila = FILAS - Math.floor(q.y), ar = arbolCercano(q, 0.9);
      var viejo = svg.querySelector('#toque');
      if (viejo) viejo.parentNode.removeChild(viejo);
      var g = nodo('g', { id: 'toque' }, marcas);
      nodo('rect', { x: col - 1, y: FILAS - fila, width: 1, height: 1 }, g);
      decir('Columna ' + col + ' · Fila ' + fila + (ar ? ' · árbol ' + ar : ''));
      return;
    }
    if (capaVisible('arboles') && dentro) {
      var a = arbolCercano(q, 1.1);
      if (a) {
        var cc = svg.querySelector('#' + a);
        tocar(a);
        decir('Árbol n.º ' + parseInt(a.slice(2), 10) + ' · Columna ' + (Math.floor(+cc.getAttribute('cx')) + 1) + ' · Fila ' + (FILAS - Math.floor(+cc.getAttribute('cy'))) + '.');
      }
    }
  });
  svg.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var m = ev.target.closest && ev.target.closest('.marca');
    if (m) { ev.preventDefault(); tocar(m.getAttribute('data-codigo')); }
  });

  // ---------- ejemplares de una especie (desde la ficha: plano/#A-71) ----------
  function especie(codigo) {
    limpiarDestacado();
    var E = (window.ESPECIES || []).filter(function (x) { return x.codigo === codigo; })[0];
    if (RESERVADAS.indexOf(codigo) >= 0 || (E && E.ubicacion === 'reservada')) {
      decir('Para cuidar esta especie, no publicamos dónde está cada ejemplar.');
      return;
    }
    var lista = ejemplares[codigo];
    if (!lista || !lista.length) { decir(''); return; }
    var g = grupoAqui(), n = 0;
    lista.forEach(function (e) {
      if (typeof e === 'string') {
        var c = svg.querySelector('#' + e.replace(/[^\w-]/g, ''));
        if (!c) return;
        c.setAttribute('data-r', c.getAttribute('r')); c.setAttribute('r', '0.8'); c.classList.add('ejemplar');
        anillo(g, +c.getAttribute('cx'), +c.getAttribute('cy')); n++;
      } else if (ubicado(e)) {
        nodo('circle', { cx: cx(e.col), cy: cy(e.fila), r: 0.8, 'class': 'ejemplar' }, g);
        anillo(g, cx(e.col), cy(e.fila)); n++;
      }
    });
    if (!n) { decir(''); return; }
    decir((E ? E.nombre + ' (' + codigo + ')' : codigo) + ': ' + (n === 1 ? 'un ejemplar marcado' : n + ' ejemplares marcados') + ' en el plano.');
    mostrarPlano();
  }

  // ---------- pestañas ----------
  var PEST = { plano: ['tab-plano', 'vista-plano'], mes: ['tab-mes', 'mes-a-mes'], indicadores: ['tab-indicadores', 'indicadores'] };
  var cajaPest = $('#pestanas'), pestana = 'plano';
  function abrirPestana(clave, foco, marcarHash) {
    if (!cajaPest || !PEST[clave]) return;
    pestana = clave;
    for (var k in PEST) {
      var b = document.getElementById(PEST[k][0]), v = document.getElementById(PEST[k][1]), on = k === clave;
      if (b) { b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
      if (v) { v.hidden = !on; v.classList.toggle('activa', on); }
    }
    if (foco) document.getElementById(PEST[clave][0]).focus();
    if (clave === 'mes') pintarMes();
    if (marcarHash && history.replaceState) history.replaceState(null, '', clave === 'plano' ? location.pathname + location.search : '#' + PEST[clave][1]);
    guardado.set('pestana', clave);
  }
  if (cajaPest) {
    cajaPest.hidden = false;
    document.body.classList.add('con-pestanas');
    Object.keys(PEST).forEach(function (k, i, todas) {
      var b = document.getElementById(PEST[k][0]);
      b.addEventListener('click', function () { abrirPestana(k, false, true); });
      b.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (d) { ev.preventDefault(); abrirPestana(todas[(i + d + todas.length) % todas.length], true, true); }
      });
    });
    abrirPestana('plano');
  }
  var bImp = $('#imprimir-ficha');
  if (bImp) { bImp.hidden = false; bImp.addEventListener('click', function () { window.print(); }); }

  // ---------- El Jardín mes a mes ----------
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var ESTACIONES = [['Primavera', [8, 9, 10], 'septiembre a noviembre'], ['Verano', [11, 0, 1], 'diciembre a febrero'],
    ['Otoño', [2, 3, 4], 'marzo a mayo'], ['Invierno', [5, 6, 7], 'junio a agosto']];
  var mesHoy = new Date(Date.now() - 3 * 3600 * 1000).getUTCMonth();   // hora de Argentina
  var mesSel = [mesHoy], mesNombre = MESES[mesHoy], soloNativas = false;
  function enMeses(txt) {
    var on = [false, false, false, false, false, false, false, false, false, false, false, false];
    String(txt || '').toLowerCase().split(',').forEach(function (r) {
      var p = r.trim().split('-'), a = CORTOS.indexOf((p[0] || '').trim().slice(0, 3)), b = p[1] ? CORTOS.indexOf(p[1].trim().slice(0, 3)) : a;
      if (a < 0 || b < 0) return;
      for (var k = a, n = 0; n < 12; k = (k + 1) % 12, n++) { on[k] = true; if (k === b) break; }
    });
    return on;
  }
  // "sep-nov, feb" → «septiembre a noviembre y febrero»; "ene-dic" → «todo el año»
  function mesesTexto(txt) {
    var partes = String(txt || '').toLowerCase().split(',').map(function (r) {
      var p = r.trim().split('-'), a = CORTOS.indexOf((p[0] || '').trim().slice(0, 3)), z = p[1] ? CORTOS.indexOf(p[1].trim().slice(0, 3)) : a;
      if (a < 0 || z < 0) return '';
      if ((z + 1) % 12 === a) return 'todo el año';
      return a === z ? MESES[a] : MESES[a] + ' a ' + MESES[z];
    }).filter(Boolean);
    return partes.length > 1 ? partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] : (partes[0] || '');
  }
  function indiceEspecies() { var m = {}; (window.ESPECIES || []).forEach(function (e) { m[e.codigo] = e; }); return m; }
  var cargando = false, esperan = [];
  function conEspecies(fn) {
    if (window.ESPECIES) { fn(); return; }
    esperan.push(fn);
    if (cargando) return;
    cargando = true;
    var s = document.createElement('script');
    s.src = '../datos/especies.js';
    s.onload = s.onerror = function () { var l = esperan; esperan = []; l.forEach(function (f) { f(); }); };
    document.head.appendChild(s);
  }
  function sectoresDe() {
    var m = {}, S = MES.sectores || {};
    Object.keys(S).forEach(function (s) {
      (S[s].especies || []).forEach(function (c) { if (SIN_SECTOR.indexOf(c) < 0) (m[c] = m[c] || []).push(s); });
    });
    return m;
  }
  function primeraFrase(t) {
    t = String(t || '').trim();
    var m = t.match(/^[^.]{20,}?[.!?](\s|$)/);
    var f = m ? m[0].trim() : t;
    return f.length > 170 ? f.slice(0, 167).replace(/\s+\S*$/, '') + '…' : f;
  }
  function chipSector(s) {
    var l = porCodigo[s];
    if (!l) return '';
    var n = l.tipo === 'sector' ? numSector(l) + ' · ' + l.nombre : l.nombre.replace(/^Panel /, '');
    return '<button type="button" class="chip" data-ir="' + esc(s) + '">' + esc(n) + '</button>';
  }
  function itemMes(c, E, sec, tipo) {
    var e = E[c], dato = (MES.especies || {})[c] || {};
    var nombre = e ? e.nombre : c, cient = e ? e.cientifico : '';
    var donde = (sec[c] || []).map(chipSector).join('');
    return '<li><div class="cab"><a href="../coleccion/?' + esc(c) + '"><b>' + esc(nombre) + '</b></a>' + (cient ? ' <i>' + esc(cient) + '</i>' : '') +
      (e ? ' <span class="origen ' + (e.origen === 'nativa' ? 'nat' : 'exo') + '">' + esc(e.origen) + '</span>' : '') + '</div>' +
      '<p class="cuando">' + (tipo === 'flor' ? 'Flor: ' + esc(mesesTexto(dato.flor)) : (dato.fuente === 'tabla' ? 'Época de colecta: ' : 'Frutos: ') + esc(mesesTexto(dato.fruto))) + '</p>' +
      (donde ? '<p class="donde">Dónde verla: ' + donde + '</p>' : '') +
      (e && e.fauna ? '<p class="fauna">' + esc(primeraFrase(e.fauna)) + '</p>' : '') + '</li>';
  }
  function pintarMes() {
    var cajaC = $('#mes-controles');
    if (!cajaC || !MES.especies) return;
    if (cajaC.hidden) {
      $('#meses').innerHTML = CORTOS.map(function (m, i) { return '<button type="button" data-mes="' + i + '" aria-label="' + MESES[i] + '">' + m + '</button>'; }).join('');
      $('#estaciones').innerHTML = ESTACIONES.map(function (e, i) { return '<button type="button" data-estacion="' + i + '">' + e[0] + '</button>'; }).join('');
      cajaC.hidden = false;
      cajaC.addEventListener('click', function (ev) {
        var b = ev.target.closest && ev.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-mes')) { var i = +b.getAttribute('data-mes'); mesSel = [i]; mesNombre = MESES[i]; }
        else if (b.hasAttribute('data-estacion')) { var e = ESTACIONES[+b.getAttribute('data-estacion')]; mesSel = e[1]; mesNombre = e[0].toLowerCase() + ' (' + e[2] + ')'; }
        guardado.set('mes', mesSel);
        pintarMes();
        pintarSectores();
      });
      $('#solo-nativas').addEventListener('change', function () { soloNativas = this.checked; pintarMes(); });
    }
    $$('#meses [data-mes]').forEach(function (b) { b.setAttribute('aria-pressed', mesSel.length === 1 && mesSel[0] === +b.getAttribute('data-mes') ? 'true' : 'false'); });
    $$('#estaciones [data-estacion]').forEach(function (b) { b.setAttribute('aria-pressed', mesSel.length > 1 && ESTACIONES[+b.getAttribute('data-estacion')][1][0] === mesSel[0] ? 'true' : 'false'); });
    conEspecies(function () {
      var E = indiceEspecies(), sec = sectoresDe(), flor = [], fruto = [];
      Object.keys(MES.especies).forEach(function (c) {
        var e = E[c];
        if (c === 'H-57' || c === 'H-58' || c === 'H-07' || (e && (e.oculta || e.ubicacion === 'reservada'))) return;
        if (soloNativas && (!e || e.origen !== 'nativa')) return;
        var f = enMeses(MES.especies[c].flor), r = enMeses(MES.especies[c].fruto);
        if (mesSel.some(function (m) { return f[m]; })) flor.push(c);
        if (mesSel.some(function (m) { return r[m]; })) fruto.push(c);
      });
      var orden = function (a, b) { return ((E[a] || {}).nombre || a).localeCompare((E[b] || {}).nombre || b, 'es'); };
      flor.sort(orden); fruto.sort(orden);
      $('#lista-flor').innerHTML = flor.length ? flor.map(function (c) { return itemMes(c, E, sec, 'flor'); }).join('') : '<li class="vacio">Ninguna especie con datos para este mes.</li>';
      $('#lista-fruto').innerHTML = fruto.length ? fruto.map(function (c) { return itemMes(c, E, sec, 'fruto'); }).join('') : '<li class="vacio">Ninguna especie con datos para este mes.</li>';
      $('#mes-listas').hidden = false;
      $('#mes-resumen').innerHTML = 'En <b>' + esc(mesNombre) + '</b>: ' + flor.length + (flor.length === 1 ? ' especie' : ' especies') + ' en flor y ' +
        fruto.length + ' con frutos' + (soloNativas ? ' (solo nativas)' : '') + '.';
      var reg = (MES.region || []).filter(function (x) {
        var f = enMeses(x.flor), r = enMeses(x.fruto);
        x._f = mesSel.some(function (m) { return f[m]; }); x._r = mesSel.some(function (m) { return r[m]; });
        return x._f || x._r;
      });
      var cajaR = $('#region');
      if (cajaR) {
        cajaR.hidden = !reg.length;
        $('#lista-region').innerHTML = reg.map(function (x) {
          return '<li><b>' + esc(x.nombre.charAt(0).toUpperCase() + x.nombre.slice(1)) + '</b> <i>' + esc(x.cientifico) + '</i> · ' +
            [x._f ? 'en flor' : '', x._r ? 'época de colecta' : ''].filter(Boolean).join(' y ') + '</li>';
        }).join('');
      }
    });
  }
  // En cada tarjeta de sector: especies para ver y qué pasa este mes
  function pintarSectores() {
    var S = MES.sectores || {};
    conEspecies(function () {
      var E = indiceEspecies();
      Object.keys(S).forEach(function (s) {
        var t = document.querySelector('[data-lugar="' + s + '"]'), lista = (S[s].especies || []).filter(function (c) { return SIN_SECTOR.indexOf(c) < 0 && E[c] && !E[c].oculta; });
        if (!t || !lista.length) return;
        var caja = t.querySelector('.sector-especies');
        if (!caja) { caja = document.createElement('div'); caja.className = 'sector-especies'; t.insertBefore(caja, t.querySelector('.en-plano')); }
        var flor = 0, fruto = 0;
        lista.forEach(function (c) {
          var d = (MES.especies || {})[c];
          if (!d) return;
          var f = enMeses(d.flor), r = enMeses(d.fruto);
          if (mesSel.some(function (m) { return f[m]; })) flor++;
          if (mesSel.some(function (m) { return r[m]; })) fruto++;
        });
        caja.innerHTML = '<p class="sub">Para ver acá</p><p class="especies">' + lista.map(function (c) {
          return '<a href="../coleccion/?' + esc(c) + '">' + esc(E[c].nombre) + '</a>';
        }).join(', ') + '</p>' + ((flor || fruto) ? '<p class="mes-sector">En ' + esc(mesNombre) + ': ' + [flor ? flor + ' en flor' : '', fruto ? fruto + ' con frutos' : ''].filter(Boolean).join(' y ') + '.</p>' : '') +
          (S[s].revisar ? '<p class="revisar">Selección en revisión por el equipo del Jardín.</p>' : '');
      });
    });
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-ir]');
    if (!b) return;
    var c = b.getAttribute('data-ir');
    abrirPestana('plano', false, true);
    tocar(c, true);
    if (!ubicado(porCodigo[c])) { var t = document.getElementById(c); if (t) t.scrollIntoView({ block: 'center' }); }
  });

  // ---------- herramientas: ampliar ----------
  var bAmp = $('#ampliar');
  if (bAmp) bAmp.addEventListener('click', function () {
    var on = marco.classList.toggle('ampliado');
    bAmp.setAttribute('aria-pressed', on ? 'true' : 'false');
    bAmp.textContent = on ? 'Achicar' : 'Ampliar';
    var p = puntoDe(seleccion) || (partida && puntoDe(partida.ref));
    if (on && p) setTimeout(function () { centrar(p[0], p[1]); }, 30);
  });

  // ---------- según la dirección (QR, enlaces) ----------
  var qr = (location.search.match(/[?&]qr=([^&#]*)/) || [])[1];
  try { qr = qr ? decodeURIComponent(qr) : ''; } catch (e) { qr = ''; }
  function segunDireccion(inicio) {
    var h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) {}
    if (!h) return false;
    if (h === 'mes-a-mes') { abrirPestana('mes'); return true; }
    if (h === 'indicadores') { abrirPestana('indicadores'); return true; }
    if (h === 'vista-plano') { abrirPestana('plano'); return true; }
    var rc = /^recorrido-(.+)$/.exec(h);
    if (rc) { abrirPestana('plano'); elegirCircuito(rc[1], true); return true; }
    var c = normalizar(h);
    if (/^[AH]-\d\d$/.test(c)) { abrirPestana('plano'); conEspecies(function () { especie(c); }); return true; }
    var l = porCodigo[c];
    if (!l) return false;
    abrirPestana('plano');
    var aca = l.tipo === 'totem' || (inicio && qr && (normalizar(qr) === c || (qr === 'plano' && c === 'cartel-plano')));
    if (aca) {
      if (!ubicado(l)) { decir(l.tipo === 'panel' ? 'Este panel todavía no está ubicado en el plano. Este es el plano del Jardín.' : 'Este es el plano del Jardín.'); mostrarPlano(); return true; }
      if (inicio && guardado.get('orientacion', null) === null && (c === 'cartel-plano' || c === 'T-01')) orientar('ingreso', false);
      fijarPartida(c);
      destacar(c, false);
      mostrarPlano(puntoDe(c));
      return true;
    }
    tocar(c, false);
    return true;
  }

  // ---------- arranque ----------
  orientar(guardado.get('orientacion', 'norte'), false);
  if (red) red.calcularSombra($$('#arboles circle', svg).map(function (c) { return [+c.getAttribute('cx'), +c.getAttribute('cy')]; }), 2.2);
  var mesGuardado = guardado.get('mes', null);
  if (mesGuardado && mesGuardado.length) {
    mesSel = mesGuardado;
    var est = ESTACIONES.filter(function (e) { return e[1][0] === mesSel[0] && mesSel.length > 1; })[0];
    mesNombre = est ? est[0].toLowerCase() + ' (' + est[2] + ')' : MESES[mesSel[0]];
  }
  var hubo = segunDireccion(true);
  if (!hubo) {
    var pg = sesion.get('partida', null);
    if (pg) fijarPartida(pg, 'silencio');
    var cg = sesion.get('circuito', null);
    if (cg) elegirCircuito(cg, false);
    var pt = guardado.get('pestana', 'plano');
    if (pt !== 'plano') abrirPestana(pt);
  }
  if (/[?&]cuadricula\b/.test(location.search)) aplicarCapa('cuadricula', true, false);
  window.addEventListener('hashchange', function () { segunDireccion(false); });
  setTimeout(pintarSectores, 300);
})();
