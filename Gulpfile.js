// Node
var fs = require('fs');
var gulp = require('gulp');

// Gulp
var concat = require('gulp-concat-sourcemap');
var header = require('gulp-header');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap-umd');

// Package
var pkg = JSON.parse(fs.readFileSync('./package.json'));
gulp.task('default', function () {
  return gulp.src([
    'src/duil.core.js',
    'src/duil.Widget.js',
    'src/duil.List.js',
    'src/jquery.duil'
  ])
  .pipe(sourcemaps.init())

  .pipe(replace('@VERSION', pkg.version))
  .pipe(replace(/^.*\/\/\s*build ignore:line\s*$/igm, ''))
  .pipe(replace(/\/\*\s*build ignore:start\s*\*\/[\w\W]*?\/\*\s*build ignore:end\s*\*\//ig, ''))
  .pipe(replace(/define\([^{]*?{/, ''))
  .pipe(replace(/\}\);[^}\w]*$/, ''))
  .pipe(replace(/\r?\nreturn .+\n/, ''))
  .pipe(concat('duil.js'))
  .pipe(wrap({
    namespace: 'duil',
    exports: 'duil',
    deps: [
      {name: 'jquery', globalName: 'jQuery', paramName: '$'},
      {name: 'lodash', globalName: '_', paramName: '_'}
    ]
  }))
  .pipe(header(
    '/*! <%= pkg.name %> v<%= pkg.version %> | ' +
    '(c) ' + new Date().getFullYear() + ' <%= pkg.author %> | ' +
    '<%= pkg.license %> License */', {pkg: pkg}))
  .pipe(replace(/\n{3,}/igm, '\n\n'))
  .pipe(gulp.dest('dist'))

  .pipe(rename('duil.min.js'))
  .pipe(uglify())

  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'))
});
