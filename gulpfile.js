var gulp = require( "gulp" );
var plugin = require( "gulp-load-plugins" )();
var browserSync = require( "browser-sync" ).create();
var http = require( "http" );
var st = require( "st" );

var destAssetsDir = "dest/assets";

var libsCss = [
  "node_modules/normalize.css/normalize.css",
  // "node_modules/swiper/dist/css/swiper.min.css"
];

var libsJs = [
  "node_modules/svg4everybody/dist/svg4everybody.min.js",
  // "node_modules/swiper/dist/js/swiper.min.js"
  // "node_modules/jquery/dist/jquery.min.js",
  // "node_modules/jquery-form-validator/form-validator/jquery.form-validator.min.js",
  // "node_modules/jquery-form-validator/form-validator/lang/ru.js",
];

var localCss = [

];
var localJs = [

];

// Static server
gulp.task( "server", function() {
  browserSync.init( {
    server: {
      baseDir: "dest",
      open: false
    }
  } );
} );

// Stylus
gulp.task( "stylus", function() {
  return (
    gulp
      .src( ["src/static/stylus/main.styl"] )
      .pipe( plugin.sourcemaps.init() )
      .pipe( plugin.stylus()
        .on( "error",
          plugin.notify.onError( "*** STYLUS ***: <%= error.message %>" )
        )
      )
      .pipe( plugin.autoprefixer( { browsers: ["last 10 versions"], cascade: false } ) )
      .pipe( plugin.sourcemaps.write("../css") )
      .pipe( gulp.dest( destAssetsDir + "/css") )
      // .pipe(browserSync.stream());
      .pipe( plugin.livereload() )
  );
});

gulp.task( "css-minify", function() {
  return gulp
    .src( [destAssetsDir + "/css/main.css"] )
    .pipe( plugin.concat("main.min.css") )
    .pipe( plugin.cleanCss() )
    .pipe( gulp.dest( destAssetsDir + "/css/") )
    // .pipe( plugin.livereload() )
});

// Pug
gulp.task( "pug", function() {
  return gulp
    .src( ["src/pages/*.pug", "!src/pages/*_.pug"])
    .pipe( plugin.pug( { pretty: true, basedir: 'src/' } ))
      .on( "error", plugin.notify.onError( "*** PUG ***: <%= error.message %>" ) )
    .pipe( plugin.notify( {onLast: true, message: 'PUG done! Reloaded.'} ) )
    .pipe( gulp.dest("dest") )
    // .pipe(browserSync.stream());
    // .pipe(plugin.livereload());
});

// JS
gulp.task( "js", function() {
  return gulp
    .src( ["src/static/js/main.js"] )
    .pipe( plugin.sourcemaps.init() )
    .pipe( plugin.babel( { presets: ['@babel/env']} ) )
    .pipe( plugin.concat("main.js") )
    .pipe( plugin.sourcemaps.write("../js") )
    .pipe( gulp.dest( destAssetsDir + "/js" ) )
    // .pipe(browserSync.stream());
    .pipe( plugin.livereload() );
});

gulp.task( "js-minify", function(){
  return gulp
    .src( [destAssetsDir + "/js/main.js"] )
    .pipe( plugin.concat("main.min.js") )
    .pipe( plugin.uglify() )
    .pipe( gulp.dest( destAssetsDir + "/js" ) )
    // .pipe( plugin.livereload() );
});


// Copy libs
gulp.task( "copylibs", function() {
  var libs = libsCss.concat(libsJs);

	return gulp
    .src( libs, {base: "./node_modules/"} )
		.pipe( gulp.dest( destAssetsDir + "/libs" ) )
});

// Libs
gulp.task( "libs", function() {

  var css = libsCss.concat( localCss );
  var js = libsJs.concat( localJs );

  // CSS libs
  var stream = gulp
    .src( css )
    .pipe( plugin.sourcemaps.init() )
    .pipe( plugin.concat("libs.min.css") )
    .pipe( plugin.cleanCss() )
    .pipe( plugin.sourcemaps.write("../css") )
    .pipe( gulp.dest( destAssetsDir + "/css" ) )
    // .pipe(browserSync.stream());
    // .pipe(plugin.livereload());

  // JS libs
  var stream = gulp
    .src( js )
    .pipe( plugin.concat( "libs.min.js" ) )
    .pipe( gulp.dest( destAssetsDir + "/js" ) )
    // .pipe(browserSync.stream());
    // .pipe(plugin.livereload());

  return stream;
});

// Assets
gulp.task( "assets", function() {
  return gulp
  	.src( "src/static/assets/**/*.*" )
  	.pipe( gulp.dest(destAssetsDir) );
});

// SVG
gulp.task( "svg", function() {
  return gulp
    .src( "src/static/assets/icons/**/*.svg" )
    .pipe(
      plugin.svgmin({ plugins: [{ removeAttrs: { attrs: "(fill|stroke|opacity)" } }] })
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
    .pipe( gulp.dest( destAssetsDir + "/icons" ) );
});

gulp.task( "svg-colored", function() {
  return gulp
    .src( "src/static/assets/icons/**/*.svg" )
    .pipe( plugin.svgmin() )
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
    .pipe( gulp.dest( destAssetsDir + "/icons") );
});

gulp.task( "pug-watcher", function(done) {
  plugin.livereload.changed( "/dest/*.html" );
  done();
});

gulp.task( "libs-watcher", function(done) {
  plugin.livereload.changed( "/dest/assets/js/libs.min.js" );
  plugin.livereload.changed( "/dest/assets/css/libs.min.css" );
  done();
});

// Watch
gulp.task( "watch", function() {
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

  gulp.watch( "src/**/*.pug", gulp.series("pug", "pug-watcher") );
  gulp.watch( "src/static/js/main.js", gulp.series("js", "js-minify") );
  gulp.watch( "src/**/*.styl", gulp.series("stylus", "css-minify") );
  gulp.watch( "src/static/libs/**/*.*", gulp.series("libs", "libs-watcher") );

  console.log( "Watch on http://localhost:3000" );
});

gulp.task( "media", gulp.series("assets", "svg", "svg-colored"), function() {} );

gulp.task(
  "build",
  gulp.series(
    "assets",
    "svg",
    "copylibs",
    "libs",
    "stylus",
    "css-minify",
    "pug",
    "js",
    "js-minify"
  ),
  function() {}
);

gulp.task( "default", gulp.series("build", "watch"), function() {} );
