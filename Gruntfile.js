/*global module:true */

// TODO: Implement code coverage
// TODO: https://www.npmjs.com/package/package-json-to-readme
// TODO: https://docs.npmjs.com/files/package.json
// TODO: Include author in default resolvers

/**
 * @author: jghidiu
 * Date: 2014-12-08
 */
module.exports = function(grunt) {
    'use strict';

    // The build version
    var _buildVersion = grunt.file.readJSON('package.json').version;
    // The build date
    var _buildDate = new Date();
    var _buildUser = '';
    if ('win32' === process.platform) {
        _buildUser = process.env.USERNAME;
    } else if ('linux' === process.platform) {
        _buildUser = process.env.USER;
    }



    // The file which has replacements in JSON format
    var _replacementFilePath = 'replacements.json';
    // The replacements read in from the file
    var _replacements = null;
    // If the file is not present, _replacements will be null
    if (grunt.file.exists(_replacementFilePath) && grunt.file.isFile(_replacementFilePath)) {
        _replacements = grunt.file.readJSON(_replacementFilePath);
    }

    // Change any strings in the content that match ${some string here} to the value specified in replacements.json
    var _resolveFileContent = function(content) {
        var resolvedContent = content;

        // The default resolvers (build user, version and date)
        resolvedContent = resolvedContent.replace(new RegExp('\\${build.user}', 'gi'), _buildUser);
        resolvedContent = resolvedContent.replace(new RegExp('\\${build.version}', 'gi'), _buildVersion);
        resolvedContent = resolvedContent.replace(new RegExp('\\${build.date}', 'gi'), _buildDate);

        // If the replacements file exists, use the key/value pairs from there
        if (_replacements) {
            for (var key in _replacements) {
                resolvedContent = resolvedContent.replace(new RegExp('\\${' + key + '}', 'gi'), _replacements[key]);
            }
        }

        // Return the resolved content
        return resolvedContent;
    };

    grunt.initConfig({
        bump: {
            options: {
                files: ['bower.json', 'package.json'],
                updateConfigs: [],
                commit: false,
                commitMessage: '-Tagged for release v%VERSION%',
                commitFiles: ['bower.json', 'package.json'],
                createTag: false,
                tagName: '%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false
            }
        },
        open: {
            source: {
                path: 'test/source.html'
            },
            dist: {
                path: 'test/dist.html'
            },
            distmin: {
                path: 'test/dist-min.html'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            files: ['src/**/*.*', 'spec/**/*.*', 'test/**/*.*', 'Gruntfile.js']
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/TemplateManager.min.js': ['dist/TemplateManager.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            source: ['src/TemplateManager.js'],
            // Only lint the unmin file
            dist: ['dist/TemplateManager.js']
        },
        copy: {
            options: {
                process: _resolveFileContent
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.js'],
                        dest: 'dist/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        mocha: {
            options: {
                run: true,
                reporter: 'Spec'
            },
            all: {
                src: ['test/**/*.*']
            },
            source: {
                src: ['test/source.html']
            },
            dist: {
                src: ['test/dist.html']
            },
            distmin: {
                src: ['test/dist-min.html']
            }
        }

    });


    // Load NPM tasks
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Register tasks
    grunt.registerTask('build', ['jshint:source']);
    grunt.registerTask('build-dist', ['build', 'copy:dist', 'uglify:dist', 'jshint:dist']);
    grunt.registerTask('dist', ['build-dist', 'mocha:all', 'bump:patch']);
    grunt.registerTask('release-patch', ['dist'  /*TODO: check for non-added files, add package files, verify no other changes, commit, tag, push*/]);
    grunt.registerTask('release-minor', ['dist', /*TODO: check for non-added files, add package files, verify no other changes, commit, tag */ 'bump:minor' /*TODO: add package files, commit, push*/ ]);
    grunt.registerTask('release-major', ['dist', /*TODO: check for non-added files, add package files, verify no other changes, commit, tag */ 'bump:major' /*TODO: add package files, commit, push*/ ]);
    //
    // Test tasks
    //
    // Test the source code
    grunt.registerTask('test-source', ['open:source', 'watch']);
    grunt.registerTask('test', ['test-source']); // Alias for test-source
    // Test the code in dist
    grunt.registerTask('test-dist', ['build-dist', 'open:dist', 'watch']);
    // Test the minified dist file
    grunt.registerTask('test-dist-min', ['build-dist', 'open:distmin', 'watch']);
    //
    // Headless test tasks
    //
    // Test the source code
    grunt.registerTask('test-headless-source', ['mocha:source']);
    grunt.registerTask('test-headless', ['test-headless-source']);
    // Test the code in dist
    grunt.registerTask('test-headless-dist', ['build-dist', 'mocha:dist']);
    // Test the minified dist file
    grunt.registerTask('test-headless-dist-min', ['build-dist', 'mocha:distmin']);
    // Test all the code (source and dist)
    grunt.registerTask('test-headless-all', ['build-dist', 'mocha:all']);

    // Default task
    grunt.registerTask('default', 'build');
};