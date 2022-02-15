/*global module:false*/
module.exports = function(grunt) {
    require('jit-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
        copy: {
            main: {
                files: [
                    {
                        // Copy the source files directly into the build folder
                        expand: true,
                        cwd: 'source/crests/',
                        src: ['*'], 
                        dest: 'build/crests'
                    }
                ],
                options: {
                    timestamp: true
                }
            },
        },
        image_resize: {
            resize120: {
                options: {
                    width: 120,
                    height: '',
                    overwrite: true
                },
                src: 'source/crests/*.png',
                dest: 'build/crests/120/'
            },
            resize60: {
                options: {
                    width: 60,
                    height: '',
                    overwrite: true
                },
                src: 'source/crests/*.png',
                dest: 'build/crests/60/'
            }
        },
        pngmin: {
            compile: {
                options: {
                    force: true,
                    quality: '45-85',
                    ext: '.png'
                },
                files: [{
                    expand: true,
                    src: '**/*.png',
                    cwd: 'build',
                    dest: 'build'
                }]
            }
        },
        aws_s3: {
            options: {
                awsProfile: 'frontend',
                region: 'us-east-1'
            },
            production: {
                options: {
                    bucket: 'aws-frontend-sport',
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**/*.png'],
                    dest: 'football'
                }]
            }
        },
    });

    // Tasks
    grunt.registerTask('default', ['copy', 'image_resize', 'pngmin', 'aws_s3']);

    grunt.registerTask('prepare', ['copy', 'image_resize', 'pngmin']);    
    grunt.registerTask('upload', ['aws_s3']);
    
};
