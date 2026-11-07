/*
 * La colección: listado de especies y ficha de cada una.
 * Datos: ../datos/especies.js (textos) y ../datos/sitio.js (enlaces y opción del QR de las fichas).
 * La dirección de una ficha es coleccion/?A-71 (los QR impresos llegan por la portada: ?A-71).
 */
(function () {
  'use strict';
  var SITIO = window.SITIO || {};
  var CONTACTO = SITIO.contacto || {};
  var LINKTREE = CONTACTO.linktree || 'https://linktr.ee/jbflormalatesta';
  var INSTAGRAM = CONTACTO.instagram || 'https://www.instagram.com/jbflormalatesta/';
  var TODAS = (window.ESPECIES || []).slice();
  var SVG = {"portes":{"arbol":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M485.6 193.3L485.6 164.2C485.6 158.8 487.4 155.2 490.1 153.4C492.8 155.2 494.6 158.8 494.6 164.2L494.6 193.3L485.6 193.3\" fill=\"currentColor\"/><path d=\"M490.1 158.8L475.6 147.9M490.1 162.4L504.6 149.7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.6\"/><circle cx=\"490.1\" cy=\"140.7\" r=\"20.9\" fill=\"currentColor\"/><circle cx=\"472\" cy=\"149.7\" r=\"14.5\" fill=\"currentColor\"/><circle cx=\"508.2\" cy=\"149.7\" r=\"14.5\" fill=\"currentColor\"/><circle cx=\"479.2\" cy=\"129.8\" r=\"12.7\" fill=\"currentColor\"/><circle cx=\"501\" cy=\"129.8\" r=\"12.7\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"124.3\" r=\"10.9\" fill=\"currentColor\"/><\/svg>","arbusto":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M490.1 193.3L490.1 171.5M490.1 186L475.6 173.3M490.1 186L504.6 173.3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"4.1\" stroke-linecap=\"round\"/><circle cx=\"490.1\" cy=\"157\" r=\"19\" fill=\"currentColor\"/><circle cx=\"470.1\" cy=\"166.1\" r=\"14.5\" fill=\"currentColor\"/><circle cx=\"510.1\" cy=\"166.1\" r=\"14.5\" fill=\"currentColor\"/><circle cx=\"479.2\" cy=\"142.5\" r=\"12.7\" fill=\"currentColor\"/><circle cx=\"501\" cy=\"142.5\" r=\"12.7\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"135.2\" r=\"10.9\" fill=\"currentColor\"/><\/svg>","herbacea":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M490.1 193.3L490.1 137\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path d=\"M490.1 178.7C492.8 169.4 501.7 167.4 508.6 171.3C506.3 178.9 498.5 183.7 490.1 178.7\" fill=\"currentColor\"/><path d=\"M490.1 178.7C481.7 183.7 473.9 178.9 471.6 171.3C478.5 167.4 487.4 169.4 490.1 178.7\" fill=\"currentColor\"/><path d=\"M490.1 164.2C492.8 154.8 501.7 152.9 508.6 156.8C506.3 164.3 498.5 169.1 490.1 164.2\" fill=\"currentColor\"/><path d=\"M490.1 164.2C481.7 169.1 473.9 164.3 471.6 156.8C478.5 152.9 487.4 154.8 490.1 164.2\" fill=\"currentColor\"/><path d=\"M490.1 151.5C492.8 142.1 501.7 140.2 508.6 144.1C506.3 151.6 498.5 156.4 490.1 151.5\" fill=\"currentColor\"/><path d=\"M490.1 151.5C481.7 156.4 473.9 151.6 471.6 144.1C478.5 140.2 487.4 142.1 490.1 151.5\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"129.8\" r=\"5.9\" fill=\"currentColor\"/><circle cx=\"481.9\" cy=\"136.1\" r=\"5.9\" fill=\"currentColor\"/><circle cx=\"498.3\" cy=\"136.1\" r=\"5.9\" fill=\"currentColor\"/><circle cx=\"484.7\" cy=\"124.3\" r=\"5.9\" fill=\"currentColor\"/><circle cx=\"495.5\" cy=\"124.3\" r=\"5.9\" fill=\"currentColor\"/><\/svg>","graminea":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M490.1 191.4C495.5 157.2 493.7 130.5 490.1 115.3C485.6 134.3 484.7 161 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C485.8 158.6 476.6 134.9 468.9 122.1C469.9 140.7 476.4 165.3 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C504.9 161.8 510.5 137 511.3 122.1C501.7 138.1 493.4 162.1 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C479.1 164.5 465.5 146.9 455.5 138.2C460.4 154 471.7 173.1 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C510.2 170.4 520.8 150.8 524.7 138.2C512.2 149 499.4 167.2 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C476.8 172.1 462.3 161.6 452.4 157.5C458.8 169.3 471.4 181.9 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 191.4C510.7 180.2 522.7 167 527.8 157.5C515.4 162.6 501.6 173.8 490.1 191.4\" fill=\"currentColor\"/><\/svg>","conifera":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M486.5 164.2H493.7V193.3H486.5Z\" fill=\"currentColor\"/><path d=\"M490.1 113.4L505.5 144.3L474.7 144.3L490.1 113.4\" fill=\"currentColor\"/><path d=\"M490.1 131.6L511 164.2L469.2 164.2L490.1 131.6\" fill=\"currentColor\"/><path d=\"M490.1 149.7L517.3 184.2L462.9 184.2L490.1 149.7\" fill=\"currentColor\"/><\/svg>","palmera":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M483.8 193.3C483.8 171.5 485.6 153.4 488.3 138.8L497.4 139.7C493.7 155.2 492.8 173.3 494.6 193.3L483.8 193.3\" fill=\"currentColor\"/><path d=\"M491.9 136.1C477.2 144.1 462.7 142.9 453.5 133.5C464.5 134 479.9 131.7 491.9 136.1\" fill=\"currentColor\"/><path d=\"M491.9 136.1C475.3 134 464.3 124.4 462.4 111.4C471 118.3 484.8 125.5 491.9 136.1\" fill=\"currentColor\"/><path d=\"M491.9 136.1C499.1 121 511.6 113.4 524.5 115.7C515.3 121.7 504.3 132.6 491.9 136.1\" fill=\"currentColor\"/><path d=\"M491.9 136.1C506.6 128.1 521.2 129.4 530.3 138.7C519.3 138.2 504 140.5 491.9 136.1\" fill=\"currentColor\"/><circle cx=\"491.9\" cy=\"136.1\" r=\"4.5\" fill=\"currentColor\"/><\/svg>","trepadora":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M462.9 120.7H469.2V193.3H462.9Z\" fill=\"currentColor\"/><path d=\"M466.5 191.4C484.7 184.2 457.4 173.3 475.6 164.2C493.7 155.2 466.5 146.1 482.8 137C497.4 129.8 486.5 126.1 491.9 120.7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.3\" stroke-linecap=\"round\"/><path d=\"M479.2 184.2C480.3 175.2 488.1 172.4 494.9 175.1C493.9 182.4 487.6 187.8 479.2 184.2\" fill=\"currentColor\"/><path d=\"M470.1 167.9C469.1 176.9 461.3 179.7 454.4 176.9C455.5 169.6 461.8 164.3 470.1 167.9\" fill=\"currentColor\"/><path d=\"M488.3 158.8C490.9 150.1 499.1 148.7 505.3 152.6C503.1 159.6 495.9 163.8 488.3 158.8\" fill=\"currentColor\"/><path d=\"M475.6 142.5C473 151.1 464.8 152.6 458.5 148.7C460.8 141.7 468 137.5 475.6 142.5\" fill=\"currentColor\"/><path d=\"M495.5 131.6C499.6 123.5 507.9 123.5 513.4 128.4C510 134.9 502.2 137.8 495.5 131.6\" fill=\"currentColor\"/><\/svg>","roseta":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M490.1 186C481.4 194.8 465.9 196.7 456.4 193.2C463.7 186.1 478.6 181.5 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 186C478.1 188.9 463.9 182.3 457.7 174.2C467.7 172 482.7 176.1 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 186C478.4 182 469.9 169 468.9 158.8C478.5 162.3 489.1 173.7 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 186C491.1 173.7 501.7 162.3 511.3 158.8C510.3 169 501.8 182 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 186C497.5 176.1 512.5 172 522.5 174.2C516.3 182.3 502.1 188.9 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 186C501.6 181.5 516.5 186.1 523.8 193.2C514.3 196.7 498.8 194.8 490.1 186\" fill=\"currentColor\"/><path d=\"M490.1 184.2L490.1 131.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.1\" stroke-linecap=\"round\"/><circle cx=\"490.1\" cy=\"135.2\" r=\"4.2\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"144.3\" r=\"4.2\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"153.4\" r=\"4.2\" fill=\"currentColor\"/><circle cx=\"490.1\" cy=\"162.4\" r=\"4.2\" fill=\"currentColor\"/><\/svg>","bulbosa":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M453.8 182.4L526.4 182.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M490.1 191.4C481 191.4 476.5 186 476.5 180.6C476.5 175.1 482.8 171.5 490.1 171.5C497.4 171.5 503.7 175.1 503.7 180.6C503.7 186 499.2 191.4 490.1 191.4\" fill=\"currentColor\"/><path d=\"M490.1 176.9C474.1 177.3 454.1 167.9 444.7 158.6C457.9 158.5 478.9 165.5 490.1 176.9\" fill=\"currentColor\"/><path d=\"M490.1 176.9C501.3 165.5 522.3 158.5 535.5 158.6C526.1 167.9 506.1 177.3 490.1 176.9\" fill=\"currentColor\"/><path d=\"M490.1 176.9C477.1 173.2 465 159.8 461.4 149.2C472.1 152.5 485.9 164.1 490.1 176.9\" fill=\"currentColor\"/><path d=\"M490.1 176.9C494.3 164.1 508.1 152.5 518.8 149.2C515.2 159.8 503.1 173.2 490.1 176.9\" fill=\"currentColor\"/><path d=\"M490.1 175.1L490.1 135.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.1\" stroke-linecap=\"round\"/><circle cx=\"490.1\" cy=\"126.1\" r=\"5.4\" fill=\"currentColor\"/><circle cx=\"480.1\" cy=\"133.4\" r=\"5.4\" fill=\"currentColor\"/><circle cx=\"500.1\" cy=\"133.4\" r=\"5.4\" fill=\"currentColor\"/><circle cx=\"484.7\" cy=\"140.7\" r=\"5.4\" fill=\"currentColor\"/><circle cx=\"495.5\" cy=\"140.7\" r=\"5.4\" fill=\"currentColor\"/><\/svg>","cubresuelos":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M453.8 176.9C468.3 167.9 479.2 184.2 493.7 175.1C506.4 167 517.3 180.6 528.2 173.3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.1\" stroke-linecap=\"round\"/><circle cx=\"461.1\" cy=\"169.7\" r=\"7.3\" fill=\"currentColor\"/><circle cx=\"473.8\" cy=\"178.7\" r=\"7.3\" fill=\"currentColor\"/><circle cx=\"486.5\" cy=\"169.7\" r=\"7.3\" fill=\"currentColor\"/><circle cx=\"499.2\" cy=\"178.7\" r=\"7.3\" fill=\"currentColor\"/><circle cx=\"511.9\" cy=\"169.7\" r=\"7.3\" fill=\"currentColor\"/><circle cx=\"523.7\" cy=\"176.9\" r=\"7.3\" fill=\"currentColor\"/><path d=\"M466.5 180.6L466.5 188.7M491.9 180.6L491.9 188.7M517.3 180.6L517.3 188.7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path d=\"M452 189.6L528.2 189.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><\/svg>","helecho":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M488.3 193.3C488.3 173.3 487.4 147.9 496.5 120.7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.9\" stroke-linecap=\"round\"/><path d=\"M488.3 182.4C477.6 185.6 466 179.4 461.4 171.5C470.2 169.1 482.8 172.7 488.3 182.4\" fill=\"currentColor\"/><path d=\"M488.3 182.4C493.8 172.7 506.4 169.1 515.2 171.5C510.6 179.4 499 185.6 488.3 182.4\" fill=\"currentColor\"/><path d=\"M488.5 173.9C478.9 176.1 469 169.9 465.4 162.7C473.3 161.1 484.2 165 488.5 173.9\" fill=\"currentColor\"/><path d=\"M488.5 173.9C492.7 165 503.6 161.1 511.5 162.7C507.9 169.9 498 176.1 488.5 173.9\" fill=\"currentColor\"/><path d=\"M489 165.3C480.5 166.7 472.3 160.9 469.6 154.4C476.5 153.4 485.8 157.4 489 165.3\" fill=\"currentColor\"/><path d=\"M489 165.3C492.1 157.4 501.4 153.4 508.3 154.4C505.6 160.9 497.4 166.7 489 165.3\" fill=\"currentColor\"/><path d=\"M489.8 156.8C482.6 157.5 476 152.1 474 146.5C479.9 146.1 487.5 149.9 489.8 156.8\" fill=\"currentColor\"/><path d=\"M489.8 156.8C492 149.9 499.6 146.1 505.5 146.5C503.6 152.1 497 157.5 489.8 156.8\" fill=\"currentColor\"/><path d=\"M491 148.3C485 148.5 479.9 143.7 478.6 139C483.5 139 489.5 142.5 491 148.3\" fill=\"currentColor\"/><path d=\"M491 148.3C492.4 142.5 498.4 139 503.3 139C502 143.7 496.9 148.5 491 148.3\" fill=\"currentColor\"/><path d=\"M492.5 139.7C487.8 139.6 484.1 135.6 483.3 131.9C487.1 132.1 491.6 135.2 492.5 139.7\" fill=\"currentColor\"/><path d=\"M492.5 139.7C493.3 135.2 497.8 132.1 501.6 131.9C500.8 135.6 497.1 139.6 492.5 139.7\" fill=\"currentColor\"/><path d=\"M494.3 131.2C491 130.9 488.5 127.9 488.1 125.2C490.8 125.5 493.9 127.9 494.3 131.2\" fill=\"currentColor\"/><path d=\"M494.3 131.2C494.7 127.9 497.8 125.5 500.5 125.2C500.1 127.9 497.6 130.9 494.3 131.2\" fill=\"currentColor\"/><path d=\"M496.5 122.7C494.5 122.4 493.1 120.5 493 118.8C494.6 119.1 496.3 120.7 496.5 122.7\" fill=\"currentColor\"/><path d=\"M496.5 122.7C496.6 120.7 498.3 119.1 499.9 118.8C499.8 120.5 498.4 122.4 496.5 122.7\" fill=\"currentColor\"/><\/svg>","acuatica":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"440 104 100 100\"><path d=\"M490.1 180.6L490.1 128M477.4 180.6L477.4 140.7M502.8 180.6L502.8 144.3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path d=\"M490.1 124.3C490.4 124.3 490.6 124.4 490.9 124.4C491.2 124.5 491.4 124.5 491.7 124.6C491.9 124.7 492.1 124.9 492.4 125C492.6 125.2 492.8 125.3 493 125.5C493.2 125.7 493.3 125.9 493.5 126.1C493.6 126.4 493.8 126.6 493.9 126.8C494 127.1 494.1 127.3 494.1 127.6C494.2 127.9 494.2 128.1 494.2 128.4L494.2 143.8C494.2 144.1 494.2 144.4 494.1 144.6C494.1 144.9 494 145.1 493.9 145.4C493.8 145.6 493.6 145.9 493.5 146.1C493.3 146.3 493.2 146.5 493 146.7C492.8 146.9 492.6 147.1 492.4 147.2C492.1 147.4 491.9 147.5 491.7 147.6C491.4 147.7 491.2 147.8 490.9 147.8C490.6 147.9 490.4 147.9 490.1 147.9C489.8 147.9 489.6 147.9 489.3 147.8C489 147.8 488.8 147.7 488.5 147.6C488.3 147.5 488.1 147.4 487.8 147.2C487.6 147.1 487.4 146.9 487.2 146.7C487 146.5 486.9 146.3 486.7 146.1C486.6 145.9 486.4 145.6 486.3 145.4C486.2 145.1 486.2 144.9 486.1 144.6C486 144.4 486 144.1 486 143.8L486 128.4C486 128.1 486 127.9 486.1 127.6C486.2 127.3 486.2 127.1 486.3 126.8C486.4 126.6 486.6 126.4 486.7 126.1C486.9 125.9 487 125.7 487.2 125.5C487.4 125.3 487.6 125.2 487.8 125C488.1 124.9 488.3 124.7 488.5 124.6C488.8 124.5 489 124.5 489.3 124.4C489.6 124.4 489.8 124.3 490.1 124.3\" fill=\"currentColor\"/><path d=\"M477.4 137C477.8 137 478.2 137.1 478.6 137.3C479 137.4 479.4 137.7 479.6 138C479.9 138.3 480.2 138.6 480.3 139C480.5 139.4 480.6 139.8 480.6 140.2L480.6 152C480.6 152.4 480.5 152.8 480.3 153.2C480.2 153.6 479.9 153.9 479.6 154.2C479.4 154.5 479 154.8 478.6 154.9C478.2 155.1 477.8 155.2 477.4 155.2C477 155.2 476.6 155.1 476.2 154.9C475.8 154.8 475.5 154.5 475.2 154.2C474.9 153.9 474.6 153.6 474.5 153.2C474.3 152.8 474.2 152.4 474.2 152L474.2 140.2C474.2 139.8 474.3 139.4 474.5 139C474.6 138.6 474.9 138.3 475.2 138C475.5 137.7 475.8 137.4 476.2 137.3C476.6 137.1 477 137 477.4 137\" fill=\"currentColor\"/><path d=\"M450.2 182.4C462.9 176.9 472 187.8 484.7 182.4C497.4 176.9 506.4 187.8 519.1 182.4C524.6 179.7 528.2 180.6 531.8 182.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.3\" stroke-linecap=\"round\"/><path d=\"M450.2 191.4C462.9 186 472 196.9 484.7 191.4C497.4 186 506.4 196.9 519.1 191.4C524.6 188.7 528.2 189.6 531.8 191.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3.3\" stroke-linecap=\"round\"/><\/svg>"},"iconos":{"reconocerla":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"33.8 191.2 34 34.1\"><circle cx=\"50.8\" cy=\"208.3\" r=\"17\" fill=\"#e1e5c8\"/><path d=\"M44.1 208.3L43.5 207.4L43.3 207L43.1 206.6L43 206.3L42.9 206.1L42.8 205.8L42.7 205.6L42.6 205.4L42.6 205.1L42.5 204.9L42.5 204.8L42.4 204.6L42.4 204.4L42.4 204.2L42.4 204.1L42.3 203.9L42.3 203.7L42.3 203.6L42.3 203.4L42.3 203.3L42.3 203.1L42.3 203L42.3 202.9L42.3 202.7L42.3 202.6L42.3 202.5L42.3 202.3L42.3 202.2L42.3 202.1L42.3 202L42.3 201.8L42.3 201.7L42.3 201.6L42.3 201.5L42.4 201.4L42.4 201.3L42.4 201.2L42.4 201.1L42.4 200.9L42.5 200.8L42.5 200.7L42.5 200.6L42.5 200.5L42.6 200.4L42.6 200.3L42.6 200.2L42.6 200.2L42.7 200.1L42.7 200L42.7 199.9L42.8 199.8L42.8 199.7L42.8 199.6L42.9 199.5L42.9 199.4L43 199.3L43 199.2L43 199.1L43 199L43 198.9L43.1 198.8L43.1 198.7L43.1 198.6L43.1 198.5L43.2 198.4L43.2 198.3L43.2 198.2L43.2 198.1L43.3 198L43.3 197.9L43.3 197.8L43.4 197.7L43.4 197.6L43.4 197.5L43.5 197.4L43.5 197.3L43.5 197.2L43.5 197.2L43.6 197.1L43.6 197L44.1 197.5L44.2 197.4L44.2 197.3L44.2 197.2L44.3 197.2L44.3 197.1L44.4 197L44.4 196.9L44.4 196.8L44.5 196.7L44.5 196.6L44.5 196.6L44.6 196.5L44.6 196.4L44.7 196.3L44.7 196.2L44.8 196.2L44.8 196.1L44.8 196L44.9 195.9L44.9 195.8L45 195.8L45 195.7L45.1 195.6L45.1 195.5L45.7 196.1L45.7 196.1L45.8 196L45.8 195.9L45.9 195.8L45.9 195.8L46 195.7L46 195.6L46.1 195.6L46.1 195.5L46.2 195.4L46.2 195.3L46.3 195.3L46.3 195.2L46.4 195.1L46.4 195.1L46.5 195L46.5 195L46.6 194.9L46.6 194.8L46.7 194.8L46.8 194.7L46.8 194.6L46.9 194.6L46.9 194.5L47.5 195.1L47.5 195.1L47.6 195L47.7 194.9L47.7 194.9L47.8 194.8L47.8 194.8L47.9 194.7L48 194.6L48 194.6L48.1 194.5L48.2 194.5L48.2 194.4L48.3 194.4L48.3 194.3L48.4 194.3L48.5 194.2L48.5 194.2L48.6 194.1L48.7 194.1L48.7 194L48.8 194L48.9 193.9L48.9 193.9L49 193.9L49.6 194.4L49.6 194.4L49.7 194.3L49.8 194.3L49.8 194.2L49.9 194.2L50 194.2L50.1 194.1L50.1 194.1L50.2 194L50.3 194L50.3 194L50.4 193.9L50.5 193.9L50.6 193.8L50.6 193.8L50.7 193.8L50.8 193.7L50.9 193.7L51 193.7L51 193.6L51.1 193.6L51.2 193.6L51.3 193.5L51.4 193.5L51.9 194L52 194L52 194L52.1 194L52.2 193.9L52.3 193.9L52.4 193.9L52.5 193.8L52.5 193.8L52.6 193.8L52.7 193.8L52.8 193.7L52.9 193.7L53 193.7L53.1 193.7L53.1 193.7L53.2 193.6L53.3 193.6L53.4 193.6L53.5 193.6L53.6 193.6L53.7 193.5L53.8 193.5L53.9 193.5L54 193.5L54.4 194L54.5 194L54.6 193.9L54.7 193.9L54.8 193.9L54.9 193.9L55 193.9L55.1 193.9L55.2 193.9L55.3 193.9L55.4 193.9L55.5 193.9L55.6 193.8L55.7 193.8L55.8 193.8L55.9 193.8L56 193.8L56.1 193.8L56.2 193.8L56.3 193.8L56.4 193.8L56.5 193.8L56.6 193.8L56.7 193.9L56.9 193.9L57.2 194.2L57.4 194.2L57.5 194.2L57.6 194.2L57.7 194.3L57.8 194.3L57.9 194.3L58 194.3L58.1 194.3L58.2 194.3L58.4 194.3L58.5 194.3L58.6 194.3L58.7 194.4L58.8 194.4L59 194.4L59.1 194.4L59.2 194.4L59.3 194.5L59.4 194.5L59.6 194.5L59.7 194.6L59.8 194.6L60 194.6L60.1 194.6L60.4 194.9L60.5 194.9L60.6 195L60.8 195L60.9 195L61 195.1L61.2 195.1L61.3 195.1L61.4 195.2L61.6 195.2L61.7 195.3L61.9 195.3L62 195.4L62.2 195.4L62.3 195.5L62.5 195.6L62.6 195.6L62.8 195.7L62.9 195.8L63.1 195.8L63.3 195.9L63.5 196L63.6 196.1L63.8 196.2L64.1 196.4L64.2 196.7L64.2 196.9L64.3 197L64.3 197.2L64.3 197.4L64.3 197.5L64.3 197.7L64.3 197.8L64.3 198L64.3 198.1L64.3 198.2L64.3 198.4L64.3 198.5L64.3 198.6L64.3 198.7L64.3 198.9L64.3 199L64.3 199.1L64.3 199.2L64.3 199.3L64.2 199.4L64.2 199.5L64.2 199.6L64.2 199.7L64.3 200.1L64.3 200.2L64.3 200.3L64.3 200.4L64.2 200.5L64.2 200.6L64.2 200.7L64.2 200.8L64.1 200.9L64.1 201L64.1 201.1L64 201.2L64 201.3L64 201.4L64 201.5L63.9 201.6L63.9 201.7L63.8 201.7L63.8 201.8L63.8 201.9L63.7 202L63.7 202.1L63.7 202.2L63.6 202.2L63.6 202.3L63.8 202.8L63.8 202.9L63.7 202.9L63.7 203L63.7 203.1L63.6 203.2L63.6 203.3L63.5 203.3L63.5 203.4L63.4 203.5L63.4 203.6L63.4 203.6L63.3 203.7L63.3 203.8L63.2 203.9L63.2 203.9L63.1 204L63.1 204.1L63 204.1L63 204.2L62.9 204.3L62.9 204.3L62.8 204.4L62.7 204.5L62.7 204.5L63 205.1L63 205.1L62.9 205.2L62.9 205.3L62.8 205.3L62.7 205.4L62.7 205.5L62.6 205.5L62.6 205.6L62.5 205.6L62.5 205.7L62.4 205.8L62.3 205.8L62.3 205.9L62.2 205.9L62.2 206L62.1 206L62 206.1L62 206.2L61.9 206.2L61.8 206.3L61.8 206.3L61.7 206.4L61.6 206.4L61.6 206.5L62 207.1L61.9 207.1L61.8 207.2L61.8 207.2L61.7 207.3L61.6 207.3L61.6 207.4L61.5 207.4L61.4 207.5L61.4 207.5L61.3 207.6L61.2 207.6L61.1 207.6L61.1 207.7L61 207.7L60.9 207.8L60.9 207.8L60.8 207.9L60.7 207.9L60.6 207.9L60.6 208L60.5 208L60.4 208L60.3 208.1L60.3 208.1L60.7 208.8L60.6 208.8L60.5 208.8L60.4 208.9L60.4 208.9L60.3 209L60.2 209L60.1 209L60.1 209.1L60 209.1L59.9 209.1L59.8 209.2L59.7 209.2L59.7 209.2L59.6 209.2L59.5 209.3L59.4 209.3L59.3 209.3L59.2 209.4L59.2 209.4L59.1 209.4L59 209.4L58.9 209.5L58.8 209.5L58.7 209.5L59.2 210.2L59.1 210.2L59 210.2L58.9 210.3L58.8 210.3L58.7 210.3L58.6 210.3L58.6 210.4L58.5 210.4L58.4 210.4L58.3 210.4L58.2 210.4L58.1 210.4L58 210.5L57.9 210.5L57.8 210.5L57.7 210.5L57.7 210.5L57.6 210.6L57.5 210.6L57.4 210.6L57.3 210.6L57.2 210.6L57.1 210.6L57 210.6L57.4 211.3L57.3 211.3L57.2 211.3L57.1 211.3L57 211.3L56.9 211.4L56.8 211.4L56.7 211.4L56.6 211.4L56.5 211.4L56.4 211.4L56.3 211.4L56.2 211.4L56.1 211.4L56 211.4L55.9 211.4L55.8 211.4L55.7 211.4L55.6 211.4L55.5 211.4L55.4 211.4L55.3 211.4L55.2 211.4L55.1 211.4L55 211.4L55.4 212.1L55.3 212.1L55.2 212.1L55.1 212.1L55 212L54.9 212L54.8 212L54.6 212L54.5 212L54.4 212L54.3 212L54.2 212L54.1 212L54 212L53.9 212L53.8 212L53.6 212L53.5 211.9L53.4 211.9L53.3 211.9L53.2 211.9L53.1 211.9L53 211.9L52.8 211.9L52.7 211.8L52.6 211.8L52.5 211.9L52.4 211.9L52.3 211.9L52.2 211.9L52.1 211.9L52 211.9L51.9 211.9L51.8 211.9L51.7 211.9L51.6 211.9L51.5 211.9L51.4 211.8L51.3 211.8L51.1 211.8L51 211.8L50.9 211.8L50.8 211.8L50.7 211.8L50.6 211.8L50.5 211.7L50.3 211.7L50.2 211.7L50.1 211.7L50 211.7L49.8 211.6L49.7 211.6L49.6 211.6L49.5 211.6L49.3 211.5L49.2 211.5L49.1 211.4L48.9 211.4L48.8 211.4L48.7 211.3L48.5 211.3L48.4 211.2L48.2 211.2L48.1 211.1L47.9 211L47.8 211L47.6 210.9L47.4 210.8L47.3 210.8L47.1 210.7L46.9 210.6L46.7 210.5L46.5 210.4L46.3 210.2L46.1 210.1L45.9 210L45.7 209.8L45.4 209.6L45.1 209.3L44.8 209L44.1 208.3\" fill=\"#456301\"/><path d=\"M44.1 208.3L44.5 207.9L45 207.6L45.5 207.2L45.9 206.9L46.4 206.6L46.9 206.2L47.4 205.9L47.8 205.6L48.3 205.3L48.8 205L49.3 204.6L49.8 204.3L50.3 204L50.8 203.7L51.3 203.4L51.8 203.1L52.3 202.8L52.8 202.5L53.3 202.2L53.8 201.9L54.3 201.6L54.8 201.4L55.3 201.1L55.8 200.8L56.3 200.5L56.8 200.2L57.3 199.9L57.8 199.7L58.3 199.4L58.9 199.1L59.4 198.8L59.9 198.6L60.4 198.3L60.9 198L61.5 197.7L62 197.5L62.5 197.2L63 196.9L63.6 196.7L64.1 196.4\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.7\" stroke-linecap=\"round\"/><path d=\"M47.1 206.1C46.9 202.9 46.9 200 47.2 197.3\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M47.1 206.1C50.4 207.3 53.5 208.3 56.3 208.9\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M51.5 203.3C51.6 200.4 51.8 197.7 52.3 195.4\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M51.5 203.3C54.7 204.3 57.6 205.1 60.3 205.6\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M56.1 200.6C56.7 198.5 57.6 196.7 58.8 195.1\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M56.1 200.6C58.7 201 61.1 201.1 63.2 200.8\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M60.7 198.1C61.2 197.1 61.9 196.3 62.8 195.9\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><path d=\"M60.7 198.1C62.1 198.2 63.2 198.1 64.1 197.6\" fill=\"none\" stroke=\"#8fb44a\" stroke-width=\"0.4\" stroke-linecap=\"round\"/><\/svg>","usos":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"33.8 249 34 34.1\"><circle cx=\"50.8\" cy=\"266\" r=\"17\" fill=\"#e1e5c8\"/><path d=\"M50.8 263.7C54.7 260.3 58.1 256.4 50.8 253C43.4 256.4 46.8 260.3 50.8 263.7\" fill=\"#ec8004\"/><path d=\"M52.7 264.9C57.6 266.6 62.8 267.6 62 259.5C55.4 254.8 53.7 259.7 52.7 264.9\" fill=\"#ec8004\"/><path d=\"M52.7 267.1C53.7 272.3 55.4 277.2 62 272.5C62.8 264.4 57.6 265.4 52.7 267.1\" fill=\"#ec8004\"/><path d=\"M50.8 268.3C46.8 271.7 43.4 275.6 50.8 279C58.1 275.6 54.7 271.7 50.8 268.3\" fill=\"#ec8004\"/><path d=\"M48.8 267.1C43.9 265.4 38.7 264.4 39.5 272.5C46.1 277.2 47.8 272.3 48.8 267.1\" fill=\"#ec8004\"/><path d=\"M48.8 264.9C47.8 259.7 46.1 254.8 39.5 259.5C38.7 267.6 43.9 266.6 48.8 264.9\" fill=\"#ec8004\"/><circle cx=\"50.8\" cy=\"266\" r=\"3.4\" fill=\"#c7261c\"/><circle cx=\"50.8\" cy=\"266\" r=\"1.4\" fill=\"#9cbb32\"/><\/svg>","fauna":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"33.8 307.5 34 34.1\"><circle cx=\"50.8\" cy=\"324.5\" r=\"17\" fill=\"#e1e5c8\"/><path d=\"M50.8 323C48.3 312.4 38.1 313.3 38.6 321.6C39.6 326 46.9 325 50.8 323\" fill=\"#ec8004\"/><path d=\"M50.8 323C53.2 312.4 63.4 313.3 62.9 321.6C61.9 326 54.6 325 50.8 323\" fill=\"#ec8004\"/><path d=\"M50.8 324.5C47.8 326.9 41 328.9 43 334.7C45.4 336.6 49.3 330.8 50.8 324.5\" fill=\"#c7261c\"/><path d=\"M50.8 324.5C53.7 326.9 60.5 328.9 58.5 334.7C56.1 336.6 52.2 330.8 50.8 324.5\" fill=\"#c7261c\"/><path d=\"M50.8 316.2C52.1 319.2 52 329.8 50.8 334.2C49.5 329.8 49.4 319.2 50.8 316.2\" fill=\"#4e3218\"/><path d=\"M50.8 316.7C49.3 313.8 46.9 313.3 44.9 311.4\" fill=\"none\" stroke=\"#4e3218\" stroke-width=\"0.6\" stroke-linecap=\"round\"/><path d=\"M50.8 316.7C52.2 313.8 54.6 313.3 56.6 311.4\" fill=\"none\" stroke=\"#4e3218\" stroke-width=\"0.6\" stroke-linecap=\"round\"/><\/svg>"}};
  var app = document.getElementById('app');

  var PORTE_SVG = {
    'árbol': 'arbol', 'arbusto': 'arbusto', 'herbácea': 'herbacea', 'gramínea': 'graminea', 'conífera': 'conifera',
    'palmera': 'palmera', 'trepadora': 'trepadora', 'roseta basal': 'roseta', 'bulbosa': 'bulbosa',
    'cubresuelos': 'cubresuelos', 'helecho': 'helecho', 'acuática': 'acuatica'
  };
  var LOTE = { arb: 'Arbóreas y arbustivas', herb: 'Herbáceas' };
  var ESTACIONES = [['primavera', 'Primavera'], ['verano', 'Verano'], ['otono', 'Otoño'], ['invierno', 'Invierno']];
  var ICO = {
    primavera: '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="currentColor"><circle cx="20" cy="11" r="6"/><circle cx="28.6" cy="17.2" r="6"/><circle cx="25.3" cy="27.3" r="6"/><circle cx="14.7" cy="27.3" r="6"/><circle cx="11.4" cy="17.2" r="6"/></g><circle cx="20" cy="20" r="4.6" fill="#fffdf6"/></svg>',
    verano: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="8" fill="currentColor"/><g stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5 32 32M8 32l3.5-3.5M28.5 11.5 32 8"/></g></svg>',
    otono: '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" d="M33 6C17 6 8 13 8 24c0 3 .8 5.6 2.2 7.6L6 36l2.2 2 4.3-4.3C14.5 35 17 36 20 36c10 0 14-11 13-30z"/><path d="M12.5 33.5C18 26 23 19 29 11" stroke="#fffdf6" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    invierno: '<svg viewBox="0 0 40 40" aria-hidden="true"><g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"><path d="M20 37V17M20 25l-8-8M20 21l7-7M12 17l-3-7M12 17l-7 0M27 14l1-7M27 14l7-2M20 17l0-11"/></g></svg>',
    mapa: '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" d="M20 3c-7 0-12 5.3-12 12 0 8.6 12 22 12 22s12-13.4 12-22C32 8.3 27 3 20 3zm0 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    flecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function cientifico(s) {
    // en botánica, «×», «sp.» y «var.» van en redonda
    return esc(s).replace(/(^|\s)(×|sp\.|spp\.|var\.|subsp\.|f\.)(?=\s|$)/g, '$1<span class="r">$2</span>');
  }
  function porteSvg(e) { var k = PORTE_SVG[(e.porte || '').toLowerCase()]; return (k && SVG.portes[k]) || ''; }
  function sinLectura(svg) { return svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" '); }
  function visibles() { return TODAS.filter(function (e) { return !e.oculta; }); }
  function codigoNormal(raw) {
    var m = String(raw || '').match(/^\s*([ah])\s*-?\s*(\d{1,2})\s*$/i);
    return m ? m[1].toUpperCase() + '-' + (m[2].length < 2 ? '0' + m[2] : m[2]) : null;
  }
  function leerDireccion() {
    var q = location.search.replace(/^\?/, '');
    try { q = decodeURIComponent(q); } catch (err) { /* se usa tal cual */ }
    if (!q) q = location.hash.replace(/^#/, '');
    var partes = q.split('&');
    var primero = partes[0] || '';
    if (/^(codigo|c|e|especie)=/i.test(primero)) primero = primero.split('=')[1] || '';
    var banderas = partes.slice(1).map(function (p) { return p.split('=')[0].toLowerCase(); });
    return { texto: primero, codigo: codigoNormal(primero), desdeFicha: banderas.indexOf('f') >= 0, vacio: !q };
  }
  function titulo(t) {
    document.title = (t ? t + ' · ' : '') + 'La colección · Jardín Botánico Municipal Florencio Malatesta';
  }
  function enlaceCorto(codigo) {
    // forma canónica: la portada con el código (la misma que los QR impresos)
    try { return new URL('../?' + codigo, location.href).href; } catch (err) { return location.href; }
  }

  // ---------- ficha ----------
  function ficha(e) {
    titulo(e.nombre + ' (' + e.cientifico + ')');
    var origen = (e.origen || '').toLowerCase();
    var exo = norm(origen) === 'exotica';
    var bloques = [
      ['reconocerla', 'Cómo reconocerla', e.reconocerla],
      ['usos', 'Usos y cultura', e.usos],
      ['fauna', 'Fauna asociada', e.fauna]
    ].filter(function (b) { return b[2]; }).map(function (b) {
      return '<section class="bloque">' + sinLectura(SVG.iconos[b[0]] || '') +
        '<div><h2 class="titulo-sec">' + esc(b[1]) + '</h2><p>' + esc(b[2]) + '</p></div></section>';
    }).join('');
    var est = ESTACIONES.map(function (s) {
      return '<div class="est" data-est="' + s[0] + '">' + ICO[s[0]] + '<b>' + s[1] + '</b><small>Próximamente</small></div>';
    }).join('');
    var enPlano = window.PLANO && window.PLANO.ejemplares && window.PLANO.ejemplares[e.codigo];
    var reservada = e.ubicacion === 'reservada';
    var ubic = reservada
      ? 'Es una especie sensible a la recolección: por eso no publicamos dónde está.'
      : (enPlano && enPlano.length ? 'Está marcada en el plano del Jardín.' : 'Muy pronto vas a ver acá dónde está este ejemplar.');
    var ubicEnlace = reservada ? ''
      : (enPlano && enPlano.length ? ' <a href="../plano/#' + esc(e.codigo) + '">Ver dónde está</a>' : ' <a href="../plano/">Ver el plano del Jardín</a>');
    var lista = visibles().filter(function (x) { return x.lote === e.lote; })
      .sort(function (a, b) { return a.codigo.localeCompare(b.codigo); });
    var i = -1;
    lista.forEach(function (x, k) { if (x.codigo === e.codigo) i = k; });
    var ant = i > 0 ? lista[i - 1] : null, sig = i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;

    app.innerHTML =
      '<article class="ficha">' +
      '<p class="migas"><a href="./">← Todas las especies</a></p>' +
      '<div class="meta"><span class="rotulo">' + esc(LOTE[e.lote] || '') + ' · ' + esc(e.codigo) + '</span>' +
      '<span class="pill' + (exo ? ' exotica' : '') + '">' + esc(origen) + '</span></div>' +
      '<div class="cabeza"><div>' +
      (e.familia ? '<p class="rotulo familia">' + esc(e.familia) + '</p>' : '') +
      '<h1>' + esc(e.nombre) + '</h1>' +
      '<p class="cientifico">' + cientifico(e.cientifico) + '</p>' +
      (e.tambien ? '<p class="tambien">También: ' + esc(e.tambien) + '</p>' : '') +
      '</div>' +
      (porteSvg(e) ? '<figure class="porte">' + sinLectura(porteSvg(e)) + '<figcaption>' + esc(e.porte) + '</figcaption></figure>' : '') +
      '</div><hr>' + bloques +
      '<section class="seccion-ficha"><h2 class="titulo-sec">Las cuatro estaciones</h2><div class="estaciones">' + est + '</div></section>' +
      '<section class="seccion-ficha"><h2 class="titulo-sec">Dónde está</h2><div class="aviso-ficha">' + ICO.mapa + '<span>' + esc(ubic) + ubicEnlace + '</span></div></section>' +
      '<div class="acciones">' +
      '<a class="boton" href="' + esc(LINKTREE) + '" rel="noopener">Redes y novedades del Jardín ' + ICO.flecha + '</a>' +
      '<button class="boton sec" id="compartir" type="button" hidden>Compartir esta ficha</button>' +
      '</div>' +
      '<p class="redes-ficha">Seguinos en Instagram: <a href="' + esc(INSTAGRAM) + '" rel="noopener">@jbflormalatesta</a></p>' +
      '<nav class="vecinos" aria-label="Otras fichas">' +
      (ant ? '<a href="?' + esc(ant.codigo) + '"><span>← Anterior</span><b>' + esc(ant.nombre) + '</b></a>' : '') +
      (sig ? '<a class="sig" href="?' + esc(sig.codigo) + '"><span>Siguiente →</span><b>' + esc(sig.nombre) + '</b></a>' : '') +
      '</nav></article>';

    // fotos: aparecen solas si existe fotos/especies/CÓDIGO-estación.jpg
    Array.prototype.forEach.call(app.querySelectorAll('.est'), function (tile) {
      var s = tile.getAttribute('data-est');
      var nombreEst = ESTACIONES.filter(function (x) { return x[0] === s; })[0][1];
      var src = '../fotos/especies/' + e.codigo + '-' + s + '.jpg';
      var img = new Image();
      img.onload = function () {
        var a = document.createElement('a');
        a.className = 'est foto-est';
        a.href = src;
        a.innerHTML = '<img src="' + src + '" alt="' + esc(e.nombre + ' en ' + nombreEst.toLowerCase()) + '" loading="lazy"><b>' + nombreEst + '</b>';
        tile.parentNode.replaceChild(a, tile);
      };
      img.src = src;
    });

    var btn = document.getElementById('compartir');
    if (navigator.share) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        navigator.share({ title: e.nombre + ' · Jardín Botánico Municipal Florencio Malatesta', url: enlaceCorto(e.codigo) })
          .catch(function () {});
      });
    }
    window.scrollTo(0, 0);
  }

  // ---------- mensajes ----------
  function mensaje(t, cuerpo) {
    titulo(t);
    app.innerHTML = '<div class="mensaje"><h1>' + esc(t) + '</h1><p>' + cuerpo + '</p>' +
      '<div class="botones"><a class="boton" href="./">Ver todas las especies ' + ICO.flecha + '</a></div></div>';
  }

  // ---------- listado ----------
  function listado() {
    titulo('');
    var estado = { q: '', lote: 'todas', origen: 'todas' };
    var todas = visibles().slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }); });
    app.innerHTML =
      '<section class="intro-col"><p class="volanta">Jardín Botánico Municipal · Marcos Paz</p><h1>La colección</h1>' +
      '<span class="filete" aria-hidden="true"></span>' +
      '<p>Cada planta señalizada del Jardín tiene su ficha: cómo reconocerla, sus usos y la fauna que la visita. ' +
      'Buscala por su nombre o por el número de colección de la etiqueta.</p></section>' +
      '<div class="buscador">' + ICO.lupa + '<input id="q" type="search" autocomplete="off" enterkeyhint="search" ' +
      'placeholder="Tala, Celtis, A-71…" aria-label="Buscar especie por nombre, nombre científico o número"></div>' +
      '<div class="chips" role="group" aria-label="Filtros">' +
      '<button class="chip" data-f="lote" data-v="todas" aria-pressed="true">Todas</button>' +
      '<button class="chip" data-f="lote" data-v="arb" aria-pressed="false">Árboles y arbustos</button>' +
      '<button class="chip" data-f="lote" data-v="herb" aria-pressed="false">Herbáceas</button>' +
      '<span class="sep"></span>' +
      '<button class="chip" data-f="origen" data-v="todas" aria-pressed="true">Nativas y exóticas</button>' +
      '<button class="chip" data-f="origen" data-v="nativa" aria-pressed="false">Nativas</button>' +
      '<button class="chip" data-f="origen" data-v="exotica" aria-pressed="false">Exóticas</button>' +
      '</div><p class="cuenta" id="cuenta"></p><ul class="lista" id="lista"></ul>';

    var ul = document.getElementById('lista'), cuenta = document.getElementById('cuenta'), q = document.getElementById('q');
    function pintar() {
      var t = norm(estado.q).trim();
      var tc = t.replace(/[\s-]/g, '');
      var res = todas.filter(function (e) {
        if (estado.lote !== 'todas' && e.lote !== estado.lote) return false;
        if (estado.origen !== 'todas' && norm(e.origen) !== estado.origen) return false;
        if (!t) return true;
        var hay = norm([e.nombre, e.tambien, e.cientifico, e.familia, e.codigo].join(' | '));
        return hay.indexOf(t) >= 0 || norm(e.codigo).replace('-', '') === tc;
      });
      if (t) {
        var puntaje = function (e) {
          var n = norm(e.nombre), a = norm(e.tambien), c = norm(e.cientifico);
          if (n === t || a === t || norm(e.codigo).replace('-', '') === tc) return 0;
          if (n.indexOf(t) === 0 || a.indexOf(t) === 0) return 1;
          if ((' ' + n).indexOf(' ' + t) >= 0 || c.indexOf(t) === 0) return 2;
          return 3;
        };
        res = res.map(function (e, i) { return [puntaje(e), i, e]; })
          .sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; })
          .map(function (x) { return x[2]; });
      }
      cuenta.innerHTML = '<span>' + (res.length === 1 ? '1 especie' : res.length + ' especies') + '</span>' +
        '<span class="leyenda"><span class="dot"></span> nativa <span class="dot exotica"></span> exótica</span>';
      ul.innerHTML = res.length ? res.map(function (e) {
        var exo = norm(e.origen) === 'exotica';
        return '<li><a href="?' + esc(e.codigo) + '">' + sinLectura(porteSvg(e)) +
          '<span><span class="n">' + esc(e.nombre) + '<span class="dot' + (exo ? ' exotica' : '') + '" role="img" aria-label="' + (exo ? 'exótica' : 'nativa') + '"></span></span>' +
          '<span class="c">' + cientifico(e.cientifico) + '</span></span>' +
          '<span class="cod">' + esc(e.codigo) + '</span></a></li>';
      }).join('') : '<li class="vacio">No encontramos ninguna especie con ese nombre. Probá con otra palabra o con el número de la etiqueta.</li>';
    }
    q.addEventListener('input', function () { estado.q = q.value; pintar(); });
    Array.prototype.forEach.call(app.querySelectorAll('.chip'), function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        estado[f] = b.getAttribute('data-v');
        Array.prototype.forEach.call(app.querySelectorAll('.chip[data-f="' + f + '"]'), function (o) {
          o.setAttribute('aria-pressed', String(o === b));
        });
        pintar();
      });
    });
    pintar();
  }

  // ---------- ruteo ----------
  var dir = leerDireccion();
  if (dir.vacio) { listado(); return; }
  if (dir.codigo && dir.desdeFicha && SITIO.qrFichas === 'linktree') { location.replace(LINKTREE); return; }
  var e = dir.codigo && TODAS.filter(function (x) { return x.codigo === dir.codigo; })[0];
  if (e && !e.oculta) { ficha(e); return; }
  if (e && e.oculta) {
    mensaje('Ficha en revisión', 'Estamos revisando la ficha de esta planta. Mientras tanto, podés recorrer el resto de la colección.');
    return;
  }
  mensaje('No encontramos esa ficha',
    (dir.texto ? 'No hay ninguna especie con el código «' + esc(dir.texto) + '». ' : '') +
    'Revisá el número de colección de la etiqueta o buscá la planta por su nombre.');
})();
