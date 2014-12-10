/*global module:true */

// TODO: Implement code coverage
// TODO: release should run headless test (phantomJS?)

/**
 * @author: jghidiu
 * Date: 2014-12-08
 */
module.exports = function(grunt) {
    'use strict';

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
            // TODO: Get build and dist  working (build will not tag, dist will tag, release will tag and commit)
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
            files: ['src/**/*.*', 'spec/**/*.*', 'index.html', 'Gruntfile.js']
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/TemplateManager.min.js': ['src/**/*.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            // Only lint the unmin file
            dist: ['dist/TemplateManager.js']
        },
        copy: {
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
        }

    });


    // Load NPM tasks
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Register tasks
    grunt.registerTask('build', []);
    grunt.registerTask('dist', ['build', 'bump', 'copy:dist', 'uglify:dist', 'jshint:dist']);
    grunt.registerTask('release', ['build', 'copy:dist', 'uglify:dist', 'jshint:dist', 'bump:minor']);
    //
    // Test tasks
    //
    // Test the source code
    grunt.registerTask('test', ['open:source', 'watch']);
    // Test the code in dist
    grunt.registerTask('test-dist', ['dist', 'open:dist', 'watch']);
    // Test the minified file
    grunt.registerTask('test-min', ['dist', 'open:distmin', 'watch']);

    // Default task.
    grunt.registerTask('default', 'test');
};