var gulp = require("gulp");
var plugin = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();
var del = require("del");
var webpack = require('webpack-stream');

var destAssetsDir = "dest/assets";

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
  return gulp.src([
      "src/pug/pages/*.pug",
      "!src/pug/pages/_*.pug",
      "!src/pug/pages/_*/*.*"
    ])
    .pipe(plugin.pug({
      pretty: true,
      doctype: 'html'
    }))
    .on("error", plugin.notify.onError("<%= error.message %>"))
    // .pipe( plugin.notify({ onLast: true, message: "PUG done!" }) )
    .pipe(gulp.dest("dest"));
});

// --- INLINE SVG
// gulp.task("inlinesvg", function () {
//   return gulp.src('./dest/*.html')
//     .pipe(plugin.embedSvg({
//       selectors: ['svg[src$=".svg"]'],
//       root: './dest',
//       attrs: /class/
//     })).on("error", plugin.notify.onError("<%= error.message %>"))
//     .pipe(gulp.dest("dest"));
// });


// --- CSS
gulp.task("css-app", function () {
  return gulp.src(["src/stylus/*.styl"])
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.stylus({
        'include css': true
      })
      .on("error", plugin.notify.onError("<%= error.message %>"))
    )
    .pipe(plugin.autoprefixer({
      remove: false,
      cascade: false
    }))
    .pipe(plugin.sourcemaps.write("../css"))
    .pipe(gulp.dest(destAssetsDir + "/css"))
});

gulp.task("css-libs", function () {
  return gulp.src(["src/stylus/libs.styl"])
    .pipe(plugin.stylus({
        'include css': true
      })
      .on("error", plugin.notify.onError("<%= error.message %>"))
    )
    .pipe(plugin.autoprefixer({
      remove: false,
      cascade: false
    }))
    .pipe(plugin.cleanCss())
    .pipe(plugin.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destAssetsDir + "/css"))
});

gulp.task("css-minify", function () {
  return gulp.src([
      destAssetsDir + "/css/main.css",
    ])
    .pipe(plugin.cleanCss())
    .pipe(plugin.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destAssetsDir + "/css/"));
});

gulp.task("css-bundle", function () {
  return gulp.src([
      destAssetsDir + '/css/**/libs.min.css',
      destAssetsDir + '/css/**/main.min.css'
    ])
    .pipe(plugin.concat("bundle.min.css"))
    .pipe(gulp.dest(destAssetsDir + "/css/"))
});

gulp.task("css-app-bundle", gulp.series("css-app", "css-minify", "css-bundle"));
gulp.task("css-libs-bundle", gulp.series("css-libs", "css-bundle"));
gulp.task("css", gulp.series("css-app-bundle", "css-libs-bundle", "css-bundle"));


// --- JS
gulp.task('js-app', function () {
  return gulp.src('./src/js/main.js')
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.include()).on('error', console.log)
    .pipe(plugin.babel({
      presets: ['@babel/env']
    }))
    .pipe(plugin.sourcemaps.write("../js"))
    .pipe(gulp.dest(destAssetsDir + "/js"))
});

gulp.task("js-libs", function () {
  return gulp.src('./src/js/libs.js')
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'libs.min.js'
      },
      module: {
        rules: [{
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'entry',
                  corejs: 3
                }]
              ]
            }
          }
        }]
      }
    }))
    .pipe(gulp.dest(destAssetsDir + "/js"))
});

gulp.task("js-minify", function () {
  return gulp.src([destAssetsDir + "/js/main.js"])
    .pipe(plugin.uglify())
    .pipe(plugin.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destAssetsDir + "/js"));
});

gulp.task("js-bundle", function () {
  return gulp.src([
      destAssetsDir + '/js/**/libs.min.js',
      destAssetsDir + '/js/**/main.min.js'
    ])
    .pipe(plugin.concat("bundle.min.js"))
    .pipe(gulp.dest(destAssetsDir + "/js/"))
});

gulp.task("js-app-bundle", gulp.series("js-app", "js-minify"));
gulp.task("js-libs-bundle", gulp.series("js-libs"));
gulp.task("js", gulp.series("js-app-bundle", "js-libs-bundle", "js-bundle"));


// Assets
gulp.task("assets", function () {
  return gulp.src("src/assets/**/*.*").pipe(gulp.dest(destAssetsDir));
});

// SVG
gulp.task("svg-sprite", function () {
  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg"])
    .pipe(plugin.svgmin({
      multipass: true,
      plugins: [{
        name: 'removeAttrs',
        params: {
          attrs: "(fill|stroke|opacity|color|style)"
        }
      }]
    }))
    .pipe(
      plugin.svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg",
            bust: false,
            dest: ""
          }
        }
      })
    )
    .pipe(gulp.dest(destAssetsDir + "/icons"));
});

gulp.task("svg-sprite-color", function () {
  return gulp
    .src(["src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg"])
    .pipe(plugin.svgmin({
      multipass: true
    }))
    .pipe(
      plugin.svgSprite({
        mode: {
          symbol: {
            sprite: "sprite-color.svg",
            bust: false,
            dest: ""
          }
        }
      })
    )
    .pipe(gulp.dest(destAssetsDir + "/icons"));
});

gulp.task("svg", gulp.series("svg-sprite", "svg-sprite-color"));


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
    open: false,
    ghostMode: false,
    logFileChanges: false,
    localOnly: true,
    timestamps: false
  });

  gulp.watch("src/**/*.pug", gulp.series(
    "pug",
    // "inlinesvg",
    "watcher"
  ));

  // JS
  gulp.watch(["src/js/main.js", "src/js/modules/**/*.js", "!src/js/libs.js"], gulp.series("js-app-bundle", "js-bundle", "watcher"));
  gulp.watch(["src/js/libs.js"], gulp.series("js-libs", "js-bundle", "watcher"));

  // CSS
  gulp.watch(["src/**/*.styl", "!src/styl/libs.styl"], gulp.series("css-app-bundle", "css-bundle", "watcher"));
  gulp.watch(["src/styl/libs.styl"], gulp.series("css-libs-bundle", "css-bundle", "watcher"));
});


gulp.task("build", gulp.series(
    "assets",
    "svg",
    "pug",
    // "inlinesvg",
    "css",
    "js"
  ),
  function () {}
);

gulp.task("media", gulp.series("assets", "svg", "watcher"));

gulp.task("rebuild", gulp.series("del", "build"));
gulp.task("default", gulp.series("build", "watch"));
