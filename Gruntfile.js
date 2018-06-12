module.exports = function(grunt) {
    'use strict';

    var MODULE_NAME = 'TemplateManager',
        BUILD_DIR = 'build',
        DIST_DIR = 'dist',
        STAGE_DIR = BUILD_DIR + '/' + DIST_DIR,
        rollup = require('rollup').rollup,
        babel = require('rollup-plugin-babel'),
        //
        // Change any strings in the content that match ${some string here} to the value specified in replacements.json
        resolveFileContent = function(content) {
            var resolvedContent = content,
                // The build version
                buildVersion = grunt.file.readJSON('package.json').version,
                // The build date
                buildDate = new Date(),
                buildUser = (function () {
                    if ('win32' === process.platform) {
                        return process.env.USERNAME;
                    } else if ('linux' === process.platform) {
                        return process.env.USER;
                    } else {
                        return 'unknown';
                    }
                }()),
                // The file which has replacements in JSON format
                replacementFilePath = 'replacements.json',
                // The replacements read in from the file
                replacements = (function () {
                    // If the file is not present, replacements will be null
                    if (grunt.file.exists(replacementFilePath) && grunt.file.isFile(replacementFilePath)) {
                        return grunt.file.readJSON(replacementFilePath);
                    } else {
                        return null;
                    }
                }());

            // The default resolvers (build user, version and date)
            resolvedContent = resolvedContent.replace(new RegExp('\\${build.user}', 'gi'), buildUser);
            resolvedContent = resolvedContent.replace(new RegExp('\\${build.version}', 'gi'), buildVersion);
            resolvedContent = resolvedContent.replace(new RegExp('\\${build.date}', 'gi'), buildDate);

            // If the replacements file exists, use the key/value pairs from there
            if (replacements) {
                for (var key in replacements) {
                    resolvedContent = resolvedContent.replace(new RegExp('\\${' + key + '}', 'gi'), replacements[key]);
                }
            }

            // Return the resolved content
            return resolvedContent;
        };

    grunt.initConfig({
        watch: {
            build: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['build']
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    [DIST_DIR + '/TemplateManager.min.js']: [DIST_DIR + '/TemplateManager.js']
                }
            }
        },
        copy: {
            options: {
                process: resolveFileContent
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.js'],
                        dest: STAGE_DIR,
                        filter: 'isFile'
                    }
                ]
            }
        }
    });


    // Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['copy', 'transpile', 'uglify']);
    grunt.registerTask('build:watch', ['build', 'watch:build']);

    grunt.registerTask('transpile', 'Transpiles to ES5', function () {
        var done = this.async();

        rollup({
            input: STAGE_DIR + '/Module.js',
            plugins: [
                babel({
                    babelrc: false,
                    exclude: 'node_modules/**',
                    "presets": [
                        [
                        "env",
                        {
                            "modules": false
                        }
                        ]
                    ],
                    "plugins": [
                        "external-helpers"
                    ],
                    plugins: ['external-helpers'],
                    externalHelpers: false
                })
            ]
        })
        .then((result) => {
            return result.write(
                {
                    file: DIST_DIR + '/TemplateManager.js',
                    format: 'umd',
                    name: MODULE_NAME
                }
            );
        })
        .then((result) => {
            done();
        });

    });

    // Default task
    grunt.registerTask('default', 'build');

};