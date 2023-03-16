'use strict';

// require('custom-env').env();

const autoprefixer = require('autoprefixer');
const {src, dest, watch, series} = require('gulp');
const { spawnSync } = require('child_process');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
const slash = require('slash');
const postcss = require('gulp-postcss');
const cache = require('gulp-cached');
const log = require('fancy-log');
const concat = require('gulp-concat');
const ts = require('gulp-typescript');
const browserSync = require('browser-sync');
const pngcrush = require('pngcrush');
const process = require('process');
const del = require('del');

const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const copy = Promise.promisify(fs.copy);

const sassdoc = require('sassdoc');
const { argv } = require('yargs');

// Set your Sass project (the one you're generating docs for) path.
// Relative to this Gulpfile.
const projectPath = argv.project ? argv.project : slash(path.join(__dirname, 'styles'));

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
    docs: argv.output ? argv.output : slash(path.join(__dirname, 'output'))
};


const styles = (cb) => {
    const prefixer = postcss([autoprefixer({ cascade: false })]);

    src(slash(path.join(__dirname, 'sassdoc', 'scss', '**/*.scss')))
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(prefixer)
        .pipe(dest(slash(path.join(__dirname, 'sassdoc', 'assets', 'css'))));
    
    cb();
};

const buildTS = (cb) => {
    var tsResult = src(slash(path.join(__dirname, 'sassdoc', 'typescript', '**/*.ts')))
        .pipe(tsProject());


    tsResult.js.pipe(dest(slash(path.join(__dirname, 'sassdoc'))));
    
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
        log(src + ' copied to ' + dest);
    });

    cb();
};

const dumpCSSFn = (cb) => {
    const src = dirs.css;
    const dest = slash(path.join(dirs.docs, 'assets/css'));

    copy(src, dest).then(function () {
        log(src + ' copied to ' + slash(path.relative(__dirname, dest)));
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
  watch(slash(path.join(__dirname,'sassdoc','typescript', '**/*.ts')), series(buildTS, browserReload));

  cb();
};

// Development task.
// While working on a theme.
module.exports.develop = series(
  compile,
  styles,
  buildTS,
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

const sassdocClearMainJS = (cb) => {
  const outputPath = slash(path.join(__dirname, 'sassdoc', 'assets', 'js'));
  del.sync(slash(path.join(outputPath, 'main.js')));
  del.sync(slash(path.join(outputPath, 'main.d.ts')));

  cb();
};

const concatJS = (cb) => {
  src([
    slash(path.join(dirs.js, '/**/!(tag-versions.req)*.js')),
  ])
  .pipe(concat('main.js'))
  .pipe(dest(dirs.js));

  cb();
};

const sassdocBuildTS = (cb) => {
  spawnSync(`tsc --project ${slash(path.join(__dirname, 'sassdoc', 'tsconfig.json'))}`, {stdio: 'inherit', shell: true});
  cb();
};

module.exports.sassdocBuild = series(
  sassdocClearMainJS,
  sassdocBuildTS,
  concatJS,
);
