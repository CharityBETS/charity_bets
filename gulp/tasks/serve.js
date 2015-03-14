// Launch python server...

var gulp = require('gulp'),
    shell = require('gulp-shell'),
    config = require('../config'),
    pythonServerCommand = 'python3 manage.py server';

gulp.task('serve', shell.task([pythonServerCommand]));
