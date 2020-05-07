var gulp = require("gulp");
var plugin = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();
var del = require("del");

var destAssetsDir = "dest/assets";

var libsCss = [
  "node_modules/modern-css-reset/dist/reset.css"
];

var libsJs = [
  "./node_modules/@babel/polyfill/dist/polyfill.js",
  "./node_modules/svg4everybody/dist/svg4everybody.js"
];

var localCss = [];
var localJs = [];

var allCss = libsCss.concat(localCss);
var allJs = libsJs.concat(localJs);

// --- STATIC SERVER
gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "dest"
    }
  });
});

// --- PUG
gulp.task("pug", function () {
  return gulp
    .src(["src/pug/pages/*.pug", "!src/pug/pages/_*.pug"])
    .pipe( plugin.pug({ pretty: true }) )
    .on( "error", plugin.notify.onError("*** PUG ***: <%= error.message %>") )
    // .pipe( plugin.notify({ onLast: true, message: "PUG done!" }) )
    .pipe(gulp.dest("dest"));
});


// --- CSS
gulp.task("css-app", function () {
  return gulp
    .src(["src/stylus/main.styl"])
    .pipe(plugin.sourcemaps.init())
    .pipe(
      plugin.stylus().on("error", plugin.notify.onError(
        "*** STYLUS ***: <%= error.message %>"))
    )
    .pipe(
      plugin.autoprefixer({
        remove: false,
        cascade: false
      })
    )
    .pipe(plugin.sourcemaps.write("../css"))
    .pipe(gulp.dest(destAssetsDir + "/css"))
    .pipe(browserSync.stream());
});

gulp.task("css-minify", function () {
  return gulp
    .src([destAssetsDir + "/css/main.css"])
    .pipe(plugin.concat("main.min.css"))
    .pipe(plugin.cleanCss())
    .pipe(gulp.dest(destAssetsDir + "/css/"));
});

gulp.task("css-bundle", function () {
  return gulp
    .src([destAssetsDir + '/css/**/libs.min.css', destAssetsDir + 'css/**/main.min.css'])
    .pipe(plugin.concat("bundle.min.css"))
    .pipe(gulp.dest(destAssetsDir + "/css/"))
});

gulp.task("css", gulp.series("css-app", "css-minify", "css-bundle"));

// --- JS
gulp.task("js-app", function () {
  const js = ["src/js/main.js"];

  return gulp
    .src(js)
    .pipe(plugin.sourcemaps.init())
    .pipe(
      plugin.babel({
        retainLines: true,
        presets: ["@babel/env"]
      })
    )
    .pipe(plugin.concat("main.js"))
    .pipe(plugin.sourcemaps.write("../js"))
    .pipe(gulp.dest(destAssetsDir + "/js"))
    .pipe(browserSync.stream());
});

gulp.task("js-minify", function () {
  return gulp
    .src([destAssetsDir + "/js/main.js"])
    .pipe(plugin.concat("main.min.js"))
    .pipe(plugin.uglify())
    .pipe(gulp.dest(destAssetsDir + "/js"));
});

gulp.task("js-bundle", function () {
  return gulp
    .src([destAssetsDir + '/js/**/libs.min.js', destAssetsDir + 'js/**/main.min.js'])
    .pipe(plugin.concat("bundle.min.js"))
    .pipe(gulp.dest(destAssetsDir + "/js/"))
});

gulp.task("js", gulp.series("js-app", "js-minify", "js-bundle"));


// --- LIBS
gulp.task("copy-libs-modules", function() {
  var libs = libsCss.concat(libsJs);
  return gulp
    .src(libs)
    .pipe(gulp.dest(destAssetsDir + "/libs/modules"));
});

gulp.task("copy-libs", function() {
  var libs = libsCss.concat(libsJs);
  if (libs.length == 0) return;
  return gulp
    .src(libs)
    .pipe(gulp.dest(destAssetsDir + "/libs/modules"));
});

gulp.task("libs-js", function() {
  return gulp.src(allJs)
    .pipe(plugin.concat("libs.min.js"))
    .pipe(plugin.uglify())
    .pipe(gulp.dest(destAssetsDir + "/js"));
});

gulp.task("libs-css", function() {
  return gulp.src(allCss)
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.concat("libs.min.css"))
    .pipe(plugin.cleanCss())
    .pipe(plugin.sourcemaps.write("../css"))
    .pipe(gulp.dest(destAssetsDir + "/css"));
});

gulp.task("libs", gulp.series("copy-libs-modules", "copy-libs", "libs-js", "libs-css"));


// Assets
gulp.task("assets", function () {
  return gulp.src("src/assets/**/*.*").pipe(gulp.dest(destAssetsDir));
});

// SVG
gulp.task("svg-icons", function () {
  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg"])
    .pipe( plugin.svgmin({ plugins: [{ removeAttrs: { attrs: "(fill|stroke|opacity)" } }] }) )
    .pipe(
      plugin.svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg", // имя файла
            bust: false, // отключаем хэш в имени файла
            dest: "" // отключаем файловую струтуру (по умолчанию, создаем в папке gulp.dest)
          }
        }
      })
    )
    .pipe(gulp.dest(destAssetsDir + "/icons"));
});

gulp.task("svg-icons-color", function () {
  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg"])
    .pipe(plugin.svgmin())
    .pipe(
      plugin.svgSprite({
        mode: {
          symbol: {
            sprite: "sprite-color.svg", // имя файла
            bust: false, // отключаем хэш в имени файла
            dest: "" // отключаем файловую струтуру (по умолчанию, создаем в папке gulp.dest)
          }
        }
      })
    )
    .pipe(gulp.dest(destAssetsDir + "/icons"));
});

gulp.task("svg", gulp.series("svg-icons", "svg-icons-color"));

// --- WATCHER
gulp.task("watcher", function (done) {
  browserSync.reload("/");
  done();
});

// --- DEL
gulp.task("del", function (done) {
  del.sync(["dest/**"]);
  done();
});

// --- WATCH
gulp.task("watch", function () {
  browserSync.init({
    server: {
      baseDir: "dest"
    },
    open: false
  });

  gulp.watch("src/pug/**/*.pug", gulp.series("pug", "watcher"));

  gulp.watch("src/js/*.js", gulp.series("js", "watcher"));

  gulp.watch("src/**/*.styl", gulp.series("css"));
});

gulp.task("media", gulp.series("assets", "svg", "watcher"),
  function () {});

gulp.task("modules", gulp.series("libs", "watcher"),
  function () {});

gulp.task(
  "build",
  gulp.series(
    "assets",
    "svg",
    "libs",
    "css",
    "js",
    "pug"
  ),
  function () {}
);

gulp.task("rebuild", gulp.series("del", "build"), function () {});

gulp.task("default", gulp.series("build", "watch"), function () {});
