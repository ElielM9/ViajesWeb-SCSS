/* Importar funciones de gulp */
import gulp from "gulp";
const { src, dest, watch, parallel } = gulp;

// Plugins HTML
import htmlMin from "gulp-htmlmin";

// Plugins CSS
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import clean from "gulp-purgecss";

const sass = gulpSass(dartSass);

// Plugins JS
import terser from "gulp-terser-js";

// Plugins para imágenes
import imgMin from "gulp-imagemin";
import cache from "gulp-cache";
import webp from "gulp-webp";
import avif from "gulp-avif";

// Plugins extra
import plumber from "gulp-plumber";
import cacheBust from "gulp-cache-bust";
import sourcemaps from "gulp-sourcemaps";

// Funciones

/** HTML
 * Toma todos los archivos HTML en la carpeta `src/views`, las minimiza, agrega una marca de tiempo al nombre del archivo, y los envía a la carpeta `public`
 * @param done - Esta es una función callback que le dice a gulp cuando la tarea se completó.
 */
export function html(done) {
  const options = {
    collapseWhitespace: true,
    removeComments: true,
  };
  const cache = {
    type: `timestamp`,
  };

  src("src/views/**/*.html")
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(htmlMin(options))
    .pipe(cacheBust(cache))
    .pipe(sourcemaps.write(`.`))
    .pipe(dest("public/"));

  done();
}

/** SASS
 * Toma todos los archivos SCSS en la carpeta src/scss, los compila y concatena en un solo archivo styles.css, agrega prefijos de proveedores  a las reglas de CSS, minifica, y escribe un sourcemap en la carpeta public/styles
 * @param done - Es una función callback que indica a gulp cuando la tarea terminó.
 */
export function scss(done) {
  const cssPlugins = [autoprefixer(), cssnano()];

  src(`src/scss/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss(cssPlugins))
    .pipe(sourcemaps.write(`.`))
    .pipe(dest(`public/styles`));

  done();
}

/**
 * Esta función limpia los estilos que no se usan
 * @param done - Es una función callback que indica a gulp cuando la tarea terminó.
 */
export function cleanCSS(done) {
  const content = {
    content: [`public/*.html`],
  };

  src(`public/styles/styles.css`)
    .pipe(clean(content))
    .pipe(dest(`public/styles`));

  done();
}

/** JS
 * Minifica y genera sourcemaps para todos los archivos JS en `src/js` y los pasa a `public/js`.
 */
export function js(done) {
  const presets = {
    presets: ["@babel/preset-env"],
  };

  src(`src/js/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(terser())
    .pipe(sourcemaps.write())
    .pipe(dest(`public/js`));

  done();
}

/**
 * Toma las imágenes en la carpeta `src/assets/img`, los optimiza, y las guarda en la carpeta `public/assets/img`
 * @param done - Indica a gulp cuando una tarea terminó.
 */
export function img(done) {
  const options = {
    optimizationLevel: 3,
  };

  src(`src/assets/img/**/*.{png,jpg,svg}`)
    .pipe(plumber())
    .pipe(cache(imgMin(options)))
    .pipe(dest(`public/assets/img`));

  done();
}

/**
 * Toma las imágenes en la carpeta `src/assets/img`, los convierte al formato Webp, y las guarda en la carpeta `public/assets/img`
 * @param done - Indica a gulp cuando una tarea terminó.
 */
export function vWebp(done) {
  const options = {
    quality: 50,
  };

  src(`src/assets/img/**/*.{png,jpg}`)
    .pipe(plumber())
    .pipe(webp(options))
    .pipe(dest(`public/assets/img`));

  done();
}

/**
 * Toma las imágenes en la carpeta `src/assets/img`, los convierte al formato AVIF, y las guarda en la carpeta `public/assets/img`
 * @param done - Indica a gulp cuando una tarea terminó.
 */
export function vAvif(done) {
  const options = {
    quality: 50,
  };

  src(`src/assets/img/**/*.{png,jpg}`)
    .pipe(plumber())
    .pipe(avif(options))
    .pipe(dest(`public/assets/img`));

  done();
}

/**
 * Observa los cambios en el HTML, CSS, y las imágenes y corre las tareas respectivas para ejecutar los cambios detectados.
 * @param done - Es una función callback que indica a gulp cuando la tarea terminó.
 */
export function dev(done) {
  watch(`src/views/**/*.html`, html);
  watch(`src/scss/**/*.scss`, scss);
  watch(`src/js/**/*.js`, js);
  watch(`src/assets/img/**/*.{png,jpg,svg}`, img);

  done();
}

/* Exporta las funciones que se utilizan en el gulpfile.js */
export default parallel(img, vWebp, vAvif, dev);
