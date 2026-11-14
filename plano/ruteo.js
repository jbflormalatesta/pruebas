/*
 * Enrutador peatonal del plano: busca el camino más corto por los senderos del Jardín
 * (red de plano/senderos.js, celdas de 0,5 m) y lo suaviza para dibujarlo.
 * No guarda ni envía nada: todo se calcula en el teléfono de quien mira el plano.
 */
(function (raiz) {
  'use strict';
  var R2 = Math.SQRT2;
  // Costo por ancho del paso (como en los tótems: se prefiere ir por el medio de los senderos)
  var COSTOS = {
    normal: [Infinity, 1.22, 1.12, 1.04],
    tranquilo: [Infinity, 6, 1.6, 1]     // recorrido de descanso: evita pasos de menos de 1,5 m
  };

  function corridas(s) {
    var out = [];
    if (!s) return out;
    s.split('.').forEach(function (t) {
      var p = t.split(':'), a = parseInt(p[0], 36), k = parseInt(p[1], 36);
      for (var j = 0; j < k; j++) out.push(a + j);
    });
    return out;
  }

  function Red(S) {
    var n = S.ancho * S.alto, g = new Uint8Array(n), i = 0;
    S.celdas.split('.').forEach(function (t) {
      var v = +t.charAt(0), k = parseInt(t.slice(1), 36);
      if (v) g.fill(v, i, i + k);
      i += k;
    });
    this.S = S; this.w = S.ancho; this.h = S.alto; this.n = n; this.g = g;
    this.llegadas = {};
    for (var k in S.llegadas) this.llegadas[k] = corridas(S.llegadas[k]);
    this.sombra = null;
  }

  Red.prototype.indice = function (x, y) {
    var c = Math.floor((x - this.S.x0) / this.S.paso), f = Math.floor((y - this.S.y0) / this.S.paso);
    if (c < 0 || f < 0 || c >= this.w || f >= this.h) return -1;
    return f * this.w + c;
  };
  Red.prototype.centro = function (i) {
    return [this.S.x0 + (i % this.w + 0.5) * this.S.paso, this.S.y0 + (Math.floor(i / this.w) + 0.5) * this.S.paso];
  };
  // Celdas caminables a menos de «radio» (en cuadrículas) de un punto; si no hay, la más cercana
  // dentro de «maximo» (o ninguna: el punto queda fuera de la red).
  Red.prototype.cerca = function (x, y, radio, maximo) {
    var S = this.S, out = [], mejor = -1, dmin = Infinity, lim = Math.max(radio, maximo || 0);
    var c0 = Math.floor((x - lim - S.x0) / S.paso), c1 = Math.floor((x + lim - S.x0) / S.paso);
    var f0 = Math.floor((y - lim - S.y0) / S.paso), f1 = Math.floor((y + lim - S.y0) / S.paso);
    for (var f = Math.max(0, f0); f <= Math.min(this.h - 1, f1); f++) {
      for (var c = Math.max(0, c0); c <= Math.min(this.w - 1, c1); c++) {
        var i = f * this.w + c;
        if (!this.g[i]) continue;
        var dx = S.x0 + (c + 0.5) * S.paso - x, dy = S.y0 + (f + 0.5) * S.paso - y, d = dx * dx + dy * dy;
        if (d <= radio * radio) out.push(i);
        if (d < dmin) { dmin = d; mejor = i; }
      }
    }
    if (!out.length && mejor >= 0 && dmin <= lim * lim) out.push(mejor);
    return out;
  };

  // Dijkstra con varias celdas de partida y de llegada. modo: 'normal' o 'tranquilo'.
  Red.prototype.buscar = function (origenes, destinos, modo) {
    var n = this.n, w = this.w, g = this.g, costo = COSTOS[modo] || COSTOS.normal, sombra = modo === 'tranquilo' ? this.sombra : null;
    if (!origenes.length || !destinos.length) return null;
    var dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), meta = new Uint8Array(n);
    destinos.forEach(function (i) { meta[i] = 1; });
    var heap = [], hd = [];
    function push(i, d) {
      var k = heap.length; heap.push(i); hd.push(d);
      while (k) { var p = (k - 1) >> 1; if (hd[p] <= d) break; heap[k] = heap[p]; hd[k] = hd[p]; k = p; }
      heap[k] = i; hd[k] = d;
    }
    function pop() {
      var top = heap[0], last = heap.pop(), ld = hd.pop(), k = 0, m = heap.length;
      if (m) {
        while (true) {
          var a = 2 * k + 1, b = a + 1, s = k, sd = ld;
          if (a < m && hd[a] < sd) { s = a; sd = hd[a]; }
          if (b < m && hd[b] < sd) { s = b; sd = hd[b]; }
          if (s === k) break;
          heap[k] = heap[s]; hd[k] = hd[s]; k = s;
        }
        heap[k] = last; hd[k] = ld;
      }
      return top;
    }
    origenes.forEach(function (i) { if (g[i] && dist[i] > 0) { dist[i] = 0; push(i, 0); } });
    var fin = -1;
    var DC = [-1, 1, 0, 0, -1, 1, -1, 1], DF = [0, 0, -1, 1, -1, -1, 1, 1];
    while (heap.length) {
      var d0 = hd[0], i = pop();
      if (d0 > dist[i]) continue;
      if (meta[i]) { fin = i; break; }
      var c = i % w, f = (i - c) / w;
      for (var k = 0; k < 8; k++) {
        var cc = c + DC[k], ff = f + DF[k];
        if (cc < 0 || ff < 0 || cc >= w || ff >= this.h) continue;
        var j = ff * w + cc, v = g[j];
        if (!v) continue;
        if (k > 3 && (!g[f * w + cc] || !g[ff * w + c])) continue;        // sin cortar esquinas
        var paso = (k > 3 ? R2 : 1) * costo[v] * (sombra && sombra[j] ? 0.85 : 1);
        var nd = d0 + paso;
        if (nd < dist[j]) { dist[j] = nd; prev[j] = i; push(j, nd); }
      }
    }
    if (fin < 0) return null;
    var celdas = [];
    for (var t = fin; t >= 0; t = prev[t]) celdas.push(t);
    celdas.reverse();
    return { celdas: celdas, costo: dist[fin] };
  };

  // ¿Se ve un punto desde el otro sin salir de los senderos? (para suavizar el dibujo)
  Red.prototype.despejado = function (a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), pasos = Math.ceil(L / (this.S.paso * 0.25));
    for (var s = 1; s < pasos; s++) {
      var i = this.indice(a[0] + dx * s / pasos, a[1] + dy * s / pasos);
      if (i < 0 || !this.g[i]) return false;
    }
    return true;
  };

  // Camino completo: celdas, puntos suavizados y largo en metros (1 cuadrícula = 2 m)
  Red.prototype.camino = function (origenes, destinos, modo) {
    var r = this.buscar(origenes, destinos, modo);
    if (!r) return null;
    var self = this, pts = r.celdas.map(function (i) { return self.centro(i); });
    var suave = [pts[0]], a = 0;
    while (a < pts.length - 1) {
      var b = a + 1;
      while (b + 1 < pts.length && this.despejado(pts[a], pts[b + 1])) b++;
      suave.push(pts[b]); a = b;
    }
    var largo = 0;
    for (var k = 1; k < suave.length; k++) largo += Math.hypot(suave[k][0] - suave[k - 1][0], suave[k][1] - suave[k - 1][1]);
    var largoGrilla = 0;
    for (k = 1; k < pts.length; k++) largoGrilla += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    return { celdas: r.celdas, puntos: suave, metros: largo * 2, metrosGrilla: largoGrilla * 2 };
  };

  // Sombra: celdas a menos de «radio» cuadrículas de algún árbol del relevamiento
  Red.prototype.calcularSombra = function (arboles, radio) {
    var S = this.S, s = new Uint8Array(this.n), r = Math.ceil(radio / S.paso);
    for (var k = 0; k < arboles.length; k++) {
      var c0 = Math.floor((arboles[k][0] - S.x0) / S.paso), f0 = Math.floor((arboles[k][1] - S.y0) / S.paso);
      for (var f = f0 - r; f <= f0 + r; f++) for (var c = c0 - r; c <= c0 + r; c++) {
        if (f < 0 || c < 0 || f >= this.h || c >= this.w) continue;
        if ((f - f0) * (f - f0) + (c - c0) * (c - c0) <= r * r) s[f * this.w + c] = 1;
      }
    }
    this.sombra = s;
  };

  raiz.Ruteo = { Red: Red };
})(typeof window !== 'undefined' ? window : globalThis);
