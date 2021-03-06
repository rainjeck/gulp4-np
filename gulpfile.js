var gulp = require("gulp");
var plugin = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();
var del = require("del");
var webpack = require('webpack-stream');


var destAssetsDir = "dest/assets";

var cssExt = 'scss'; // 'styl' or 'scss'


// --- STATIC SERVER
gulp.task("serve", function() {
  browserSync.init({ server: { baseDir: "dest" } });
});

// --- PUG
gulp.task("pug", function() {
  return gulp.src([
    "src/pug/pages/*.pug",
    "!src/pug/pages/_*.pug",
    "!src/pug/pages/_*/*.*"
    ])
    .pipe( plugin.pug({ pretty: true }) )
    .on( "error", plugin.notify.onError("<%= error.message %>") )
    // .pipe( plugin.notify({ onLast: true, message: "PUG done!" }) )
    .pipe( gulp.dest("dest") );
});

// --- INLINE SVG
gulp.task("inlinesvg", function() {
  return gulp.src('./dest/*.html')
    .pipe( plugin.embedSvg({
      selectors: ['svg[src$=".svg"]'],
      root: './dest',
      attrs: /class/
    }) ).on( "error", plugin.notify.onError("<%= error.message %>") )
    .pipe( gulp.dest("dest") );
});


// --- CSS
gulp.task("css-app", function() {
  if ( cssExt == 'scss' ) {
    return gulp.src([ "src/"+ cssExt +"/*." + cssExt ])
      .pipe( plugin.sourcemaps.init() )
      .pipe( plugin.sass({ outputStyle: 'expanded', precision: 4 })
        .on('error', plugin.notify.onError("<%= error.message %>") )
      )
    .pipe( plugin.autoprefixer({ remove: false, cascade: false }) )
    .pipe( plugin.sourcemaps.write("../css") )
    .pipe( gulp.dest(destAssetsDir + "/css") )
  }

  if ( cssExt == 'styl' ) {
    return gulp.src([ "src/"+ cssExt +"/*." + cssExt ])
      .pipe( plugin.sourcemaps.init() )
      .pipe( plugin.stylus({ 'include css': true })
        .on("error", plugin.notify.onError("<%= error.message %>"))
      )
    .pipe( plugin.autoprefixer({ remove: false, cascade: false }) )
    .pipe( plugin.sourcemaps.write("../css") )
    .pipe( gulp.dest(destAssetsDir + "/css") )
  }
});

gulp.task("css-minify", function() {
  return gulp.src([
    destAssetsDir + "/css/main.css",
    destAssetsDir + "/css/libs.css"
  ])
    .pipe( plugin.cleanCss() )
    .pipe( plugin.rename({
      suffix: '.min'
    }) )
    .pipe( gulp.dest(destAssetsDir + "/css/") );
});

gulp.task("css-bundle", function() {
  return gulp.src([
      destAssetsDir + '/css/**/libs.min.css',
      destAssetsDir + 'css/**/main.min.css'
    ])
    .pipe( plugin.concat("bundle.min.css") )
    .pipe( gulp.dest(destAssetsDir + "/css/") )
});

gulp.task("css", gulp.series( "css-app", "css-minify", "css-bundle" ));


// --- JS
gulp.task("js-app", function() {
  return gulp.src( './src/js/*.js' )
    .pipe( webpack({
      mode: 'development',
      entry: {
        main: './src/js/main.js',
        libs: './src/js/libs.js'
      },
      output: { filename: '[name].js', },
      devtool: 'source-map',
      module: {
        rules: [{
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: { presets: [
              ['@babel/preset-env', { useBuiltIns: 'entry', corejs: 3 }]
            ]}
          }
        }]
      }
    }) )
    .pipe( gulp.dest(destAssetsDir + "/js") )
});

// gulp.task("js-libs", function() {
//   return gulp.src( './src/js/libs.js' )
//     .pipe( webpack({
//       mode: 'production',
//       output: { filename: 'libs.min.js' },
//       module: {
//         rules: [{
//           test: /\.js$/,
//           use: {
//             loader: 'babel-loader',
//             options: { presets: [
//               ['@babel/preset-env', { useBuiltIns: 'entry', corejs: 3 }]
//             ]}
//           }
//         }]
//       }
//     }) )
//     .pipe( gulp.dest(destAssetsDir + "/js") )
// });

gulp.task("js-minify", function() {
  return gulp.src([ destAssetsDir + "/js/main.js", destAssetsDir + "/js/libs.js" ])
    .pipe( plugin.uglify() )
    .pipe( plugin.rename({
      suffix: '.min'
    }) )
    .pipe( gulp.dest(destAssetsDir + "/js") );
});

gulp.task("js-bundle", function() {
  return gulp.src([
      destAssetsDir + '/js/**/libs.min.js',
      destAssetsDir + 'js/**/main.min.js'
    ])
    .pipe( plugin.concat("bundle.min.js") )
    .pipe( gulp.dest(destAssetsDir + "/js/") )
});

gulp.task("js", gulp.series( "js-app", "js-minify", "js-bundle" ));


// --- LIBS
// gulp.task("copy-libs", function() {
//   var libs = libsCss.concat(libsJs);
//
//   if (libs.length == 0) return;
//
//   return gulp.src( libs )
//     .pipe( gulp.dest(destAssetsDir + "/libs/modules") );
// });
//
// gulp.task("libs-css", function() {
//   return gulp.src( allCss )
//     .pipe( plugin.sourcemaps.init() )
//     .pipe( plugin.concat("libs.min.css") )
//     .pipe( plugin.cleanCss() )
//     .pipe( plugin.sourcemaps.write("../css") )
//     .pipe( gulp.dest(destAssetsDir + "/css") );
// });
//
// gulp.task("libs", gulp.series( "copy-libs", "libs-css" ));


// Assets
gulp.task("assets", function() {
  return gulp.src( "src/assets/**/*.*" ).pipe( gulp.dest(destAssetsDir) );
});

// SVG
gulp.task("svg-sprite", function() {
  return gulp
    .src([ "src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg" ])
    .pipe( plugin.svgmin({ plugins: [{ removeAttrs: { attrs: "(fill|stroke|opacity)" } }] }) )
    .pipe(
      plugin.svgSprite({
        mode: { symbol: { sprite: "sprite.svg", bust: false, dest: "" } }
      })
    )
    .pipe(gulp.dest(destAssetsDir + "/icons"));
});

gulp.task("svg-sprite-color", function () {
  return gulp
    .src([ "src/assets/icons/*.svg", "!src/assets/icons/sprite*.svg" ])
    .pipe( plugin.svgmin() )
    .pipe(
      plugin.svgSprite({
        mode: { symbol: { sprite: "sprite-color.svg", bust: false, dest: "" } }
      })
    )
    .pipe( gulp.dest(destAssetsDir + "/icons") );
});

gulp.task("svg", gulp.series( "svg-sprite", "svg-sprite-color" ));


// --- WATCHER
gulp.task("watcher", function(done) {
  browserSync.reload( "/" );
  done();
});


// --- DEL
gulp.task("del", function(done) {
  del.sync([ "dest/**" ]);
  done();
});


// --- WATCH
gulp.task("watch", function() {
  browserSync.init({
    server: { baseDir: "dest" },
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
  gulp.watch("src/js/modules/**/*.js", gulp.series("js", "watcher"));
  gulp.watch("src/js/libs.js", gulp.series("js", "watcher"));
  gulp.watch("src/**/*." + cssExt, gulp.series("css", "watcher"));
});


gulp.task("build", gulp.series(
    "assets",
    "svg",
    "pug",
    // "inlinesvg",
    // "libs",
    "css",
    "js"
  ),
  function () {}
);


// gulp.task("modules", gulp.series( "libs", "watcher" ));
gulp.task("media", gulp.series( "assets", "svg", "watcher" ));

gulp.task("rebuild", gulp.series( "del", "build" ));
gulp.task("default", gulp.series( "build", "watch" ));
