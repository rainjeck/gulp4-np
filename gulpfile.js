var gulp = require("gulp");
var plugin = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();
var http = require("http");
var st = require("st");

var libscss = [
  "node_modules/reset-css/reset.css",
];

var libsjs = [
  "node_modules/svg4everybody/dist/svg4everybody.min.js",
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/jquery-form-validator/form-validator/jquery.form-validator.min.js",
  "node_modules/jquery-form-validator/form-validator/lang/ru.js",
];

// Static server
gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "dest",
      open: false
    }
  });
});

// Copy libs
gulp.task("copylibs", function() {
  var libs = libscss.concat(libsjs);

	return gulp
		.src(libs, {base: "./node_modules/"})
		.pipe(gulp.dest("src/static/libs"))
});

// Stylus
gulp.task("stylus", function() {
  return (
    gulp
      .src(["src/static/stylus/main.styl", "src/components/**/*.styl"])
      .pipe(plugin.sourcemaps.init())
      .pipe(
        plugin
          .stylus()
          .on(
            "error",
            plugin.notify.onError("*** STYLUS ***: <%= error.message %>")
          )
      )
      .pipe(
        plugin.autoprefixer({ browsers: ["last 10 versions"], cascade: false })
      )
      .pipe(plugin.concat("app.css"))
      .pipe(plugin.sourcemaps.write("../css"))
      .pipe(gulp.dest("dest/assets/css"))
      // .pipe(browserSync.stream());
      .pipe(plugin.livereload())
  );
});

// Pug
gulp.task("pug", function() {
  return gulp
    .src(["src/pages/*.pug", "!src/pages/_*.pug"])
    .pipe(plugin.pug({ pretty: true, basedir: 'src/' }))
    .on("error", plugin.notify.onError("*** PUG ***: <%= error.message %>"))
    .pipe(gulp.dest("dest"))
    // .pipe(browserSync.stream());
    .pipe(plugin.livereload());
});

// JS
gulp.task("appjs", function() {
  return gulp
    .src(["src/static/js/main.js"])
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.concat("app.js"))
    .pipe(plugin.sourcemaps.write("../js"))
    .pipe(gulp.dest("dest/assets/js"))
    // .pipe(browserSync.stream());
    .pipe(plugin.livereload());
});

// Libs
gulp.task("libs", function() {
  // CSS libs
  var stream = gulp
    .src(libscss)
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.csso())
    .pipe(plugin.concat("libs.min.css"))
    .pipe(plugin.sourcemaps.write("../css"))
    .pipe(gulp.dest("dest/assets/css"))
    // .pipe(browserSync.stream());
    .pipe(plugin.livereload());

  // JS libs
  var stream = gulp
    .src(libsjs)
    .pipe(plugin.concat("libs.min.js"))
    .pipe(gulp.dest("dest/assets/js"))
    // .pipe(browserSync.stream());
    .pipe(plugin.livereload());

  return stream;
});

// Assets
gulp.task("assets", function() {
  return gulp
  	.src("src/static/assets/**/*.*")
  	.pipe(gulp.dest("dest/assets"));
});

// SVG
gulp.task("svg", function() {
  return gulp
    .src("src/static/assets/icons/**/*.svg")
    .pipe(
      plugin.svgmin({ plugins: [{ removeAttrs: { attrs: "(fill|stroke)" } }] })
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
    .pipe(gulp.dest("dest/assets/icons"));
});

gulp.task("svg-colored", function() {
  return gulp
    .src("src/static/assets/icons/**/*.svg")
    .pipe(plugin.svgmin())
    .pipe(
      plugin.svgSprite({
        mode: {
          symbol: {
            sprite: "sprite-colored.svg", // имя файла
            bust: false, // отключаем хэш в имени файла
            dest: "" // отключаем файловую струтуру (по умолчанию, создаем в папке gulp.dest)
          }
        }
      })
    )
    .pipe(gulp.dest("dest/assets/icons"));
});

// Watch
gulp.task("watch", function() {
  // browserSync.init({
  //   server: "./dest",
  //   open: false
  // });

  http
    .createServer(
      st({ path: __dirname + "/dest", index: "index.html", cache: false })
    )
    .listen(3000);

  plugin.livereload.listen({ basePath: "dest", start: true });

  gulp.watch("src/**/*.pug", gulp.series("pug"));

  gulp.watch("src/static/js/main.js", gulp.series("appjs"));

  gulp.watch("src/**/*.styl", gulp.series("stylus"));

  gulp.watch("src/static/libs/**/*.*", gulp.series("libs"));

  console.log("Watch on http://localhost:3000");
});

gulp.task("media", gulp.series("assets", "svg", "svg-colored"), function() {});

gulp.task(
  "build",
  gulp.series("assets", "svg", "copylibs", "libs", "stylus", "pug", "appjs"),
  function() {}
);

gulp.task("default", gulp.series("build", "watch"), function() {});
