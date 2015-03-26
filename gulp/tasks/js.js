// js processes javascript files as follows
// It loads various script configurations from the
// script-definitions module.
// It concats each script configuration's scripts
// into an appropriately named file.


var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    config = require('../config'),
    scriptDefinitions = require('../script-definitions'),
    merge = require('merge-stream'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify');

gulp.task('vendorjs', function () {
  if (scriptDefinitions.vendor && scriptDefinitions.vendor.length) {
    gulp.src(scriptDefinitions.vendor)
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest(config.dest.js));
  }
});

gulp.task('js', ['vendorjs'], function() {
  return buildJs()
    .pipe(livereload());
});

gulp.task('js:release', ['vendorjs'], function () {
  return buildJs({ minify: true });
});

function buildJs(options) {
  options = options || {};

  // Get the name of each script configuration section
  var scriptNames = Object.keys(scriptDefinitions),
      appScriptNames = scriptNames.filter(function (scriptName) {
        return scriptName !== 'vendor';
      });

  // Grab app scripts, concat, etc
  var result = merge(appScriptNames.map(function (scriptName) {
      return gulp.src(scriptDefinitions[scriptName])
        .pipe(jshint())
        .pipe(jshint.reporter(''))
        .pipe(sourcemaps.init({ base: config.src.root }))
        .pipe(concat(scriptName + '.js'))
        .pipe(gulpif(options.minify, uglify()))
        .pipe(sourcemaps.write('./'));
    }));

  // Merge vendor and app scripts into one stream
  return result.pipe(gulp.dest(config.dest.js));
}
