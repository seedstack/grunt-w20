/*
 * grunt-w20
 * https://github.com/seedstack/grunt-w20
 *
 * Author: kavi87 (Github user)
 * Licensed under the MPL-2.0 license.
 */
var _ = require('lodash');

function getComponentsPath (prefixWithBasePath, fragmentConfiguration, defaultComponentsPath) {
    var componentsPath = (fragmentConfiguration.vars || {})['components-path'];
    return prefixWithBasePath(componentsPath === undefined ? defaultComponentsPath : fragmentConfiguration.vars['components-path']);
}

function resolveComponentsPath (path, componentsPath) {
    return path.replace(new RegExp('\\${([\\w-]+)(:([^:}]*))?}', 'g'), componentsPath);
}

function getRequiredOrAutoLoadedModulesPath (fragmentConfiguration, fragmentDefinition) {
    var requiredModules = fragmentConfiguration.modules || {},
        include = [];

    _.each(fragmentDefinition.modules, function(moduleDefinition, moduleName) {
        if (requiredModules[moduleName] || moduleDefinition.autoload) {
            include.push(moduleDefinition.path);
        }
    });

    return include;
}

function getResolvedRequireConfig (fragmentManifestPath, fragmentDefinition, componentsPath) {
    var requireConfig = { paths: {} };

    // Resolve path mapping for fragment id
    requireConfig.paths['{' + fragmentDefinition.id + '}'] = fragmentManifestPath.substring(0, fragmentManifestPath.lastIndexOf('/'));

    if (fragmentDefinition.requireConfig) {
        _.each(fragmentDefinition.requireConfig.paths, function (value, key) {

            // handle the special case of the w20 loader whose path is not defined
            if (key === 'w20') {
                value = componentsPath + '/w20/modules/w20';
            }

            fragmentDefinition.requireConfig.paths[key] = resolveComponentsPath(value, componentsPath);
        });

    }

    return _.merge(requireConfig, fragmentDefinition.requireConfig);
}

module.exports = {
    getComponentsPath: getComponentsPath,
    resolveComponentsPath: resolveComponentsPath,
    getRequiredOrAutoLoadedModulesPath: getRequiredOrAutoLoadedModulesPath,
    getResolvedRequireConfig: getResolvedRequireConfig
};








