/*
 * Plano del Jardín: marcas de sectores, servicios, accesos y referencias, «Estás acá», ejemplares
 * de la colección, cuadrícula de ayuda y ampliación. Los lugares se editan en datos/plano.js.
 */
(function () {
  'use strict';
  var P = window.PLANO || {};
  var lugares = P.lugares || [];
  var ejemplares = P.ejemplares || {};
  var svg = document.getElementById('plano');
  var marco = document.getElementById('plano-marco');
  var estado = document.getElementById('plano-estado');
  if (!svg || !marco) return;
  var marcas = svg.querySelector('#marcas');
  var NS = 'http://www.w3.org/2000/svg';
  var COLS = 56, FILAS = 68;

  function cx(col) { return col - 0.5; }
  function cy(fila) { return FILAS + 0.5 - fila; }
  function nodo(tag, attrs, padre) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function texto(t, attrs, padre) { var e = nodo('text', attrs, padre); e.textContent = t; return e; }
  function ubicado(l) { return l && typeof l.col === 'number' && typeof l.fila === 'number'; }
  function decir(t) { if (estado) estado.textContent = t; }
  function normalizar(c) {
    var m = String(c).trim().match(/^([a-z])\s*-?\s*(\d{1,2})$/i);
    return m ? m[1].toUpperCase() + '-' + (m[2].length < 2 ? '0' + m[2] : m[2]) : String(c).trim();
  }
  function descripcion(l) {
    var n = l.tipo === 'sector' ? l.nombre + ' (sector ' + parseInt(l.codigo.slice(2), 10) + ')' : l.nombre;
    return l.nota ? n + ' · ' + l.nota : n;
  }
  var GOTA = 'c.62.72.6 1.2.6 1.44a.6.6 0 0 1-1.2 0c0-.24-.02-.72.6-1.44z';

  // ---- marcas de los lugares ubicados ----
  var porCodigo = {};
  lugares.forEach(function (l) {
    porCodigo[l.codigo] = l;
    if (!ubicado(l) || l.tipo === 'totem') return;
    var x = cx(l.col), y = cy(l.fila);
    var g = nodo('g', { 'class': 'marca ' + l.tipo, id: 'm-' + l.codigo }, marcas);
    nodo('title', {}, g).textContent = descripcion(l);
    if (l.tipo === 'sector') {
      nodo('circle', { cx: x, cy: y, r: 1.5 }, g);
      texto(String(parseInt(l.codigo.slice(2), 10)), { x: x, y: y + 0.56, 'class': 'num' }, g);
    } else if (l.tipo === 'referencia') {
      nodo('rect', { x: x - 1.05, y: y - 1.05, width: 2.1, height: 2.1, rx: 0.4 }, g);
      texto(l.letra || '·', { x: x, y: y + 0.42, 'class': 'num' }, g);
    } else if (l.tipo === 'servicio') {
      nodo('circle', { cx: x, cy: y, r: l.icono === 'agua' ? 1.05 : 1.35 }, g);
      if (l.icono === 'agua') nodo('path', { 'class': 'gota', d: 'M' + x + ',' + (y - 0.8) + GOTA }, g);
      else texto(l.icono === 'banos' ? 'WC' : 'i', { x: x, y: y + 0.42, 'class': 'num' }, g);
    } else if (l.tipo === 'parada') {
      nodo('circle', { cx: x, cy: y, r: 1.35 }, g);
      nodo('path', { 'class': 'bus', 'fill-rule': 'evenodd', d: 'M' + (x - 0.75) + ',' + (y - 0.85) +
        'h1.5a.25.25 0 0 1 .25.25v1.15a.2.2 0 0 1-.2.2h-.1v.3h-.38v-.3h-.64v.3h-.38v-.3h-.1a.2.2 0 0 1-.2-.2v-1.15a.25.25 0 0 1 .25-.25z' +
        'M' + (x - 0.6) + ',' + (y - 0.6) + 'h1.2v.55h-1.2z' }, g);
    } else if (l.tipo === 'cruce') {
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.4 }, g);
      nodo('path', { 'class': 'cruz', d: 'M' + (x - 0.6) + ',' + (y - 0.6) + 'L' + (x + 0.6) + ',' + (y + 0.6) +
        'M' + (x + 0.6) + ',' + (y - 0.6) + 'L' + (x - 0.6) + ',' + (y + 0.6) }, g);
    } else if (l.tipo === 'puerta') {
      nodo('rect', { x: x - 0.55, y: y - 0.9, width: 1.1, height: 1.8, rx: 0.3 }, g);
    } else if (l.tipo === 'acceso') {
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.45 }, g);
      // flecha hacia adentro: desde la izquierda o de arriba, hacia abajo; desde la derecha, hacia la izquierda
      var giro = l.col >= COLS ? 180 : 90;
      nodo('path', { 'class': 'flecha', d: 'M-.65,0H.45M.05-.45L.55,0L.05.45', transform: 'translate(' + x + ' ' + y + ') rotate(' + giro + ')' }, g);
    } else { // panel
      nodo('rect', { x: x - 1.1, y: y - 1.1, width: 2.2, height: 2.2, rx: 0.45 }, g);
      texto('P', { x: x, y: y + 0.52, 'class': 'num' }, g);
    }
    if (l.rotulo) {
      var lineas = [].concat(l.rotulo), izq = l.rotuloLado ? l.rotuloLado === 'izq' : l.col <= 0;
      lineas.forEach(function (t, k) {
        texto(t, { x: izq ? x - 1.7 : x + 1.7, y: y + 0.45 + (k - (lineas.length - 1) / 2) * 1.35,
          'class': 'rotulo' + (izq ? ' izq' : '') + (l.tipo === 'cruce' ? ' claro' : '') }, g);
      });
    }
    g.addEventListener('click', function () { destacar(l.codigo, false); });
  });

  // ---- en cada tarjeta: «Ver en el plano» o «Muy pronto» ----
  Array.prototype.forEach.call(document.querySelectorAll('[data-lugar]'), function (tarjeta) {
    var c = tarjeta.getAttribute('data-lugar');
    var p = document.createElement('p');
    p.className = 'en-plano';
    if (ubicado(porCodigo[c])) {
      var a = document.createElement('a');
      a.href = '#' + c;
      a.textContent = 'Ver en el plano';
      a.addEventListener('click', function (ev) { ev.preventDefault(); destacar(c, true); });
      p.appendChild(a);
    } else {
      p.textContent = porCodigo[c] && porCodigo[c].tipo === 'panel' ? 'Panel en preparación.' : 'Muy pronto, en el plano.';
    }
    tarjeta.insertBefore(p, tarjeta.querySelector('.botones'));
  });
  // referencias de sectores: destacan en el plano sin saltar a la tarjeta
  Array.prototype.forEach.call(document.querySelectorAll('[data-destacar]'), function (a) {
    a.addEventListener('click', function (ev) {
      if (destacar(a.getAttribute('data-destacar'), true)) ev.preventDefault();
    });
  });

  // ---- destacar un lugar o los ejemplares de una especie ----
  function limpiar() {
    var viejo = svg.querySelector('#aqui');
    if (viejo) viejo.parentNode.removeChild(viejo);
    Array.prototype.forEach.call(svg.querySelectorAll('.ejemplar'), function (c) {
      c.classList.remove('ejemplar'); c.setAttribute('r', c.getAttribute('data-r') || '0.42');
    });
  }
  function mostrarPlano() { marco.scrollIntoView({ block: 'center' }); }
  function anillo(g, x, y) { nodo('circle', { cx: x, cy: y, r: 2.7, 'class': 'anillo' }, g); }

  function destacar(codigo, desplazar) {
    limpiar();
    var l = porCodigo[codigo];
    if (!ubicado(l)) return false;
    var x = cx(l.col), y = cy(l.fila);
    var g = nodo('g', { id: 'aqui', 'class': 'aqui' }, marcas);
    anillo(g, x, y);
    if (l.tipo === 'totem') {
      nodo('circle', { cx: x, cy: y, r: 0.9, 'class': 'punto' }, g);
      var p = nodo('g', { 'class': 'pastilla' }, g);
      var w = 8.2, px = Math.min(Math.max(x - w / 2, 0.5), COLS - w - 0.5), py = y - 4.6 < 0.5 ? y + 2.4 : y - 4.6;
      nodo('rect', { x: px, y: py, width: w, height: 2.3, rx: 1.15 }, p);
      texto('Estás acá', { x: px + w / 2, y: py + 1.62 }, p);
      decir('Estás acá: ' + l.nombre + '.');
    } else {
      decir(descripcion(l) + '.');
    }
    if (desplazar) mostrarPlano();
    return true;
  }

  function especie(codigo) {
    limpiar();
    var lista = ejemplares[codigo];
    if (!lista || !lista.length) { decir(''); return; }
    var g = nodo('g', { id: 'aqui', 'class': 'aqui' }, marcas);
    var n = 0;
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
    var nombre = codigo;
    (window.ESPECIES || []).forEach(function (x) { if (x.codigo === codigo) nombre = x.nombre + ' (' + codigo + ')'; });
    decir(nombre + ': ' + (n === 1 ? 'un ejemplar marcado' : n + ' ejemplares marcados') + ' en el plano.');
    mostrarPlano();
  }

  function segunDireccion() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h) return;
    var c = normalizar(h);
    if (/^[AH]-\d\d$/.test(c)) return especie(c);
    if (porCodigo[c]) {
      var aca = porCodigo[c].tipo === 'totem';   // tótems y cartel del plano: «Estás acá» y el plano a la vista
      if (!destacar(c, aca) && aca) { decir('Este es el plano del Jardín.'); mostrarPlano(); }
    }
  }

  // ---- herramientas: ampliar y cuadrícula ----
  function alternar(boton, clase, textos) {
    if (!boton) return;
    boton.addEventListener('click', function () {
      var on = marco.classList.toggle(clase);
      boton.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (textos) boton.textContent = textos[on ? 1 : 0];
      if (clase === 'con-cuadricula') decir(on ? 'Tocá un lugar del plano para ver su columna y su fila.' : '');
    });
  }
  var bCuad = document.getElementById('ver-cuadricula');
  alternar(document.getElementById('ampliar'), 'ampliado', ['Ampliar', 'Achicar']);
  alternar(bCuad, 'con-cuadricula', ['Ver cuadrícula', 'Ocultar cuadrícula']);
  if (/[?&]cuadricula\b/.test(location.search) && bCuad) bCuad.click();

  // Con la cuadrícula a la vista, al tocar el plano se ve la columna, la fila y el árbol más cercano.
  svg.addEventListener('click', function (ev) {
    if (!marco.classList.contains('con-cuadricula')) return;
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var q = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (q.x < 0 || q.x > COLS || q.y < 0 || q.y > FILAS) return;
    var col = Math.floor(q.x) + 1, fila = FILAS - Math.floor(q.y);
    var mejor = null, dmin = 0.9;
    Array.prototype.forEach.call(svg.querySelectorAll('#arboles circle'), function (c) {
      var dx = +c.getAttribute('cx') - q.x, dy = +c.getAttribute('cy') - q.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < dmin) { dmin = d; mejor = c.id; }
    });
    var viejo = svg.querySelector('#toque');
    if (viejo) viejo.parentNode.removeChild(viejo);
    var g = nodo('g', { id: 'toque' }, marcas);
    nodo('rect', { x: col - 1, y: FILAS - fila, width: 1, height: 1 }, g);
    decir('Columna ' + col + ' · Fila ' + fila + (mejor ? ' · árbol ' + mejor : ''));
  });

  window.addEventListener('hashchange', segunDireccion);
  segunDireccion();
})();
