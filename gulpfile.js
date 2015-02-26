/**
 * @author jwolschon
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');


gulp.task('connect', function () {
    connect.server({
        root: 'app',
        port: 9001,
        livereload: true
    });
});

gulp.task('modules', function(){
    gulp.src([
        'app/**/*.js',
        'app/**/module.js',
        '!**/js/libs/**',
        '!app/**/*.min.js'
    ])
        .pipe(concat('combined.js', {newLine: ';\n'}))
        .pipe(gulp.dest('app/assets/js/libs'));
});

gulp.task('libs', function () {
    gulp.src([
        'bower_components/three.js/three.min.js',
        'bower_components/angular/angular.min.js'
    ])
        .pipe(concat('vendor.js', {newLine: ';\n'}))
        .pipe(gulp.dest('app/assets/js/libs'));
});

gulp.task('default', ['modules', 'libs', 'connect']);
