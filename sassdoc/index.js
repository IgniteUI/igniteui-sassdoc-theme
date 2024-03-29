/**
 * Themeleon template helper, using consolidate.js module.
 *
 * See <https://github.com/themeleon/themeleon>.
 * See <https://github.com/tj/consolidate.js>.
 */
const themeleon = require('@simeonoff/themeleon')().use('consolidate');

/**
 * Utility function we will use to merge a default configuration
 * with the user object.
 */
const extend = require('extend');

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
const extras = require('sassdoc-extras');

const lunr = require('lunr');
const sassPlug = require('sassdoc-plugin-localization');
const process = require('process');
const fs = require('fs');
const path = require('path');

themeleon.use({
    /**
     * Builds a structure of json files which represents the retrieved comments per every sass declaration.
     */
    convert: (data, dir) => sassPlug.convert(data, dir),
    /**
     * Compares and replaces the applied translations from the jsons structure.
     */
    render: (data, dir) => sassPlug.render(data, dir)
});

// const {convert} = require('./localization/index');
/**
 * The theme function. You can directly export it like this:
 *
 *     module.exports = themeleon(__dirname, function (t) {});
 *
 * ... but here we want more control on the template variables, so there
 * is a little bit of preprocessing below.
 *
 * The theme function describes the steps to render the theme.
 */
const theme = themeleon(__dirname, function(t) {
    /**
     * If only json conversion is needed the whole process of documentation rendering has to be stopped.
     */
    if (t.ctx.convert) {
        const exportPath = t.ctx.export_json ? t.ctx.export_json : path.join('extras', 'sassdoc');
        return t.convert(t.ctx._data, exportPath);
    }
    /**
     * Copy the assets folder from the theme's directory in the
     * destination directory.
     */
    t.copy('assets');

    const options = {
        partials: {
            authors: 'partials/authors',
            description: 'partials/description',
            deprecationMessage: 'partials/deprecationMessage',
            example: 'partials/example',
            footer: 'partials/footer',
            header: 'partials/header',
            github: 'partials/github',
            definitionHeader: 'partials/definitionHeader',
            require: 'partials/require',
            search: 'partials/search',
            see: 'partials/see',
            sidenav: 'partials/sidenav',
            source: 'partials/source',
            usedBy: 'partials/usedby',
            parameters: 'partials/parameters',
            properties: 'partials/properties',
            returns: 'partials/return',
            infraHead: 'partials/infragistics/infranav',
            infraFoot: 'partials/infragistics/infrafoot',
            infraHeadJA: 'partials/infragistics/infranav.ja',
            infraFootJA: 'partials/infragistics/infrafoot.ja'
        },
        helpers: {
            debug: function(content) {
                console.log("----VALUE-----");
                console.log(content);
            },
            json: function(context) {
                return JSON.stringify(context);
            },
            github: function(file, line, package) {
                let source = {
                    default: 'https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/core/styles/',
                    theming: 'https://github.com/IgniteUI/igniteui-theming/tree/master/sass/',

                }

                return `${source[package]}${file}#L${line}`;
            },
            typeClass: function(context) {
                switch (context) {
                    case "mixin":
                        return "--mixin";
                    case "function":
                        return "--function";
                    default:
                        return "";
                }
            },
            trimType: (value) => {
                return value.substring(0, 3);
            },
            baseURl: (prop, lang) => {
                const config = getConfigData(process.env, lang);
                return config ? config[prop] : '';
            },
            gaID: () => {
                const config = getConfigData(process.env);
                return config ? config.gaID : '';
            },
            versionsUrl: () => {
                const config = getConfigData(process.env);
                return config ? config.versions : '';
            },
            getLang: () => {
                if (!process.env.SASSDOC_LANG) {
                    return;
                }

                return process.env.SASSDOC_LANG.trim();
            },
            ifCond: (v1, operator, v2, options) => {
                switch (operator) {
                    case '==':
                        // tslint:disable-next-line:triple-equals
                        return (v1 == v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '===':
                        return (v1 === v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '<':
                        return (v1 < v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '<=':
                        return (v1 <= v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '>':
                        return (v1 > v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '>=':
                        return (v1 >= v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '&&':
                        return (v1 && v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    case '||':
                        return (v1 || v2) ? options.fn(options.data.root) : options.inverse(options.data.root);
                    default:
                        return options.inverse(options.data.root);
                }
            },
            ifTheme: function(scope, options) {
                const { name, type } = scope;
                return name.includes('-theme') && type === 'function' ? options.fn(this) : options.inverse(this);
            },
            columnSize: (scope, opt1, opt2) => {
                return scope.includes('-theme') ? opt1 : opt2;
            },
            paramToVar: (name) => {
                const reserved = ['schema'];
                return reserved.includes(name) ? 'N/A' : `--${name}`;
            },
            localize: (options) => {
                const value = options.fn(this).trim();
                const lang = process.env.SASSDOC_LANG;
                const shell = t.ctx.shellStringsPath ? require(t.ctx.shellStringsPath) : '';
                if (lang && shell[lang.trim()]) {
                    return shell[lang.trim()][value];
                }

                return value;
            }
        }
    };

    /**
     * Render `views/index.handlebars` with the theme's context (`ctx` below)
     * as `index.html` in the destination directory.
     */
    t.handlebars('views/index.hbs', 'index.html', options);

    /**
     * Applies the translations from the json files.
     */
    if (t.ctx.render) {
        const json_dir = t.ctx.json_dir ? t.ctx.json_dir : path.join('extras', 'sassdoc');
        t.render(t.ctx._data, json_dir);
    }
});
/**
 * Actual theme function. It takes the destination directory `dest`
 * (that will be handled by Themeleon), and the context variables `ctx`.
 *
 * Here, we will modify the context to have a `view` key defaulting to
 * a literal object, but that can be overridden by the user's
 * configuration.
 */
module.exports = function(dest, ctx) {
    var def = {
        display: {
            access: ['public', 'private'],
            alias: true,
            watermark: false,
        },
        groups: {
            'undefined': 'General',
        },
        'shortcutIcon': 'http://sass-lang.com/favicon.ico'
    };

    // Apply default values for groups and display.
    ctx.groups = extend(def.groups, ctx.groups);
    ctx.display = extend(def.display, ctx.display);

    // Extend top-level context keys.
    ctx = extend({}, def, ctx);

    /**
     * Parse text data (like descriptions) as Markdown, and put the
     * rendered HTML in `html*` variables.
     *
     * For example, `ctx.package.description` will be parsed as Markdown
     * in `ctx.package.htmlDescription`.
     *
     * See <http://sassdoc.com/extra-tools/#markdown>.
     */
    extras.markdown(ctx);

    /**
     * Add a `display` property for each data item regarding of display
     * configuration (hide private items and aliases for example).
     *
     * You'll need to add default values in your `.sassdocrc` before
     * using this filter:
     *
     *     {
     *       "display": {
     *         "access": ["public", "private"],
     *         "alias": false
     *       }
     *     }
     *
     * See <http://sassdoc.com/extra-tools/#display-toggle>.
     */
    extras.display(ctx);

    /**
     * Allow the user to give a name to the documentation groups.
     *
     * We can then have `@group slug` in the docblock, and map `slug`
     * to `Some title string` in the theme configuration.
     *
     * **Note:** all items without a group are in the `undefined` group.
     *
     * See <http://sassdoc.com/extra-tools/#groups-aliases>.
     */
    extras.groupName(ctx);

    /**
     * Use SassDoc indexer to index the data by group and type, so we
     * have the following structure:
     *
     *     {
     *       "group-slug": {
     *         "function": [...],
     *         "mixin": [...],
     *         "variable": [...]
     *       },
     *       "another-group": {
     *         "function": [...],
     *         "mixin": [...],
     *         "variable": [...]
     *       }
     *     }
     *
     * You can then use `data.byGroupAndType` instead of `data` in your
     * templates to manipulate the indexed object.
     */
    ctx.idx = lunr(function() {
        this.field('type');
        this.field('name');

        ctx.data.forEach((doc) => {
            this.add({
                id: `${doc.context.type}-${doc.context.name}`,
                name: doc.context.name,
                type: doc.context.type
            });
        }, this);
    });

    ctx.data.byGroupAndType = extras.byGroupAndType(ctx.data);

    // Avoid key collision with Handlebars default `data`.
    // @see https://github.com/SassDoc/generator-sassdoc-theme/issues/22
    ctx._data = ctx.data;
    delete ctx.data;

    /**
     * Now we have prepared the data, we can proxy to the Themeleon
     * generated theme function.
     */
    return theme.apply(this, arguments);
};

/**
 * A package annotation to determine the base URL for code definitions.
 */
function packageAnnotation() {
    return {
        name: 'package',
        parse: function(text) {
            return {
                name: text.trim()
            };
        },
        resolve: function(data) {
            data.forEach((item) => {
                if (item.package.name === 'auto') {
                    item.package.name = 'default';
                }
            });
        },
        default: function() {
            return {
                name: 'auto'
            }
        },
        multiple: false
    }
}

module.exports.annotations = [packageAnnotation];

function getConfigData(envs, templateLang) {
    let {
        NODE_ENV: env,
        SASSDOC_LANG: settingsLang
    } = envs;

    const lang = templateLang && !templateLang.name ? templateLang : settingsLang;
    if (!env || !lang) {
        return;
    }

    const pathConfig = path.join(__dirname, 'config.json');
    const data = JSON.parse(fs.readFileSync(pathConfig, 'utf8'));
    return data[lang.trim()][env.trim()];
}
