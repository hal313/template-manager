/**
 * @author: jghidiu
 * Email: jghidiu@paychex.com
 * Date: 2014-12-08
 */
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        bump: {
            options: {
                files: ['bower.json', 'package.json'],
                updateConfigs: [],
                commit: false, // true
                commitMessage: '-Tagged for release v%VERSION%',
                commitFiles: ['bower.json', 'package.json'],
                createTag: false,
                tagName: '%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false, // true
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false
            }
            // TODO: Get build and dist  working (build will not tag, dist will tag, release will tag and commit)
        },
        open: {
            dist: {
                // TODO: Set the watch URL
                // path: 'http://localhost:35729/'
                path: 'index.html'
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
                // TODO: Put the banner in the source, filter on copy to dest, use dest for source to minimize, add banner
//                banner: '/*! <%= pkg.name %*/',
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

    // TODO: release should run test (phantom?)
    // TODO: jshint in build/dist
    // TODO: Code coverage

    // Register tasks.
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // TODO: Does not work as intended
    grunt.registerTask('build', ['bump']);
    // grunt.registerTask('dist', ['bump']);
    grunt.registerTask('dist', ['build', 'copy:dist', 'uglify:dist', 'jshint:dist']);

    grunt.registerTask('test', ['open']);
    grunt.registerTask('test-dist', ['dist', 'open:dist', 'watch']);
    grunt.registerTask('test-build', ['open', 'watch']);

    //    grunt.registerTask('dist', ['bump:dist']);
    //    grunt.registerTask('dist', ['bump:release']);

    // Default task.
    grunt.registerTask('default', 'build');
};