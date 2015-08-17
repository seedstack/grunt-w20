var exec = require('child_process').exec;
var grunt = require('grunt');
var w20TaskUtil = require('../util/util');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports.w20 = {
    setUp: function (done) {
        if (!grunt.file.isDir('test/bower_components/w20')) {
            console.log('\nInstalling w20 using bower...');

            exec('bower install w20', {cwd: './test'}, function (err, stdout, stderr) {
                if (stderr) {
                    throw new Error(stderr);
                }

                console.log('\nSpawning grunt task w20...');

                grunt.util.spawn({
                    grunt: true,
                    args: ['w20'],
                    opts: {
                        stdio: 'inherit'
                    }
                }, function () {
                    console.log('\nStarting tests...');
                    done();
                });

            });
        } else {
            done();
        }

    },
    it_should_execute_succesfully: function (test) {
        var output = grunt.file.read('test/tmp/optimized.test.min.js');
        test.ok(output);

        test.done();
    },
    it_should_return_the_correct_component_path: function (test) {
        var prefixWithBasePath = function (path) {
            return 'base/path/' + path;
        };
        var fragmentConfiguration = {
            vars: {
                'components-path': 'custom/components/path'
            }
        };
        var defaultComponentsPath = 'default/path';
        var componentsPath = w20TaskUtil.getComponentsPath(prefixWithBasePath, fragmentConfiguration, defaultComponentsPath);

        test.equal(componentsPath, 'base/path/custom/components/path');

        test.done();
    },
    it_should_resolve_components_path: function (test) {
        var path = '${components-path:bower_components}/test/path';
        var resolvedPath = w20TaskUtil.resolveComponentsPath(path, 'tralala/lala');

        test.equal(resolvedPath, 'tralala/lala/test/path');
        test.done();
    },
    it_should_get_required_or_autoloaded_modules: function (test) {

        var fragmentConfiguration = {
            modules: {
                application: {},
                culture: {}
            }
        };

        var fragmentDefinition = {
            modules: {
                application: {
                    path: 'application'
                },
                culture: {
                    path: 'culture'
                },
                env: {
                    path: 'env',
                    autoload: true
                },
                security: {},
                utils: {}
            }
        };

        var include = w20TaskUtil.getRequiredOrAutoLoadedModulesPath(fragmentConfiguration, fragmentDefinition);

        test.equal(include[0], 'application');
        test.equal(include[1], 'culture');
        test.equal(include[2], 'env');

        test.done();
    }
};
