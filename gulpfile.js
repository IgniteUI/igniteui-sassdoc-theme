'use strict';

// require('custom-env').env();

const {src, dest, watch, series} = require('gulp');
const sass = require('gulp-sass');
const slash = require('slash');
const postcss = require('gulp-postcss');
const cache = require('gulp-cached');
const gutil = require('gulp-util');
const ts = require('gulp-typescript');
const browserSync = require('browser-sync');
const pngcrush = require('pngcrush');
const process = require('process');

const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const copy = Promise.promisify(fs.copy);

const sassdoc = require('sassdoc');


// Set your Sass project (the one you're generating docs for) path.
// Relative to this Gulpfile.
const projectPath = path.join(__dirname, process.env.SASSDOC_PROJ.trim());
// console.log(process.env);

const tsProject = ts.createProject(slash(path.join(__dirname, 'sassdoc', 'tsconfig.json')));

// Theme and project specific paths.
const dirs = {
    scss: slash(path.join(__dirname, 'sassdoc', 'scss')),
    css: slash(path.join(__dirname,'sassdoc', 'assets', 'css')),
    img: slash(path.join(__dirname,'sassdoc', 'assets', 'img')),
    svg: slash(path.join(__dirname, 'sassdoc', 'assets', 'svg')),
    js: slash(path.join(__dirname, 'sassdoc', 'assets', 'js')),
    tpl: slash(path.join(__dirname, 'sassdoc', 'views')),
    src: projectPath,
    docs: slash(path.join(__dirname, process.env.SASSDOC_OUTPUT.trim()))
};


const styles = (cb) => {
    var browsers = ['last 2 version', '> 1%', 'ie 9'];
    var processors = [
        require('autoprefixer')({
            browsers: browsers
        })
    ];

    src(slash(path.join(__dirname, 'sassdoc', 'scss', '**/*.scss')))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(dest(slash(path.join(__dirname, 'sassdoc', 'assets', 'css'))));
    
    cb();
};

const scripts = (cb) => {
    var tsResult = src(slash(path.join(__dirname, 'sassdoc', 'typescript', '**/*.ts')))
        .pipe(tsProject());


    tsResult.js.pipe(dest(slash(path.join(__dirname, 'sassdoc', 'assets', 'js'))));
    
    cb();
};

const browserSyncFn = (cb) => {
    const config = {
      server: {
          baseDir: dirs.docs
      },
      port: 3000
    };

    browserSync.init(config);

    cb();
};


// SassDoc compilation.
// See: http://sassdoc.com/customising-the-view/
const compile = async (cb) => {
  console.log(process.env.SASSDOC_PROJ);
    const config = {
        verbose: true,
        dest: dirs.docs,
        autofill: [],
        theme: slash(path.join(__dirname, 'sassdoc')),
        package: {
            name: 'SassDoc Dev Theme',
            version: 'x.x.x'
        },
        // Disable cache to enable live-reloading.
        // Usefull for some template engines (e.g. Swig).
        cache: false,
    };

    var sdStream = sassdoc(config);

    src(slash(path.join(dirs.src, '**/*.scss')))
        .pipe(sdStream);

    // Await for the full documentation process.
    return await sdStream.promise;
};

const browserReload = (cb) => {
  browserSync.reload();
  cb();
};
// Dump JS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
const dumpJS = (cb) => {
    const src = dirs.js;
    const dest = slash(path.join(dirs.docs, 'assets', 'js'));

    copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + dest);
    });

    cb();
};

const dumpCSSFn = (cb) => {
    const src = dirs.css;
    const dest = slash(path.join(dirs.docs, 'assets/css'));

    copy(src, dest).then(function () {
        gutil.log(src + ' copied to ' + slash(path.relative(__dirname, dest)));
    });

    cb();
};

// Dump CSS files from theme into `docs/assets` whenever they get modified.
// Prevent requiring a full `compile`.
const dumpCSS = series(
  styles,
  dumpCSSFn
);


const watchFiles = (cb) => {
  watch(slash(path.join(__dirname,'sassdoc','scss', '**/*.scss')), series(dumpCSS, browserReload));
  watch(slash(path.join(__dirname,'sassdoc','assets', 'js', '**/*.js')), {}, series(dumpJS, browserReload));
  watch(slash(path.join(__dirname,'sassdoc','views', '**/*.{handlebars,hbs}')), series(compile, browserReload));
  watch(slash(path.join(__dirname,'sassdoc','typescript', '**/*.ts')), series(scripts, browserReload));

  cb();
};

// Development task.
// While working on a theme.
module.exports.develop = series(
  compile,
  styles,
  scripts,
  watchFiles,
  browserSyncFn,
);


const svgmin = () => {
    return src(slash(path.join(__dirname, 'sassdoc', 'assets', 'svg', '/*.svg')))
        .pipe(cache(
            imagemin({
                svgoPlugins: [{
                    removeViewBox: false
                }]
            })
        ))
        .pipe(dest(slash(path.join(__dirname, 'sassdoc' ,'assets', 'svg'))));
};


const imagemin = () => {
    return src(slash(path.join(__dirname, 'sassdoc', 'assets', 'img', '/{,*/}*.{gif,jpeg,jpg,png}')))
        .pipe(cache(
            imagemin({
                progressive: true,
                use: [pngcrush()]
            })
        ))
        .pipe(dest(slash(path.join(__dirname, 'sassdoc', 'assets', 'img'))));
};


// Pre release/deploy optimisation tasks.
module.exports.dist = series(
  svgmin,
  imagemin
);
