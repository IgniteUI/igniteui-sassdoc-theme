'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var ts = require('gulp-typescript');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var copy = Promise.promisify(fs.copy);

var sassdoc = require('sassdoc');


// Set your Sass project (the one you're generating docs for) path.
// Relative to this Gulpfile.
var projectPath = './styles/';

// Project path helper.
var project = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(projectPath);
    return path.resolve.apply(path, args);
};

var tsProject = ts.createProject('tsconfig.json');

// Theme and project specific paths.
var dirs = {
    scss: 'sassdoc/scss',
    css: 'sassdoc/assets/css',
    img: 'sassdoc/assets/img',
    svg: 'sassdoc/assets/svg',
    js: 'sassdoc/assets/js',
    tpl: 'sassdoc/views',
    src: projectPath,
    docs: './test'
};


gulp.task('styles', function () {
    var browsers = ['last 2 version', '> 1%', 'ie 9'];
    var processors = [
        require('autoprefixer')({
            browsers: browsers
        })
    ];

    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('scripts', function () {
    var tsResult = gulp.src('typescript/**/*.ts')
        .pipe(tsProject());


    return tsResult.js.pipe(gulp.dest('./'));
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: dirs.docs
        },
        files: [
            path.join(dirs.docs, '/*.html'),
            path.join(dirs.docs, '/assets/css/**/*.css'),
            path.join(dirs.docs, '/assets/js/**/*.js')
        ]
    });
});


// SassDoc compilation.
// See: http://sassdoc.com/customising-the-view/
gulp.task('compile', function () {
    var config = {
        verbose: true,
        dest: dirs.docs,
        autofill: [],
        theme: './sassdoc',
        package: {
            name: 'SassDoc Dev Theme',
            version: 'x.x.x'
        },
        // Disable cache to enable live-reloading.
        // Usefull for some template engines (e.g. Swig).
        cache: false,
    };

    var sdStream = sassdoc(config);

    gulp.src(path.join(dirs.src, '**/*.scss'))
        .pipe(sdStream);

    // Await for the full documentation process.
    return sdStream.promise;
});


// Dump JS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
gulp.task('dumpJS', function () {
    var src = dirs.js;
    var dest = path.join(dirs.docs, 'assets/js');

    return copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + path.relative(__dirname, dest));
    });
});


// Dump CSS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
gulp.task('dumpCSS', ['styles'], function () {
    var src = dirs.css;
    var dest = path.join(dirs.docs, 'assets/css');

    return copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + path.relative(__dirname, dest));
    });
});


// Development task.
// While working on a theme.
gulp.task('develop', ['compile', 'styles', 'scripts', 'browser-sync'], function () {
    gulp.watch('sassdoc/scss/**/*.scss', ['styles', 'dumpCSS']);
    gulp.watch('sassdoc/assets/js/**/*.js', ['dumpJS']);
    gulp.watch('sassdoc/views/**/*.{handlebars,hbs}', ['compile']);
    gulp.watch('sassdoc/typescript/**/*.ts', ['scripts']);
});


gulp.task('svgmin', function () {
    return gulp.src('sassdoc/assets/svg/*.svg')
        .pipe(cache(
            imagemin({
                svgoPlugins: [{
                    removeViewBox: false
                }]
            })
        ))
        .pipe(gulp.dest('sassdoc/assets/svg'));
});


gulp.task('imagemin', function () {
    return gulp.src('sassdoc/assets/img/{,*/}*.{gif,jpeg,jpg,png}')
        .pipe(cache(
            imagemin({
                progressive: true,
                use: [pngcrush()]
            })
        ))
        .pipe(gulp.dest('sassdoc/assets/img'));
});


// Pre release/deploy optimisation tasks.
gulp.task('dist', [
    'jsmin',
    'svgmin',
    'imagemin',
]);
