/*
 * MODO RELEVAMIENTO DE ÁRBOLES (dentro de la cuadrícula técnica del plano)
 * ----------------------------------------------------------------------
 * Para el equipo del Jardín: tocar cualquiera de los 410 árboles del relevamiento y cargar especie, bloque del
 * Plan de Manejo, medidas (DAP desde el perímetro), Banco de Semillas (BDS), estado sanitario y observaciones.
 * Todo se guarda SOLO en este navegador (localStorage «jbplano:relevamiento»): no se envía a ningún lado.
 * Para juntar lo que relevan distintas personas o pasarlo a la planilla: Exportar JSON / CSV e Importar JSON.
 * No lleva nombres de quien releva ni ningún dato personal.
 */
window.Relevamiento = (function () {
  'use strict';
  var CLAVE = 'jbplano:relevamiento';
  var BLOQUE_DE = {"A-01":"3C","A-03":"3A","A-05":"1B","A-06":"3D","A-07":"2","A-08":"3C","A-09":"2","A-10":"1B","A-11":"3B","A-12":"3A","A-13":"2","A-14":"1A","A-15":"2","A-16":"1B","A-17":"3B","A-18":"3A","A-19":"2","A-20":"2","A-21":"1A","A-22":"1A","A-23":"1A","A-24":"1A","A-25":"1A","A-26":"1A","A-27":"2","A-28":"2","A-29":"1A","A-30":"1A","A-31":"3C","A-32":"3A","A-33":"3A","A-34":"3A","A-35":"1B","A-36":"3A","A-37":"1B","A-38":"3A","A-39":"1A","A-40":"3A","A-41":"2","A-42":"3D","A-43":"2","A-44":"1A","A-45":"2","A-46":"3A","A-47":"1A","A-48":"3D","A-49":"3D","A-50":"1B","A-51":"3C","A-52":"1A","A-53":"1A","A-54":"2","A-55":"3A","A-56":"1B","A-57":"2","A-58":"3B","A-59":"1A","A-60":"3C","A-61":"3A","A-62":"2","A-63":"2","A-64":"3C","A-65":"2","A-66":"1A","A-67":"1A","A-68":"1A","A-69":"1A","A-70":"2","A-71":"1A","A-72":"1A","A-73":"2","A-74":"3A","A-75":"1B","A-76":"3A"};
  var BLOQUES = [['1A', 'Nativa regional · Pampa y Espinal', '#33490A'], ['1B', 'Nativa regional · Delta y ribera', '#35707F'],
    ['2', 'Patrimonial histórica de la Quinta Devoto', '#8C6A33'], ['3A', 'Nativa argentina de otras regiones', '#9CBB32'],
    ['3B', 'Etnobotánica y de uso cultural', '#B98A1E'], ['3C', 'Exótica ornamental', '#EC8004'], ['3D', 'Exótica invasora (en control)', '#C7261C']];
  var FENO = ['Vegetativo', 'En botón', 'En flor', 'Fruto inmaduro', 'Fruto maduro / listo para colecta'];
  var SANI = [['Bueno', '#456301'], ['Regular', '#B98A1E'], ['Requiere poda / atención', '#EC8004'], ['Riesgo / Seco', '#C7261C']];
  var SIN_DATO = '#BCC998';
  var CAMPOS = ['especie', 'otra', 'bloque', 'perimetro', 'dap', 'altura', 'copa', 'bds', 'feno', 'lote', 'sanitario', 'obs'];
  var ctx = null, caja = null, datos = leer(), abierto = null, color = 'ninguno', pendienteImportar = null;

  function leer() {
    try { var v = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (v && v.arboles && typeof v.arboles === 'object') return v; } catch (e) {}
    return { formato: 'jb-relevamiento-arboles', version: 1, arboles: {} };
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return caja.querySelector(s); }
  function hoy() { return new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); }
  function arboles() { return Array.prototype.slice.call(ctx.svg.querySelectorAll('#arboles circle')); }
  function numero(id) { return parseInt(String(id).slice(2), 10); }
  function colFila(c) { return { col: Math.floor(+c.getAttribute('cx')) + 1, fila: ctx.FILAS - Math.floor(+c.getAttribute('cy')) }; }
  function especies() { return (window.ESPECIES || []).filter(function (e) { return /^A-\d\d$/.test(e.codigo); }); }
  function nombreEspecie(r) {
    if (!r || !r.especie) return '';
    if (r.especie === 'pendiente') return 'Pendiente de determinar';
    if (r.especie === 'otra') return 'Otra: ' + (r.otra || 'sin nombre');
    var e = especies().filter(function (x) { return x.codigo === r.especie; })[0];
    return e ? r.especie + ' · ' + e.nombre : r.especie;
  }

  // ---------- barra: progreso, colores, exportar e importar ----------
  function barra() {
    var n = Object.keys(datos.arboles).length, bds = 0, total = arboles().length || 410;
    Object.keys(datos.arboles).forEach(function (k) { if (datos.arboles[k].bds) bds++; });
    var p = $('#rel-progreso');
    if (p) {
      p.innerHTML = '<b>' + n + ' de ' + total + '</b> árboles censados · <b>' + bds + '</b> ' + (bds === 1 ? 'semillero' : 'semilleros') + ' BDS';
      var b = $('.barra-progreso');
      b.setAttribute('aria-valuenow', n); b.setAttribute('aria-valuemax', total);
      b.firstChild.style.width = (100 * n / total).toFixed(1) + '%';
    }
  }
  function armar() {
    caja.innerHTML =
      '<div class="rel-cab"><h3>Modo relevamiento de árboles</h3>' +
      '<p id="rel-progreso" class="rel-progreso"></p>' +
      '<div class="barra-progreso" role="progressbar" aria-label="Árboles censados" aria-valuemin="0"><span></span></div>' +
      '<p class="nota">Tocá un árbol del plano para cargar o corregir sus datos. Todo queda guardado <b>solo en este navegador</b>: ' +
      'exportá seguido para no perder nada y para juntar lo que relevan distintas personas.</p>' +
      '<div class="rel-acciones"><label class="rel-color">Colorear por <select id="rel-color"><option value="ninguno">Sin color</option>' +
      '<option value="bloque">Bloque</option><option value="sanitario">Estado sanitario</option><option value="bds">Semilleros BDS</option></select></label>' +
      '<button type="button" class="boton sec chico" id="rel-json">Exportar JSON</button>' +
      '<button type="button" class="boton sec chico" id="rel-csv">Exportar CSV</button>' +
      '<label class="boton sec chico rel-importar">Importar JSON<input type="file" id="rel-archivo" accept=".json,application/json" hidden></label></div>' +
      '<div class="rel-leyenda" id="rel-leyenda"></div><div class="rel-aviso" id="rel-aviso" aria-live="polite"></div></div>' +
      '<form class="rel-form" id="rel-form" hidden autocomplete="off"></form>';
    $('#rel-color').value = color;
    $('#rel-color').addEventListener('change', function () { color = this.value; pintar(); });
    $('#rel-json').addEventListener('click', exportarJSON);
    $('#rel-csv').addEventListener('click', exportarCSV);
    $('#rel-archivo').addEventListener('change', function () { if (this.files && this.files[0]) leerArchivo(this.files[0]); this.value = ''; });
    caja.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-rel]');
      if (!b) return;
      var q = b.getAttribute('data-rel');
      if (q === 'listo') cerrarFicha();
      else if (q === 'siguiente') siguiente();
      else if (q === 'borrar') borrar(b);
      else if (q === 'importar-si') confirmarImportar();
      else if (q === 'importar-no') { pendienteImportar = null; aviso(''); }
    });
    barra();
  }
  function aviso(html) { var a = $('#rel-aviso'); if (a) a.innerHTML = html; }

  // ---------- colores en el plano y círculos de copa ----------
  function colorDe(r) {
    if (color === 'bloque') { var b = BLOQUES.filter(function (x) { return x[0] === (r && r.bloque); })[0]; return b ? b[2] : (r ? '#4A5530' : SIN_DATO); }
    if (color === 'sanitario') { var s = SANI.filter(function (x) { return x[0] === (r && r.sanitario); })[0]; return s ? s[1] : SIN_DATO; }
    if (color === 'bds') return r && r.bds ? '#EC8004' : SIN_DATO;
    return '';
  }
  function pintar() {
    arboles().forEach(function (c) {
      var r = datos.arboles[c.id], f = colorDe(r);
      c.style.fill = f;
      c.classList.toggle('censado', !!r);
      c.classList.toggle('semillero', color === 'bds' && !!(r && r.bds));
    });
    copas();
    var ley = $('#rel-leyenda'), items = [];
    if (color === 'bloque') items = BLOQUES.map(function (b) { return [b[2], b[0] + ' · ' + b[1]]; }).concat([['#4A5530', 'Sin bloque'], [SIN_DATO, 'Sin censar']]);
    if (color === 'sanitario') items = SANI.map(function (s) { return [s[1], s[0]]; }).concat([[SIN_DATO, 'Sin evaluar']]);
    if (color === 'bds') items = [['#EC8004', 'Semillero / planta madre'], [SIN_DATO, 'Otros']];
    if (ley) ley.innerHTML = items.map(function (i) { return '<span><i style="background:' + i[0] + '"></i>' + esc(i[1]) + '</span>'; }).join('');
    barra();
  }
  function copas() {
    var g = ctx.svg.querySelector('#copas');
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'copas';
      var arb = ctx.svg.querySelector('#arboles'); arb.parentNode.insertBefore(g, arb);
    }
    while (g.firstChild) g.removeChild(g.firstChild);
    Object.keys(datos.arboles).forEach(function (id) {
      var r = datos.arboles[id], c = ctx.svg.querySelector('#' + id);
      if (!c || !(r.copa > 0)) return;
      ctx.nodo('circle', { cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), r: (r.copa / 4).toFixed(2) }, g);   // copa en m → radio en cuadrículas de 2 m
    });
  }
  function limpiar() {
    arboles().forEach(function (c) { c.style.fill = ''; c.classList.remove('censado', 'semillero', 'abierto'); });
    var g = ctx.svg.querySelector('#copas'); if (g) g.parentNode.removeChild(g);
  }

  // ---------- ficha de un árbol ----------
  function opciones(lista, valor, vacio) {
    return (vacio ? '<option value="">' + vacio + '</option>' : '') + lista.map(function (o) {
      var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
      return '<option value="' + esc(v) + '"' + (String(valor) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
  }
  function abrir(id) {
    var c = ctx.svg.querySelector('#' + id);
    if (!c) return;
    abierto = id;
    arboles().forEach(function (x) { x.classList.toggle('abierto', x.id === id); });
    var r = datos.arboles[id] || {}, cf = colFila(c), f = $('#rel-form');
    var esp = [['pendiente', 'Pendiente de determinar']].concat(especies().map(function (e) { return [e.codigo, e.codigo + ' · ' + e.nombre]; }), [['otra', 'Otra especie (escribila)']]);
    f.innerHTML =
      '<h4>Árbol n.º ' + numero(id) + ' <small>Columna ' + cf.col + ' · Fila ' + cf.fila + '</small></h4>' +
      '<div class="rel-campos">' +
      '<label>Especie<select name="especie">' + opciones(esp, r.especie || '', 'Elegí…') + '</select></label>' +
      '<label class="rel-otra"' + (r.especie === 'otra' ? '' : ' hidden') + '>¿Cuál?<input name="otra" type="text" maxlength="80" value="' + esc(r.otra || '') + '"></label>' +
      '<label>Bloque del Plan de Manejo<select name="bloque">' + opciones(BLOQUES.map(function (b) { return [b[0], b[0] + ' · ' + b[1]]; }), r.bloque || '', 'Sin asignar') + '</select></label>' +
      '<label>Perímetro a 1,30 m (cm)<input name="perimetro" type="number" inputmode="decimal" min="0" max="1000" step="0.1" value="' + (r.perimetro || '') + '"></label>' +
      '<label>DAP (cm)<input name="dap" type="number" inputmode="decimal" min="0" max="320" step="0.1" value="' + (r.dap || '') + '"><small>Con el perímetro se calcula solo: perímetro ÷ π.</small></label>' +
      '<label>Altura total estimada (m)<input name="altura" type="number" inputmode="decimal" min="0" max="45" step="0.1" value="' + (r.altura || '') + '"></label>' +
      '<label>Diámetro de copa (m)<input name="copa" type="number" inputmode="decimal" min="0" max="45" step="0.1" value="' + (r.copa || '') + '"><small>Se dibuja en el plano como un círculo.</small></label>' +
      '<label>Estado sanitario (Monitoreo 5J)<select name="sanitario">' + opciones(SANI.map(function (s) { return s[0]; }), r.sanitario || '', 'Sin evaluar') + '</select></label>' +
      '</div>' +
      '<fieldset class="rel-bds"><legend>Banco de Semillas (BDS)</legend>' +
      '<label class="rel-check"><input type="checkbox" name="bds"' + (r.bds ? ' checked' : '') + '> Árbol semillero / planta madre para el BDS</label>' +
      '<div class="rel-campos rel-solo-bds"' + (r.bds ? '' : ' hidden') + '>' +
      '<label>Estado fenológico<select name="feno">' + opciones(FENO, r.feno || '', 'Elegí…') + '</select></label>' +
      '<label>Código de lote<input name="lote" type="text" maxlength="30" value="' + esc(r.lote || '') + '"></label></div></fieldset>' +
      '<label class="rel-obs">Observaciones<textarea name="obs" rows="3" maxlength="600">' + esc(r.obs || '') + '</textarea></label>' +
      '<p class="rel-guardado" aria-live="polite">' + (r.fecha ? 'Última carga: ' + esc(r.fecha) : 'Sin datos todavía.') + '</p>' +
      '<div class="botones"><button type="button" class="boton chico" data-rel="listo">Listo</button>' +
      '<button type="button" class="boton sec chico" data-rel="siguiente">Siguiente sin censar</button>' +
      '<button type="button" class="boton sec chico" data-rel="borrar">Borrar los datos de este árbol</button></div>';
    f.hidden = false;
    f.oninput = f.onchange = function (ev) { cambio(ev.target); };
    ctx.decir('Árbol n.º ' + numero(id) + ' · Columna ' + cf.col + ' · Fila ' + cf.fila + (r.especie ? ' · ' + nombreEspecie(r) : '') + '.');
    if (f.scrollIntoView) f.scrollIntoView({ block: 'nearest' });
  }
  function cambio(el) {
    var f = $('#rel-form');
    if (!f || !abierto || !el || !el.name) return;
    if (el.name === 'especie') {
      f.querySelector('.rel-otra').hidden = el.value !== 'otra';
      var b = f.elements.bloque, sug = BLOQUE_DE[el.value];
      if (sug && (!b.value || b.getAttribute('data-auto') === '1')) { b.value = sug; b.setAttribute('data-auto', '1'); }
    }
    if (el.name === 'bloque') el.removeAttribute('data-auto');
    if (el.name === 'perimetro') { var p = parseFloat(el.value); f.elements.dap.value = p > 0 ? (p / Math.PI).toFixed(1) : ''; }
    if (el.name === 'bds') f.querySelector('.rel-solo-bds').hidden = !el.checked;
    var r = {};
    CAMPOS.forEach(function (k) {
      var e = f.elements[k];
      if (!e) return;
      if (e.type === 'checkbox') { if (e.checked) r[k] = true; return; }
      var v = String(e.value || '').trim();
      if (!v) return;
      r[k] = e.type === 'number' ? Math.round(parseFloat(v) * 10) / 10 : v;
    });
    if (r.especie !== 'otra') delete r.otra;
    if (!r.bds) { delete r.feno; delete r.lote; }
    if (Object.keys(r).length) { r.fecha = hoy(); datos.arboles[abierto] = r; } else delete datos.arboles[abierto];
    var ok = guardar();
    f.querySelector('.rel-guardado').textContent = ok ? 'Guardado en este navegador · ' + hoy() : 'No se pudo guardar (el navegador no deja usar el almacenamiento): exportá antes de cerrar.';
    var avisos = [];
    if (r.dap > 250) avisos.push('el DAP es muy grande');
    if (r.altura > 35) avisos.push('la altura es muy grande');
    if (avisos.length) f.querySelector('.rel-guardado').textContent += ' · Revisá: ' + avisos.join(' y ') + '.';
    pintar();
  }
  function cerrarFicha() {
    var f = $('#rel-form'); if (f) { f.hidden = true; f.innerHTML = ''; }
    abierto = null;
    arboles().forEach(function (x) { x.classList.remove('abierto'); });
  }
  function siguiente() {
    var ids = arboles().map(function (c) { return c.id; }), i = ids.indexOf(abierto);
    for (var k = 1; k <= ids.length; k++) { var id = ids[(i + k) % ids.length]; if (!datos.arboles[id]) { abrir(id); return; } }
    aviso('¡Están censados todos los árboles!');
  }
  function borrar(b) {
    if (b.getAttribute('data-seguro') !== '1') { b.setAttribute('data-seguro', '1'); b.textContent = '¿Seguro? Tocá de nuevo para borrar'; return; }
    delete datos.arboles[abierto]; guardar();
    var id = abierto; pintar(); abrir(id);
  }

  // ---------- exportar e importar ----------
  function nombreArchivo(ext) { var d = hoy(); return d.slice(0, 7) + '_Relevamiento_ArbolesJB.' + ext; }
  function bajar(texto, tipo, nombre) {
    var url = URL.createObjectURL(new Blob([texto], { type: tipo })), a = document.createElement('a');
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.parentNode.removeChild(a); }, 500);
  }
  function exportarJSON() {
    var salida = { formato: 'jb-relevamiento-arboles', version: 1, exportado: hoy(), total: arboles().length, arboles: datos.arboles };
    bajar(JSON.stringify(salida, null, 1), 'application/json', nombreArchivo('json'));
    aviso('Se descargó ' + nombreArchivo('json') + ' con ' + Object.keys(datos.arboles).length + ' árboles.');
  }
  function exportarCSV() {
    var dec = function (v) { return v == null || v === '' ? '' : String(v).replace('.', ','); };
    var celda = function (v) { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var filas = [['Árbol', 'Código', 'Columna', 'Fila', 'Especie (código)', 'Especie', 'Bloque', 'Perímetro (cm)', 'DAP (cm)', 'Altura (m)',
      'Copa (m)', 'Semillero BDS', 'Estado fenológico', 'Lote', 'Estado sanitario', 'Observaciones', 'Última carga']];
    arboles().forEach(function (c) {
      var r = datos.arboles[c.id];
      if (!r) return;
      var cf = colFila(c);
      filas.push([numero(c.id), c.id, cf.col, cf.fila, r.especie || '', nombreEspecie(r).replace(/^A-\d\d · /, ''), r.bloque || '', dec(r.perimetro),
        dec(r.dap), dec(r.altura), dec(r.copa), r.bds ? 'Sí' : 'No', r.feno || '', r.lote || '', r.sanitario || '', r.obs || '', r.fecha || '']);
    });
    bajar('﻿' + filas.map(function (f) { return f.map(celda).join(';'); }).join('\r\n'), 'text/csv;charset=utf-8', nombreArchivo('csv'));
    aviso('Se descargó ' + nombreArchivo('csv') + ' (' + (filas.length - 1) + ' árboles). Se abre con Excel o con Hojas de cálculo de Google.');
  }
  function limpio(r) {
    var o = {};
    if (!r || typeof r !== 'object') return null;
    if (typeof r.especie === 'string' && /^(A-\d\d|otra|pendiente)$/.test(r.especie)) o.especie = r.especie;
    if (typeof r.otra === 'string') o.otra = r.otra.slice(0, 80);
    if (BLOQUES.some(function (b) { return b[0] === r.bloque; })) o.bloque = r.bloque;
    ['perimetro', 'dap', 'altura', 'copa'].forEach(function (k) { var v = parseFloat(r[k]); if (v >= 0 && v < 2000) o[k] = Math.round(v * 10) / 10; });
    if (r.bds === true) o.bds = true;
    if (FENO.indexOf(r.feno) >= 0) o.feno = r.feno;
    if (typeof r.lote === 'string') o.lote = r.lote.slice(0, 30);
    if (SANI.some(function (s) { return s[0] === r.sanitario; })) o.sanitario = r.sanitario;
    if (typeof r.obs === 'string') o.obs = r.obs.slice(0, 600);
    if (typeof r.fecha === 'string' && /^\d{4}-\d\d-\d\d$/.test(r.fecha)) o.fecha = r.fecha;
    return Object.keys(o).length ? o : null;
  }
  function leerArchivo(archivo) {
    var lector = new FileReader();
    lector.onload = function () {
      var v = null;
      try { v = JSON.parse(lector.result); } catch (e) { aviso('Ese archivo no es un JSON válido.'); return; }
      var lista = v && v.arboles, nuevos = {}, n = 0, pisan = 0;
      if (!lista || typeof lista !== 'object') { aviso('El archivo no tiene datos del relevamiento de árboles.'); return; }
      Object.keys(lista).forEach(function (id) {
        if (!/^ar\d{3}$/.test(id) || !ctx.svg.querySelector('#' + id)) return;
        var r = limpio(lista[id]);
        if (!r) return;
        nuevos[id] = r; n++;
        if (datos.arboles[id]) pisan++;
      });
      if (!n) { aviso('El archivo no trae árboles para cargar.'); return; }
      pendienteImportar = nuevos;
      aviso('El archivo trae <b>' + n + '</b> árboles' + (pisan ? ' (' + pisan + ' ya tienen datos acá y se van a reemplazar)' : '') + '. ' +
        '<button type="button" class="boton chico" data-rel="importar-si">Cargar</button> <button type="button" class="boton sec chico" data-rel="importar-no">Cancelar</button>');
    };
    lector.readAsText(archivo);
  }
  function confirmarImportar() {
    if (!pendienteImportar) return;
    var n = Object.keys(pendienteImportar).length;
    Object.keys(pendienteImportar).forEach(function (id) { datos.arboles[id] = pendienteImportar[id]; });
    pendienteImportar = null;
    guardar(); pintar();
    aviso('Listo: se cargaron ' + n + ' árboles.');
    if (abierto) abrir(abierto);
  }

  return {
    iniciar: function (c) {
      ctx = c; caja = c.contenedor;
      if (!caja.firstChild) armar();
      caja.hidden = false;
      pintar();
    },
    cerrar: function () { if (!ctx) return; cerrarFicha(); limpiar(); caja.hidden = true; },
    abrir: function (id) { if (ctx) abrir(id); },
    datos: function () { return datos; }
  };
})();
