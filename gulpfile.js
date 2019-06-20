/*eslint-env node */

var gulp = require('gulp'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    cssnano = require('gulp-cssnano'),
    terser = require('gulp-terser'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if');

/** Default **/
gulp.task('default', ['lint', 'replace-html', 'copy-fonts', 'copy-images']);

/** Clean Distribution Folder **/
gulp.task('clean', function() {
    return del(['public/dist/**/*']);
});

gulp.task('cleanDryRun', function() {
    return del(['public/dist/**/*'], {dryRun: true}).then(paths => {
        console.log('Files and folders that would be deleted:\n', paths.join('\n'));
    });
});

/** JavasScript Linter **/
gulp.task('lint', function () {
    return gulp.src(['public/src/js/app.js',
                     'public/src/js/xhrPromise.js',
                     'public/src/js/Hotel.js',
                     'public/src/js/ViewModel.js',
                     'public/src/js/MapView.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/** MINIFY, CONCAT, and REPLACE HTML **/
gulp.task('replace-html', ['lint'], function() {
    return gulp.src('public/src/index.html')
        .pipe(useref())
        .pipe(gulpif('*.css', cssnano()))
        .pipe(gulpif('*.js', terser()))
        .pipe(gulp.dest('public/dist'));
});

/** COPY **/
gulp.task('copy-fonts', ['replace-html'], function() {
    return gulp.src('public/src/fonts/*.*')
        .pipe(gulp.dest('public/dist/fonts'));
});

gulp.task('copy-images', ['copy-fonts'], function() {
    return gulp.src('public/src/images/*.*')
        .pipe(gulp.dest('public/dist/images'));
});
