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

gulp.task('modules', function () {
    gulp.src([
        'app/**/*.js',
        'app/**/module.js',
        '!**/js/libs/**',
        '!app/**/*.min.js'
    ])
        .pipe(concat('combined.js', {newLine: ';\n'}))
        .pipe(gulp.dest('app/assets/js/libs'));
});

gulp.task('images', function () {
    gulp.src([
        'bower_components/webgl-globe/globe/*.jpg',
        'bower_components/webgl-globe/globe/*.json'
    ])
        .pipe(gulp.dest('app/assets/images'));
});

gulp.task('libs', function () {
    gulp.src([
        'bower_components/angular/angular.min.js',
//        'bower_components/webgl-globe/globe/third-party/*.js',
//        'bower_components/webgl-globe/globe/*.js',
        'bower_components/webgl-globe/globe-vertex-texture/shaders.js',
        'bower_components/webgl-globe/globe-vertex-texture/third-party/Three/*.js',
        'bower_components/webgl-globe/globe-vertex-texture/third-party/*.js'
    ])
        .pipe(concat('vendor.js', {newLine: ';\n'}))
        .pipe(gulp.dest('app/assets/js/libs'));
});

gulp.task('default', ['modules', 'libs', 'images', 'connect']);
gulp.task('dev', ['modules', 'connect']);