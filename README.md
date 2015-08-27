# grunt-w20
Grunt plugin providing tasks for W20-based applications.

## Optimization

Optimization (concatenation and minification of js/css files) is done with r.js.

Install the plugin

```
npm install -g grunt-w20
```

Load it in your gruntfile.js 

```
grunt.loadNpmTasks('grunt-w20');
```

Configure the task

```
grunt.initConfig({
    w20: {
        optimize: {}
    }
}
```

The above should be sufficient for a default app structure.

### Options

```
w20: {
    optimize: {
        options: {
           basePath: "the application base path, default to '.'"
           applicationManifest: "name of the application manifest, default to 'w20.app.json')"
           componentsPath: "path to the component folder, default to 'bower_components')"
            buildConfig: {
                // r.js configuration, sensible defaults are applied, override only for specific need
                optimize: 'closure', // if you want to use closure as the optimizer, default to uglify2
                out: 'my/dist/optimized.test.min.js',
                ...
            }
        }
    }
}
```
