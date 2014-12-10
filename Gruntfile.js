/*global module:true */

// TODO: Implement code coverage
// TODO: release should run headless test (phantomJS?)
// TODO: Get build/dist/release working with bump (build should not tag, dist should bump, tag and commit, release should bump:minor, tag and commit (and push?))

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
                    'dist/TemplateManager.min.js': ['src/**/*.js']
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
    grunt.registerTask('release-patch', ['dist'  /*TODO: add package files, commit, tag, push*/]);
    grunt.registerTask('release-minor', ['dist', /*TODO: add package files, commit, tag */ 'bump:minor' /*TODO: add package files, commit, push*/ ]);
    grunt.registerTask('release-major', ['dist', /*TODO: add package files, commit, tag */ 'bump:major' /*TODO: add package files, commit, push*/ ]);
    //
    // Test tasks
    //
    // Test the source code
    grunt.registerTask('test', ['open:source', 'watch']);
    // Test the code in dist
    grunt.registerTask('test-dist', ['build-dist', 'open:dist', 'watch']);
    // Test the minified dist files
    grunt.registerTask('test-dist-min', ['build-dist', 'open:distmin', 'watch']);
    //
    // Headless test tasks
    //
    // Test the source code
    grunt.registerTask('test-headless', ['mocha:source']);
    // Test the code in dist
    grunt.registerTask('test-headless-dist', ['build-dist', 'mocha:dist']);
    // Test the minified dist files
    grunt.registerTask('test-headless-dist-min', ['build-dist', 'mocha:distmin']);

    grunt.registerTask('test-headless-all', ['mocha:all']);

    // Default task.
    grunt.registerTask('default', 'build');
};