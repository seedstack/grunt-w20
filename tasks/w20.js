/*
 * grunt-w20
 * https://github.com/seedstack/grunt-w20
 *
 * Author: kavi87 (Github user)
 * Licensed under the MPL-2.0 license.
 */

var requirejs = require('requirejs'),
    fs = require('fs'),
    util = require('../util/util'),
    _ = require('lodash');

module.exports = function (grunt) {

    var output = 'dist/optimized.min.js',
        defaultBasePath = '.',
        defaultApplicationManifest = 'w20.app.json',
        defaultComponentsPath = 'bower_components',
        w20AppJson,
        fragmentDefinition,
        componentsPath;

    function readJSON (path) {
        return grunt.file.readJSON(path);
    }

    function log (title, content, verbose) {
        var type = verbose ? 'verbose' : 'log';
        if (title) {
            grunt[type].subhead(title + '\n');
        }
        if (content) {
            grunt[type].writeln(content);
        }
    }

    function withTrailingSlash(url) {
        var arr = url.split('/');
        if (arr[arr.length - 1] !== '') {
            arr.push('');
        }
        return arr.join('/');
    }

    function withoutForwardSlash (url) {
        var arr = url.split('/');
        if (arr[0] === '') {
            arr.shift();
        }
        return arr.join('/');
    }


    grunt.registerMultiTask('w20', 'Produce an optimized build of a w20 application', function () {

        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = {};
        _.merge(options, {
            basePath: defaultBasePath,
            applicationManifest: defaultApplicationManifest,
            componentsPath: defaultComponentsPath,
            buildConfig: {
                optimize: 'uglify2',
                baseUrl: '.',
                include: [],
                preserveLicenseComments: false,
                findNestedDependencies: true,
                paths: {},
                map: {},
                shim: {},
                out: output,
                onBuildWrite: function (moduleName, path, contents) {
                    log(null, path, true);
                    return contents;
                }
            },
            callback: function(done) {
                done();
            }
        }, this.options());

        log('Running with following options', JSON.stringify(options, null, 2), true);

        var addBasePath = function (path) {
            return withTrailingSlash(options.basePath) + withoutForwardSlash(path);
        };

        options.componentsPath = addBasePath(options.componentsPath);

        // Include requirejs in the optimized build
        options.buildConfig.include.unshift(withTrailingSlash(options.componentsPath) + 'requirejs/require');

        w20AppJson = readJSON(addBasePath(options.applicationManifest));

        _.each(w20AppJson, function (fragmentConfiguration, fragmentManifestPath) {

            fragmentManifestPath = addBasePath(fragmentManifestPath);

            fragmentDefinition = readJSON(fragmentManifestPath);

            componentsPath = util.getComponentsPath(addBasePath, fragmentConfiguration, options.componentsPath);

            _.merge(options.buildConfig, util.getResolvedRequireConfig(fragmentManifestPath, fragmentDefinition, componentsPath));

            options.buildConfig.include = options.buildConfig.include.concat(util.getRequiredOrAutoLoadedModulesPath(fragmentConfiguration, fragmentDefinition));

        });

        log('Computed build configuration:', JSON.stringify(options.buildConfig, null, 2), true);

        log('Optimizing...');

        requirejs.optimize(options.buildConfig, function (buildResponse) {

            log('Build response', buildResponse);

            // Append to the build output an explicit call to the w20 loader (todo: find a better way)
            fs.appendFile(options.buildConfig.out, '\nrequire([\'w20\']);', function (err) {
                if (err) { throw err; }
                options.callback(done);
            });

        }, function(err) {
            grunt.log.error(err);
        });

    });

};
