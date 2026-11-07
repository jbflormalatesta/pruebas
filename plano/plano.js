/*
 * Plano del Jardín: marcas de sectores, servicios y accesos, «Estás acá», ejemplares de la
 * colección, cuadrícula de ayuda y ampliación. Los lugares se editan en datos/plano.js.
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

  // ---- marcas de los lugares ubicados ----
  var porCodigo = {};
  lugares.forEach(function (l) {
    porCodigo[l.codigo] = l;
    if (!ubicado(l) || l.tipo === 'totem') return;
    var x = cx(l.col), y = cy(l.fila);
    var g = nodo('g', { 'class': 'marca ' + l.tipo, id: 'm-' + l.codigo }, marcas);
    nodo('title', {}, g).textContent = l.nombre;
    if (l.tipo === 'sector') {
      nodo('circle', { cx: x, cy: y, r: 1.5 }, g);
      texto(String(parseInt(l.codigo.slice(2), 10)), { x: x, y: y + 0.56, 'class': 'num' }, g);
    } else if (l.tipo === 'servicio') {
      nodo('circle', { cx: x, cy: y, r: 1.35 }, g);
      if (l.codigo === 'agua') {
        nodo('path', { 'class': 'gota', d: 'M' + x + ',' + (y - 0.85) + 'c.65.75.62 1.25.62 1.5a.62.62 0 0 1-1.24 0c0-.25-.03-.75.62-1.5z' }, g);
      } else {
        texto(l.codigo === 'banos' ? 'WC' : 'i', { x: x, y: y + 0.42, 'class': 'num' }, g);
      }
    } else {
      nodo('rect', { x: x - 1.15, y: y - 1.15, width: 2.3, height: 2.3, rx: 0.45 }, g);
      texto(l.tipo === 'panel' ? 'P' : '↗', { x: x, y: y + 0.52, 'class': 'num' }, g);
    }
    var izquierda = x > 36;
    texto(l.nombre, { x: izquierda ? x - 2.1 : x + 2.1, y: y + 0.48, 'class': 'rotulo' + (izquierda ? ' izq' : '') }, g);
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
      p.textContent = 'Muy pronto, en el plano.';
    }
    tarjeta.insertBefore(p, tarjeta.querySelector('.botones'));
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
      decir(l.nombre + ', marcado en el plano.');
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
      if (!destacar(c, c.charAt(0) === 'T') && c.charAt(0) === 'T') { decir('Este es el plano del Jardín.'); mostrarPlano(); }
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
