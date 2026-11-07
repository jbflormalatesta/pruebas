/*
 * Jardín Botánico Municipal «Florencio Malatesta» · página «Recursos»
 * ------------------------------------------------------------------
 * Dibuja la lista de datos/recursos.js (window.RECURSOS). Para sumar o quitar materiales se edita
 * ese archivo, no este.
 */
(function () {
  'use strict';
  var caja = document.querySelector('[data-recursos]');
  if (!caja) return;
  var grupos = window.RECURSOS || [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var ICO = {
    archivo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.8V9h5.2L13 3.8zM8 13v1.6h8V13H8zm0 3.4V18h8v-1.6H8z"/></svg>',
    enlace: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>'
  };

  var total = 0;
  var html = grupos.map(function (g) {
    var items = (g.items || []).filter(function (r) { return r && r.titulo && r.archivo; });
    if (!items.length) return '';
    total += items.length;
    return '<section class="recursos-grupo"><h2>' + esc(g.grupo) + '</h2><ul class="recursos-lista">' +
      items.map(function (r) {
        var externo = /^https?:\/\//i.test(r.archivo);
        var meta = [r.formato, r.peso, r.fecha, r.fuente ? 'Fuente: ' + r.fuente : ''].filter(Boolean).map(esc).join(' · ');
        var texto = externo ? 'Abrir' : 'Descargar';
        var etiqueta = texto + ': ' + r.titulo + (r.formato ? ' (' + r.formato + (r.peso ? ', ' + r.peso : '') + ')' : '');
        return '<li class="recurso">' +
          '<span class="ico">' + (externo ? ICO.enlace : ICO.archivo) + '</span>' +
          '<div class="cuerpo"><h3>' + esc(r.titulo) + '</h3>' +
            (r.descripcion ? '<p>' + esc(r.descripcion) + '</p>' : '') +
            (meta ? '<p class="meta">' + meta + '</p>' : '') + '</div>' +
          '<a class="boton" href="' + esc(r.archivo) + '"' + (externo ? ' rel="noopener" target="_blank"' : ' download') +
            ' aria-label="' + esc(etiqueta) + '">' + texto + '</a>' +
          '</li>';
      }).join('') + '</ul></section>';
  }).join('');

  caja.innerHTML = total ? html :
    '<div class="agenda-estado"><p>Estamos preparando los materiales. Muy pronto vas a poder descargarlos desde acá.</p></div>';
})();
