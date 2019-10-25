var gulp = require("gulp");
var plugin = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();
var del = require("del");

var destAssetsDir = "dest/assets";

var css = "stylus"; // 'sass' or 'stylus'

var libsCss = [
  "node_modules/modern-css-reset/dist/reset.min.css"
];

var localCss = [];


var libsJs = [
  "node_modules/svg4everybody/dist/svg4everybody.min.js"
];

var localJs = [];


// Static server
gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "dest"
    }
  });
});

// CSS
if (css == "stylus") {
  gulp.task("css", function () {
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
}

if (css == "scss") {
  gulp.task("css", function () {
    return gulp
      .src(["src/scss/main.scss"])
      .pipe(plugin.sourcemaps.init())
      .pipe(
        plugin
        .sass({
          outputStyle: "expanded"
        })
        .on("error", plugin.notify.onError(
          "*** SASS ***: <%= error.message %>"))
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
}

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

// Pug
gulp.task("pug", function () {
  return gulp
    .src(["src/pug/*.pug", "!src/pug/-*.pug"])
    .pipe(
      plugin.pug({
        pretty: true,
        basedir: "src/"
      })
    )
    .on("error", plugin.notify.onError("*** PUG ***: <%= error.message %>"))
    // .pipe(
    //   plugin.notify({
    //     onLast: true,
    //     // message: "PUG done!"
    //   })
    // )
    .pipe(gulp.dest("dest"));
});

// JS
gulp.task("js", function () {
  const js = ["src/js/main.js"];

  return gulp
    .src(js)
    .pipe(plugin.sourcemaps.init())
    .pipe(
      plugin.babel({
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

// Copy libs
gulp.task("copylibs", function () {
  var modulesLibs = libsCss.concat(libsJs);

  var stream = gulp
    .src(modulesLibs, {
      // base: "./node_modules/"
    })
    .pipe(gulp.dest(destAssetsDir + "/libs/modules"));

  if (localCss.length > 0 || localJs.length > 0) {
    var localLibs = localCss.concat(localJs);

    var stream = gulp
      .src(localLibs)
      .pipe(gulp.dest(destAssetsDir + "/libs"));
  }

  return stream;
});

// Libs
gulp.task("libs", function () {
  var css = libsCss.concat(localCss);
  var js = libsJs.concat(localJs);

  // CSS libs
  var stream = gulp
    .src(css)
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.concat("libs.min.css"))
    .pipe(plugin.cleanCss())
    .pipe(plugin.sourcemaps.write("../css"))
    .pipe(gulp.dest(destAssetsDir + "/css"));

  // JS libs
  var stream = gulp
    .src(js)
    .pipe(plugin.concat("libs.min.js"))
    .pipe(plugin.uglify())
    .pipe(gulp.dest(destAssetsDir + "/js"));

  return stream;
});

// Assets
gulp.task("assets", function () {
  return gulp.src("src/assets/**/*.*").pipe(gulp.dest(destAssetsDir));
});

// SVG
gulp.task("svg", function () {

  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite-color.s*", "!src/assets/icons/sprite.s*"])
    .pipe(
      plugin.svgmin({
        plugins: [{
          removeAttrs: {
            attrs: "(fill|stroke|opacity)"
          }
        }]
      })
    )
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

gulp.task("svg-color", function () {

  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite-color.s*", "!src/assets/icons/sprite.s*"])
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

gulp.task("watcher", function (done) {
  browserSync.reload("/");
  done();
});

gulp.task("del", function (done) {
  del.sync(["dest/**"]);
  done();
});

// Watch
gulp.task("watch", function () {
  browserSync.init({
    server: {
      baseDir: "dest"
    },
    open: false
  });

  gulp.watch("src/**/*.pug", gulp.series("pug", "watcher"));

  gulp.watch("src/**/*.js", gulp.series("js", "js-minify", 'js-bundle'));

  if (css == "scss") {
    gulp.watch("src/**/*.scss", gulp.series("css", "css-minify", "css-bundle"));
  }

  if (css == "stylus") {
    gulp.watch("src/**/*.styl", gulp.series("css", "css-minify", "css-bundle"));
  }
});

gulp.task("media", gulp.series("assets", "svg", "svg-color", "watcher"),
  function () {});

gulp.task("modules", gulp.series("copylibs", "libs", "watcher"),
  function () {});

gulp.task(
  "build",
  gulp.series(
    "assets",
    "svg",
    "svg-color",
    "copylibs",
    "libs",
    "css",
    "css-minify",
    "css-bundle",
    "js",
    "js-minify",
    "js-bundle",
    "pug",
  ),
  function () {}
);

gulp.task("rebuild", gulp.series("del", "build"), function () {});

gulp.task("default", gulp.series("build", "watch"), function () {});
